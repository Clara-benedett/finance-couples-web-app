
import { Transaction } from '@/types/transaction';
import { supabase } from '@/lib/supabase';
import { categorizationRulesEngine } from '@/utils/categorizationRules';

export interface UserProfile {
  id: string;
  email: string;
  person1_name?: string;
  person2_name?: string;
  person1_percentage: number;
  person2_percentage: number;
  created_at: string;
}

class SupabaseTransactionStore {
  private transactions: Transaction[] = [];
  private listeners: (() => void)[] = [];
  private userProfile: UserProfile | null = null;

  async initialize(userId: string) {
    await this.loadUserProfile(userId);
    await this.loadTransactions(userId);
    this.setupRealtimeSubscription(userId);
  }

  private async loadUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user profile:', error);
      return;
    }

    if (!data) {
      // Create default profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          person1_percentage: 45,
          person2_percentage: 55,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return;
      }

      this.userProfile = newProfile;
    } else {
      this.userProfile = data;
    }
  }

  private async loadTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }

    this.transactions = data || [];
    this.notifyListeners();
  }

  private setupRealtimeSubscription(userId: string) {
    supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          this.loadTransactions(userId);
        }
      )
      .subscribe();
  }

  async addTransactions(newTransactions: Transaction[], userId: string, skipDuplicateCheck: boolean = false) {
    // Apply rules to new transactions before adding them (skip manual entries)
    const processedTransactions = categorizationRulesEngine.applyRulesToTransactions(
      newTransactions.filter(t => !t.isManualEntry)
    );
    
    // Manual entries are added as-is
    const manualEntries = newTransactions.filter(t => t.isManualEntry);
    
    const transactionsToAdd = [
      ...processedTransactions.map(result => ({
        ...result.transaction,
        user_id: userId,
      })),
      ...manualEntries.map(t => ({
        ...t,
        user_id: userId,
      }))
    ];

    const { error } = await supabase
      .from('transactions')
      .insert(transactionsToAdd);

    if (error) {
      console.error('Error adding transactions:', error);
      throw error;
    }

    // Log how many were auto-categorized (excluding manual entries)
    const autoAppliedCount = processedTransactions.filter(result => result.wasAutoApplied).length;
    if (autoAppliedCount > 0) {
      console.log(`Auto-categorized ${autoAppliedCount} transactions using existing rules`);
    }
  }

  async addManualTransaction(transaction: Transaction, userId: string) {
    // Apply rules to manual transaction if it's not already classified
    if (!transaction.isClassified && !transaction.isManualEntry) {
      const processedTransactions = categorizationRulesEngine.applyRulesToTransactions([transaction]);
      if (processedTransactions[0].wasAutoApplied) {
        transaction = processedTransactions[0].transaction;
      }
    }
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: userId,
      });

    if (error) {
      console.error('Error adding manual transaction:', error);
      throw error;
    }
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getUnclassifiedTransactions(): Transaction[] {
    return this.transactions.filter(t => !t.isClassified);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async clearAllData(userId: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing transactions:', error);
      throw error;
    }
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    if (this.userProfile) {
      this.userProfile = { ...this.userProfile, ...updates };
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  exportData() {
    return {
      transactions: this.transactions,
      profile: this.userProfile,
      exportDate: new Date().toISOString()
    };
  }

  getStorageInfo() {
    return {
      transactionCount: this.transactions.length,
      storageType: 'Supabase Database',
      profile: this.userProfile?.email || 'unknown'
    };
  }

  // Apply rules to existing unclassified transactions
  async applyRulesToExistingTransactions(userId: string): Promise<number> {
    const unclassified = this.getUnclassifiedTransactions();
    const processedTransactions = categorizationRulesEngine.applyRulesToTransactions(unclassified);
    
    let appliedCount = 0;
    for (const result of processedTransactions) {
      if (result.wasAutoApplied) {
        await this.updateTransaction(result.transaction.id, {
          category: result.transaction.category,
          isClassified: result.transaction.isClassified,
          autoAppliedRule: result.transaction.autoAppliedRule
        });
        appliedCount++;
      }
    }
    
    return appliedCount;
  }
}

export const supabaseTransactionStore = new SupabaseTransactionStore();
