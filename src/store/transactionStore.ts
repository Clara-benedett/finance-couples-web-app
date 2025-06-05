
import { Transaction } from '@/types/transaction';

// Simple in-memory store for transactions
class TransactionStore {
  private transactions: Transaction[] = [];
  private listeners: (() => void)[] = [];

  addTransactions(newTransactions: Transaction[]) {
    this.transactions.push(...newTransactions);
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
      this.notifyListeners();
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
