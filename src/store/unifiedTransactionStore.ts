import { Transaction } from '@/types/transaction';
import { supabase } from '@/lib/supabase';
import { categorizationRulesEngine } from '@/utils/categorizationRules';
import { findDuplicates } from '@/utils/duplicateDetection';
import { isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'expense_tracker_transactions';
const VERSION_KEY = 'expense_tracker_version';
const MIGRATION_KEY = 'migration_unified_v2';
const CURRENT_VERSION = '1.0';

/**
 * Unified Transaction Store - Single Source of Truth
 * Handles both localStorage and Supabase data, eliminating dual-store architecture
 */
class UnifiedTransactionStore {
  private transactions: Transaction[] = [];
  private listeners: (() => void)[] = [];
  private isInitialized = false;
  private user: any = null;

  constructor() {
    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('[UNIFIED] Initializing unified transaction store...');
    
    try {
      // Get current user for Supabase operations
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        this.user = user;
      }

      // Check if migration is needed
      const migrationComplete = localStorage.getItem(MIGRATION_KEY);
      
      if (!migrationComplete) {
        await this.migrateAllTransactionData();
      } else {
        await this.loadFromPrimarySource();
      }
      
      this.isInitialized = true;
      console.log(`[UNIFIED] Initialized with ${this.transactions.length} transactions`);
      this.notifyListeners();
    } catch (error) {
      console.error('[UNIFIED] Initialization failed:', error);
      // Fallback to localStorage
      this.loadFromLocalStorage();
      this.isInitialized = true;
    }
  }

  private async loadFromPrimarySource() {
    if (isSupabaseConfigured && this.user) {
      console.log('[UNIFIED] Loading from Supabase (primary)');
      await this.loadFromSupabase();
    } else {
      console.log('[UNIFIED] Loading from localStorage (primary)');
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          this.transactions = parsedData;
          console.log(`[UNIFIED] Loaded ${this.transactions.length} transactions from localStorage`);
          return parsedData;
        }
      }
    } catch (error) {
      console.error('[UNIFIED] Error loading from localStorage:', error);
    }
    return [];
  }

  private async loadFromSupabase(): Promise<Transaction[]> {
    if (!isSupabaseConfigured || !this.user) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', this.user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('[UNIFIED] Error loading from Supabase:', error);
        return [];
      }

      const transactions = data?.map(this.mapDatabaseToTransaction) || [];
      this.transactions = transactions;
      console.log(`[UNIFIED] Loaded ${transactions.length} transactions from Supabase`);
      return transactions;
    } catch (error) {
      console.error('[UNIFIED] Supabase load failed:', error);
      return [];
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
      bankCategory: dbTransaction.bank_category,
      transactionType: dbTransaction.transaction_type,
      location: dbTransaction.location,
      referenceNumber: dbTransaction.reference_number,
      autoAppliedRule: dbTransaction.auto_applied_rule,
      isManualEntry: dbTransaction.is_manual_entry,
      paymentMethod: dbTransaction.payment_method,
    };
  }

  private mapTransactionToDatabase(transaction: Transaction) {
    return {
      id: transaction.id,
      user_id: this.user?.id,
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      card_name: transaction.cardName,
      paid_by: transaction.paidBy,
      is_classified: transaction.isClassified,
      mcc_code: transaction.mccCode,
      bank_category: transaction.bankCategory,
      transaction_type: transaction.transactionType,
      location: transaction.location,
      reference_number: transaction.referenceNumber,
      auto_applied_rule: transaction.autoAppliedRule,
      is_manual_entry: transaction.isManualEntry,
      payment_method: transaction.paymentMethod,
    };
  }

  async migrateAllTransactionData() {
    console.log('🔄 [UNIFIED] Starting transaction data migration...');
    
    try {
      // 1. Collect from all possible sources
      const localStorageData = this.loadFromLocalStorage();
      const supabaseData = await this.loadFromSupabase();
      
      console.log(`📊 [UNIFIED] Found data sources:`, {
        localStorage: localStorageData.length,
        supabase: supabaseData.length
      });
      
      // 2. Merge and deduplicate
      const allTransactions = [...localStorageData, ...supabaseData];
      const uniqueTransactions = this.deduplicateTransactions(allTransactions);
      
      console.log(`✅ [UNIFIED] Consolidated ${allTransactions.length} → ${uniqueTransactions.length} unique transactions`);
      
      // 3. Save to unified store
      this.transactions = uniqueTransactions;
      await this.persistToAll();
      
      // 4. Mark migration complete
      localStorage.setItem(MIGRATION_KEY, 'complete');
      
      console.log('✅ [UNIFIED] Migration complete!');
      return uniqueTransactions;
    } catch (error) {
      console.error('❌ [UNIFIED] Migration failed:', error);
      throw error;
    }
  }

  private deduplicateTransactions(transactions: Transaction[]): Transaction[] {
    const seen = new Map();
    const unique: Transaction[] = [];
    
    transactions.forEach(t => {
      const key = `${t.date}-${t.amount}-${t.description}-${t.cardName}`;
      if (!seen.has(key)) {
        seen.set(key, true);
        unique.push(t);
      }
    });
    
    return unique;
  }

  private async persistToAll() {
    // Always save to localStorage for offline access
    this.saveToLocalStorage();
    
    // Save to Supabase if available and user is authenticated
    if (isSupabaseConfigured && this.user) {
      await this.saveToSupabase();
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (error) {
      console.error('[UNIFIED] Error saving to localStorage:', error);
    }
  }

  private async saveToSupabase() {
    if (!isSupabaseConfigured || !this.user) return;

    try {
      // Clear existing data for this user
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', this.user.id);

      // Insert all transactions
      if (this.transactions.length > 0) {
        const dbTransactions = this.transactions.map(t => this.mapTransactionToDatabase(t));
        
        const { error } = await supabase
          .from('transactions')
          .insert(dbTransactions);

        if (error) {
          console.error('[UNIFIED] Error saving to Supabase:', error);
        } else {
          console.log(`[UNIFIED] Saved ${this.transactions.length} transactions to Supabase`);
        }
      }
    } catch (error) {
      console.error('[UNIFIED] Supabase save failed:', error);
    }
  }

  // PUBLIC API - Same as existing stores for compatibility
  async getTransactions(): Promise<Transaction[]> {
    await this.waitForInitialization();
    console.log(`[UNIFIED] Returning ${this.transactions.length} transactions`);
    return [...this.transactions];
  }

  async addTransactions(newTransactions: Transaction[], skipDuplicateCheck: boolean = false) {
    await this.waitForInitialization();
    
    console.log(`[UNIFIED] Adding ${newTransactions.length} new transactions`);
    
    // Apply rules to new transactions before adding them
    const processedTransactions = categorizationRulesEngine.applyRulesToTransactions(
      newTransactions.filter(t => !t.isManualEntry)
    );
    
    const manualEntries = newTransactions.filter(t => t.isManualEntry);
    const transactionsToAdd = [
      ...processedTransactions.map(result => result.transaction),
      ...manualEntries
    ];

    this.transactions.push(...transactionsToAdd);
    await this.persistToAll();
    this.notifyListeners();

    const autoAppliedCount = processedTransactions.filter(result => result.wasAutoApplied).length;
    if (autoAppliedCount > 0) {
      console.log(`[UNIFIED] Auto-categorized ${autoAppliedCount} transactions using existing rules`);
    }
  }

  async addManualTransaction(transaction: Transaction) {
    await this.waitForInitialization();
    
    // Apply rules if not already classified
    if (!transaction.isClassified && !transaction.isManualEntry) {
      const processedTransactions = categorizationRulesEngine.applyRulesToTransactions([transaction]);
      if (processedTransactions[0].wasAutoApplied) {
        transaction = processedTransactions[0].transaction;
      }
    }
    
    this.transactions.push(transaction);
    await this.persistToAll();
    this.notifyListeners();
  }

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    await this.waitForInitialization();
    
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      await this.persistToAll();
      this.notifyListeners();
    }
  }

  async deleteTransactions(ids: string[]): Promise<boolean> {
    await this.waitForInitialization();
    
    const initialCount = this.transactions.length;
    this.transactions = this.transactions.filter(t => !ids.includes(t.id));
    const deletedCount = initialCount - this.transactions.length;
    
    if (deletedCount > 0) {
      await this.persistToAll();
      this.notifyListeners();
      console.log(`[UNIFIED] Deleted ${deletedCount} transactions`);
      return true;
    }
    
    return false;
  }

  async getUnclassifiedTransactions(): Promise<Transaction[]> {
    await this.waitForInitialization();
    return this.transactions.filter(t => !t.isClassified);
  }

  async applyRulesToExistingTransactions(): Promise<number> {
    await this.waitForInitialization();
    
    const unclassified = this.transactions.filter(t => !t.isClassified);
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

  checkForDuplicates(newTransactions: any[]) {
    return findDuplicates(newTransactions, this.transactions);
  }

  async clearAllData() {
    await this.waitForInitialization();
    
    this.transactions = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    localStorage.removeItem(MIGRATION_KEY);
    
    if (isSupabaseConfigured && this.user) {
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', this.user.id);
    }
    
    this.notifyListeners();
    console.log('[UNIFIED] All data cleared');
  }

  exportData() {
    return {
      transactions: this.transactions,
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString()
    };
  }

  getStorageInfo() {
    const storageType = isSupabaseConfigured && this.user ? 'Supabase + localStorage' : 'localStorage';
    return {
      transactionCount: this.transactions.length,
      storageSize: storageType,
      version: CURRENT_VERSION
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

  async waitForInitialization(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // Verification method for debugging
  async getVerificationInfo() {
    await this.waitForInitialization();
    return {
      transactionCount: this.transactions.length,
      storageSource: 'unified',
      timestamp: new Date().toISOString(),
      sampleTransaction: this.transactions[0],
      user: this.user?.email || 'anonymous'
    };
  }
}

export const unifiedTransactionStore = new UnifiedTransactionStore();

// Global debug function
(window as any).debugUnifiedStore = async () => {
  const info = await unifiedTransactionStore.getVerificationInfo();
  console.log('🔍 [DEBUG] Unified Store Info:', info);
  return info;
};
