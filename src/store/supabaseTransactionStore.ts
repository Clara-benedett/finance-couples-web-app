import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/transaction';
import { categorizationRulesEngine } from '@/utils/categorizationRules';
import { findDuplicates } from '@/utils/duplicateDetection';

export interface ProportionSettings {
  person1_percentage: number;
  person2_percentage: number;
}

// Since we have Supabase configured, this is always true
const isSupabaseConfigured = true;

class SupabaseTransactionStore {
  private transactions: Transaction[] = [];
  private listeners: (() => void)[] = [];
  private isInitialized = false;
  public user: any = null;

  constructor() {
    this.initializeStore();
  }

  private async initializeStore() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
      
      if (user) {
        await this.loadFromDatabase();
      } else {
        // Only fallback to localStorage if no user is authenticated
        this.loadFromLocalStorage();
      }
      this.isInitialized = true;
      this.notifyListeners(); // Notify after initialization
    } catch (error) {
      console.error('Error initializing Supabase store:', error);
      this.loadFromLocalStorage();
    }
  }

  private async loadFromDatabase() {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
    
    if (!user) {
      console.log('No authenticated user, skipping database load');
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading transactions from database:', error);
      return;
    }

    this.transactions = data?.map(this.mapDatabaseToTransaction) || [];
    console.log(`Loaded ${this.transactions.length} transactions from database for user ${user.email}`);
  }

  private loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('expense_tracker_transactions');
      if (data) {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          this.transactions = parsedData;
          console.log(`Loaded ${this.transactions.length} transactions from localStorage`);
        }
      }
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
      this.transactions = [];
    }
  }

  private mapDatabaseToTransaction(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      date: dbTransaction.date,
      amount: parseFloat(dbTransaction.amount),
      description: dbTransaction.description,
      category: dbTransaction.category,
      cardName: dbTransaction.card_name,
      paidBy: dbTransaction.paid_by,
      isClassified: dbTransaction.is_classified,
      mccCode: dbTransaction.mcc_code,
      transactionType: dbTransaction.transaction_type,
      location: dbTransaction.location,
      referenceNumber: dbTransaction.reference_number,
      autoAppliedRule: dbTransaction.auto_applied_rule,
      isManualEntry: dbTransaction.is_manual_entry,
      paymentMethod: dbTransaction.payment_method,
      cardMember: dbTransaction.card_member,
      accountNumber: dbTransaction.account_number,
      isPaid: dbTransaction.is_paid,
      markedPaidAt: dbTransaction.marked_paid_at,
    };
  }

  private mapTransactionToDatabase(transaction: Transaction, userId: string) {
    return {
      id: transaction.id,
      user_id: userId,
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      card_name: transaction.cardName,
      paid_by: transaction.paidBy,
      is_classified: transaction.isClassified,
      mcc_code: transaction.mccCode,
      transaction_type: transaction.transactionType,
      location: transaction.location,
      reference_number: transaction.referenceNumber,
      auto_applied_rule: transaction.autoAppliedRule,
      is_manual_entry: transaction.isManualEntry,
      payment_method: transaction.paymentMethod,
      card_member: transaction.cardMember,
      account_number: transaction.accountNumber,
      is_paid: transaction.isPaid,
      marked_paid_at: transaction.markedPaidAt,
    };
  }

  async addTransactions(newTransactions: Transaction[], skipDuplicateCheck: boolean = false) {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
    
    if (!user) {
      console.warn('No authenticated user - transactions should not be added without authentication');
      return;
    }

    // Apply rules to new transactions before adding them
    const processedTransactions = categorizationRulesEngine.applyRulesToTransactions(
      newTransactions.filter(t => !t.isManualEntry)
    );
    
    const manualEntries = newTransactions.filter(t => t.isManualEntry);
    const transactionsToAdd = [
      ...processedTransactions.map(result => result.transaction),
      ...manualEntries
    ];

    try {
      const dbTransactions = transactionsToAdd.map(t => this.mapTransactionToDatabase(t, user.id));
      
      const { error } = await supabase
        .from('transactions')
        .insert(dbTransactions);

      if (error) {
        console.error('Error inserting transactions:', error);
        return;
      }

      this.transactions.push(...transactionsToAdd);
      this.notifyListeners();

      const autoAppliedCount = processedTransactions.filter(result => result.wasAutoApplied).length;
      if (autoAppliedCount > 0) {
        console.log(`Auto-categorized ${autoAppliedCount} transactions using existing rules`);
      }
    } catch (error) {
      console.error('Error adding transactions to database:', error);
    }
  }

  private addTransactionsLocal(newTransactions: Transaction[], skipDuplicateCheck: boolean = false) {
    const processedTransactions = categorizationRulesEngine.applyRulesToTransactions(
      newTransactions.filter(t => !t.isManualEntry)
    );
    
    const manualEntries = newTransactions.filter(t => t.isManualEntry);
    const transactionsToAdd = [
      ...processedTransactions.map(result => result.transaction),
      ...manualEntries
    ];
    
    this.transactions.push(...transactionsToAdd);
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('expense_tracker_transactions', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }

  checkForDuplicates(newTransactions: any[]) {
    return findDuplicates(newTransactions, this.transactions);
  }

  async addManualTransaction(transaction: Transaction) {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
    
    if (!user) {
      console.warn('No authenticated user - manual transactions should not be added without authentication');
      return;
    }

    try {
      const dbTransaction = this.mapTransactionToDatabase(transaction, user.id);
      
      const { error } = await supabase
        .from('transactions')
        .insert([dbTransaction]);

      if (error) {
        console.error('Error inserting manual transaction:', error);
        return;
      }

      this.transactions.push(transaction);
      this.notifyListeners();
    } catch (error) {
      console.error('Error adding manual transaction to database:', error);
    }
  }

  private addManualTransactionLocal(transaction: Transaction) {
    if (!transaction.isClassified && !transaction.isManualEntry) {
      const processedTransactions = categorizationRulesEngine.applyRulesToTransactions([transaction]);
      if (processedTransactions[0].wasAutoApplied) {
        transaction = processedTransactions[0].transaction;
      }
    }
    
    this.transactions.push(transaction);
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  async waitForInitialization(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  getUnclassifiedTransactions(): Transaction[] {
    return this.transactions.filter(t => !t.isClassified);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
    
    if (!user) {
      console.warn('No authenticated user - transactions should not be updated without authentication');
      return;
    }

    try {
      const dbUpdates = {
        category: updates.category,
        is_classified: updates.isClassified,
        auto_applied_rule: updates.autoAppliedRule,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('transactions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating transaction:', error);
        return;
      }

      const index = this.transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        this.transactions[index] = { ...this.transactions[index], ...updates };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error updating transaction in database:', error);
    }
  }

  private updateTransactionLocal(id: string, updates: Partial<Transaction>) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      this.saveToLocalStorage();
      this.notifyListeners();
    }
  }

  async clearTransactions() {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
    
    if (!user) {
      console.warn('No authenticated user - transactions should not be cleared without authentication');
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing transactions:', error);
        return;
      }

      this.transactions = [];
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing transactions from database:', error);
    }
  }

  async clearAllData() {
    await this.clearTransactions();
    localStorage.removeItem('expense_tracker_transactions');
    localStorage.removeItem('expense_tracker_version');
  }

  exportData() {
    return {
      transactions: this.transactions,
      version: '1.0',
      exportDate: new Date().toISOString()
    };
  }

  getStorageInfo() {
    return {
      transactionCount: this.transactions.length,
      storageSize: isSupabaseConfigured ? 'Database' : 'Local Storage',
      version: '1.0'
    };
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

  async applyRulesToExistingTransactions(): Promise<number> {
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

  async markTransactionsAsPaid(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
    
    if (!user) {
      console.warn('No authenticated user - cannot mark transactions as paid');
      return false;
    }

    try {
      // Get all unpaid transactions
      const unpaidTransactions = this.transactions.filter(t => !t.isPaid);
      
      if (unpaidTransactions.length === 0) {
        console.log('No unpaid transactions to mark as paid');
        return true;
      }

      const settleTimestamp = new Date().toISOString();
      
      // Update all unpaid transactions to paid with the same timestamp
      const { error } = await supabase
        .from('transactions')
        .update({
          is_paid: true,
          marked_paid_at: settleTimestamp,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_paid', false);

      if (error) {
        console.error('Error marking transactions as paid:', error);
        return false;
      }

      // Update local state
      this.transactions = this.transactions.map(t => 
        !t.isPaid ? {
          ...t,
          isPaid: true,
          markedPaidAt: settleTimestamp
        } : t
      );
      
      this.notifyListeners();
      console.log(`Marked ${unpaidTransactions.length} transactions as paid`);
      return true;
    } catch (error) {
      console.error('Error marking transactions as paid:', error);
      return false;
    }
  }

  getUnpaidTransactions(): Transaction[] {
    return this.transactions.filter(t => !t.isPaid);
  }

  getPaidTransactions(): Transaction[] {
    return this.transactions.filter(t => t.isPaid);
  }

  // Method to migrate localStorage data to database
  async migrateLocalStorageToDatabase(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      const localData = localStorage.getItem('expense_tracker_transactions');
      if (!localData) return true; // No data to migrate

      const localTransactions = JSON.parse(localData);
      if (!Array.isArray(localTransactions) || localTransactions.length === 0) {
        return true; // No valid data to migrate
      }

      // Check if user already has transactions in database
      const { data: existingTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingTransactions && existingTransactions.length > 0) {
        console.log('User already has transactions in database, skipping migration');
        return true;
      }

      // Migrate data
      const dbTransactions = localTransactions.map((t: Transaction) => 
        this.mapTransactionToDatabase(t, user.id)
      );

      const { error } = await supabase
        .from('transactions')
        .insert(dbTransactions);

      if (error) {
        console.error('Error migrating data to database:', error);
        return false;
      }

      console.log(`Successfully migrated ${localTransactions.length} transactions to database`);
      
      // Clear localStorage after successful migration
      localStorage.removeItem('expense_tracker_transactions');
      localStorage.removeItem('expense_tracker_version');
      
      // Reload data from database
      await this.loadFromDatabase();
      
      return true;
    } catch (error) {
      console.error('Error during migration:', error);
      return false;
    }
  }

  // Methods for proportion settings
  async getProportionSettings(): Promise<ProportionSettings> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
      
      if (!user) {
        return { person1_percentage: 50, person2_percentage: 50 };
      }

      const { data, error } = await supabase
        .from('proportion_settings')
        .select('person1_percentage, person2_percentage')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to load proportion settings: ${error.message}`);
      }

      return data || { person1_percentage: 50, person2_percentage: 50 };
    } catch (error) {
      console.error('Operation failed:', error);
      return { person1_percentage: 50, person2_percentage: 50 };
    }
  }

  async saveProportionSettings(settings: ProportionSettings): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('proportion_settings')
        .upsert({
          user_id: user.id,
          person1_percentage: settings.person1_percentage,
          person2_percentage: settings.person2_percentage,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to save proportion settings: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Operation failed:', error);
      return false;
    }
  }

  async saveCategoryNames(person1Name: string, person2Name: string, sharedName?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const updateData: any = {
        person1_name: person1Name,
        person2_name: person2Name,
        updated_at: new Date().toISOString(),
      };

      if (sharedName !== undefined) {
        updateData.shared_name = sharedName;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to save category names: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Operation failed:', error);
      return false;
    }
  }

  async getCategoryNames(): Promise<{ person1_name: string | null; person2_name: string | null; shared_name: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { person1_name: null, person2_name: null, shared_name: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('person1_name, person2_name, shared_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to load category names: ${error.message}`);
      }

      return data || { person1_name: null, person2_name: null, shared_name: null };
    } catch (error) {
      console.error('Operation failed:', error);
      return { person1_name: null, person2_name: null, shared_name: null };
    }
  }
}

export const supabaseTransactionStore = new SupabaseTransactionStore();
