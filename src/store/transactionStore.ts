
import { Transaction } from '@/types/transaction';

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

  addTransactions(newTransactions: Transaction[]) {
    this.transactions.push(...newTransactions);
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
}

export const transactionStore = new TransactionStore();
