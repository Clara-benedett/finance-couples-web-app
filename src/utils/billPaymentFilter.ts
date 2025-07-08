import { Transaction } from "@/types/transaction";

/**
 * Identifies if a transaction is a bill payment that should be excluded from categorization
 */
export function isBillPayment(transaction: Transaction): boolean {
  const description = transaction.description.toLowerCase();
  const amount = parseFloat(transaction.amount.toString());
  
  // Filter criteria for bill payments
  const billPaymentIndicators = [
    'mobile payment',
    'thank you',
    'bill pay payment',
    'payment received',
    'autopay',
    'online payment',
    'electronic payment',
    'payment to',
    'transfer to',
    'payment thank you'
  ];
  
  // Check if description contains bill payment indicators AND amount is negative
  return amount < 0 && billPaymentIndicators.some(indicator => 
    description.includes(indicator)
  );
}

/**
 * Filters transactions to exclude bill payments from categorization
 */
export function filterTransactionsForCategorization(transactions: Transaction[]): Transaction[] {
  return transactions.filter(transaction => {
    // Exclude bill payments
    if (isBillPayment(transaction)) {
      console.log(`Excluded bill payment: ${transaction.description} (${transaction.amount})`);
      return false;
    }
    
    // Include all other transactions
    return true;
  });
}

/**
 * Gets only the bill payment transactions
 */
export function getBillPaymentTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(isBillPayment);
}