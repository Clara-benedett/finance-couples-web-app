
import { Transaction } from '@/types/transaction';
import { getCategoryNames } from './categoryNames';

export interface ProportionSettings {
  person1Percentage: number;
  person2Percentage: number;
}

export interface CalculationResults {
  person1Individual: number;
  person2Individual: number;
  sharedTotal: number;
  person1ShareOfShared: number;
  person2ShareOfShared: number;
  person1TotalOwed: number;
  person2TotalOwed: number;
  finalAmountOwed: number;
  whoOwesWho: 'person1' | 'person2';
  totalSpending: number;
  categoryBreakdown: {
    person1: Transaction[];
    person2: Transaction[];
    shared: Transaction[];
    unclassified: Transaction[];
  };
}

const PROPORTION_STORAGE_KEY = 'expenseProportions';

export const getDefaultProportions = (): ProportionSettings => ({
  person1Percentage: 45,
  person2Percentage: 55,
});

export const getProportionSettings = (): ProportionSettings => {
  const saved = localStorage.getItem(PROPORTION_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultProportions();
    }
  }
  return getDefaultProportions();
};

export const saveProportionSettings = (proportions: ProportionSettings): void => {
  localStorage.setItem(PROPORTION_STORAGE_KEY, JSON.stringify(proportions));
};

export const calculateExpenses = (
  transactions: Transaction[],
  proportions?: ProportionSettings
): CalculationResults => {
  const props = proportions || getProportionSettings();
  
  // Categorize transactions
  const person1Transactions = transactions.filter(t => t.category === 'person1');
  const person2Transactions = transactions.filter(t => t.category === 'person2');
  const sharedTransactions = transactions.filter(t => t.category === 'shared');
  const unclassifiedTransactions = transactions.filter(t => t.category === 'UNCLASSIFIED');

  // Calculate individual totals
  const person1Individual = person1Transactions.reduce((sum, t) => sum + t.amount, 0);
  const person2Individual = person2Transactions.reduce((sum, t) => sum + t.amount, 0);
  const sharedTotal = sharedTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate shares of shared expenses
  const person1ShareOfShared = (sharedTotal * props.person1Percentage) / 100;
  const person2ShareOfShared = (sharedTotal * props.person2Percentage) / 100;

  // Calculate total amounts each person is responsible for
  const person1TotalOwed = person1Individual + person1ShareOfShared;
  const person2TotalOwed = person2Individual + person2ShareOfShared;

  // Calculate final amount and direction
  const finalAmountOwed = Math.abs(person1TotalOwed - person2TotalOwed);
  const whoOwesWho = person1TotalOwed > person2TotalOwed ? 'person1' : 'person2';

  const totalSpending = person1Individual + person2Individual + sharedTotal;

  return {
    person1Individual,
    person2Individual,
    sharedTotal,
    person1ShareOfShared,
    person2ShareOfShared,
    person1TotalOwed,
    person2TotalOwed,
    finalAmountOwed,
    whoOwesWho,
    totalSpending,
    categoryBreakdown: {
      person1: person1Transactions,
      person2: person2Transactions,
      shared: sharedTransactions,
      unclassified: unclassifiedTransactions,
    },
  };
};
