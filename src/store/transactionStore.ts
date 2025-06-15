import { Transaction } from '@/types/transaction';
import { categorizationRulesEngine } from '@/utils/categorizationRules';

const STORAGE_KEY = 'expense_tracker_transactions';
const VERSION_KEY = 'expense_tracker_version';
const CURRENT_VERSION = '1.0';

// Simple in-memory store for transactions with localStorage persistence
class TransactionStore {
  private transactions: Transaction[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const version = localStorage.getItem(VERSION_KEY);
      const data = localStorage.getItem(STORAGE_KEY);
      
      if (data) {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) {
          this.transactions = parsedData;
          console.log(`Loaded ${this.transactions.length} transactions from localStorage`);
        }
      }
      
      // Set version if not exists
      if (!version) {
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      }
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
      this.transactions = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }

  addTransactions(newTransactions: Transaction[], skipDuplicateCheck: boolean = false) {
    // Apply rules to new transactions before adding them (skip manual entries)
    const processedTransactions = categorizationRulesEngine.applyRulesToTransactions(
      newTransactions.filter(t => !t.isManualEntry)
    );
    
    // Manual entries are added as-is
    const manualEntries = newTransactions.filter(t => t.isManualEntry);
    
    const transactionsToAdd = [
      ...processedTransactions.map(result => result.transaction),
      ...manualEntries
    ];
    
    this.transactions.push(...transactionsToAdd);
    this.saveToStorage();
    this.notifyListeners();
    
    // Log how many were auto-categorized (excluding manual entries)
    const autoAppliedCount = processedTransactions.filter(result => result.wasAutoApplied).length;
    if (autoAppliedCount > 0) {
      console.log(`Auto-categorized ${autoAppliedCount} transactions using existing rules`);
    }
  }

  checkForDuplicates(newTransactions: any[]) {
    // Import here to avoid circular dependencies
    const { findDuplicates } = require('@/utils/duplicateDetection');
    return findDuplicates(newTransactions, this.transactions);
  }

  addManualTransaction(transaction: Transaction) {
    // Apply rules to manual transaction if it's not already classified
    if (!transaction.isClassified && !transaction.isManualEntry) {
      const processedTransactions = categorizationRulesEngine.applyRulesToTransactions([transaction]);
      if (processedTransactions[0].wasAutoApplied) {
        transaction = processedTransactions[0].transaction;
      }
    }
    
    this.transactions.push(transaction);
    this.saveToStorage();
    this.notifyListeners();
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getUnclassifiedTransactions(): Transaction[] {
    return this.transactions.filter(t => !t.isClassified);
  }

  updateTransaction(id: string, updates: Partial<Transaction>) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  clearTransactions() {
    this.transactions = [];
    this.notifyListeners();
  }

  clearAllData() {
    this.transactions = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    this.notifyListeners();
  }

  exportData() {
    return {
      transactions: this.transactions,
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString()
    };
  }

  getStorageInfo() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const sizeInBytes = data ? new Blob([data]).size : 0;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      
      return {
        transactionCount: this.transactions.length,
        storageSize: `${sizeInKB} KB`,
        version: localStorage.getItem(VERSION_KEY) || 'unknown'
      };
    } catch (error) {
      return {
        transactionCount: this.transactions.length,
        storageSize: 'unknown',
        version: 'unknown'
      };
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

  // New method to apply rules to existing unclassified transactions
  applyRulesToExistingTransactions(): number {
    const unclassified = this.getUnclassifiedTransactions();
    const processedTransactions = categorizationRulesEngine.applyRulesToTransactions(unclassified);
    
    let appliedCount = 0;
    processedTransactions.forEach(result => {
      if (result.wasAutoApplied) {
        this.updateTransaction(result.transaction.id, {
          category: result.transaction.category,
          isClassified: result.transaction.isClassified,
          autoAppliedRule: result.transaction.autoAppliedRule
        });
        appliedCount++;
      }
    });
    
    return appliedCount;
  }
}

export const transactionStore = new TransactionStore();
