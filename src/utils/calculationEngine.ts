import { Transaction } from '@/types/transaction';
import { getCategoryNames } from './categoryNames';

export interface ProportionSettings {
  person1Percentage: number;
  person2Percentage: number;
}

export interface CalculationResults {
  // What each person SHOULD pay based on categorization
  person1ShouldPay: number;
  person2ShouldPay: number;
  
  // What each person ACTUALLY paid (their card bills)
  person1ActuallyPaid: number;
  person2ActuallyPaid: number;
  
  // Net positions (positive = owes money, negative = owed money)
  person1NetPosition: number;
  person2NetPosition: number;
  
  // Final settlement
  finalSettlementAmount: number;
  settlementDirection: 'person1ToPerson2' | 'person2ToPerson1';
  
  // Breakdown details
  person1Individual: number;
  person2Individual: number;
  sharedTotal: number;
  person1ShareOfShared: number;
  person2ShareOfShared: number;
  
  // Keep existing fields for compatibility
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
  person1Percentage: 50,
  person2Percentage: 50,
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
  
  // Categorize transactions by expense category
  const person1Transactions = transactions.filter(t => t.category === 'person1');
  const person2Transactions = transactions.filter(t => t.category === 'person2');
  const sharedTransactions = transactions.filter(t => t.category === 'shared');
  const unclassifiedTransactions = transactions.filter(t => t.category === 'UNCLASSIFIED');

  // Calculate individual and shared totals
  const person1Individual = person1Transactions.reduce((sum, t) => sum + t.amount, 0);
  const person2Individual = person2Transactions.reduce((sum, t) => sum + t.amount, 0);
  const sharedTotal = sharedTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate shares of shared expenses
  const person1ShareOfShared = (sharedTotal * props.person1Percentage) / 100;
  const person2ShareOfShared = (sharedTotal * props.person2Percentage) / 100;

  // STEP 1: Calculate what each person SHOULD pay based on categorization
  const person1ShouldPay = person1Individual + person1ShareOfShared;
  const person2ShouldPay = person2Individual + person2ShareOfShared;

  // STEP 2: Calculate what each person ACTUALLY paid (their credit card bills)
  const person1ActuallyPaid = transactions
    .filter(t => t.paidBy === 'person1')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const person2ActuallyPaid = transactions
    .filter(t => t.paidBy === 'person2')
    .reduce((sum, t) => sum + t.amount, 0);

  // STEP 3: Calculate net positions and final settlement
  const person1NetPosition = person1ShouldPay - person1ActuallyPaid;
  const person2NetPosition = person2ShouldPay - person2ActuallyPaid;

  // Final settlement calculation
  // The net position already represents the correct amount owed
  const finalSettlementAmount = Math.abs(person1NetPosition);
  const settlementDirection = person1NetPosition > 0 ? 'person1ToPerson2' : 'person2ToPerson1';

  // Legacy compatibility fields
  const person1TotalOwed = person1ShouldPay;
  const person2TotalOwed = person2ShouldPay;
  const finalAmountOwed = finalSettlementAmount;
  const whoOwesWho = settlementDirection === 'person1ToPerson2' ? 'person1' : 'person2';

  const totalSpending = person1Individual + person2Individual + sharedTotal;

  return {
    // New calculation fields
    person1ShouldPay,
    person2ShouldPay,
    person1ActuallyPaid,
    person2ActuallyPaid,
    person1NetPosition,
    person2NetPosition,
    finalSettlementAmount,
    settlementDirection,
    
    // Breakdown details
    person1Individual,
    person2Individual,
    sharedTotal,
    person1ShareOfShared,
    person2ShareOfShared,
    
    // Legacy compatibility fields
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
