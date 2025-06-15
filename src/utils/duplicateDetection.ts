
import { Transaction } from "@/types/transaction";
import { DuplicateMatch, DuplicateDetectionResult } from "@/types/duplicateDetection";

export const findDuplicates = (
  newTransactions: any[],
  existingTransactions: Transaction[]
): DuplicateDetectionResult => {
  const duplicates: DuplicateMatch[] = [];
  const uniqueTransactions: any[] = [];

  newTransactions.forEach((newTx, index) => {
    // Check for exact match: date, amount, description
    const isDuplicate = existingTransactions.some(existingTx => {
      return (
        existingTx.date === newTx.date &&
        existingTx.amount === newTx.amount &&
        existingTx.description.trim().toLowerCase() === newTx.description.trim().toLowerCase()
      );
    });

    if (isDuplicate) {
      // Find the matching existing transaction for details
      const matchingTransaction = existingTransactions.find(existingTx => 
        existingTx.date === newTx.date &&
        existingTx.amount === newTx.amount &&
        existingTx.description.trim().toLowerCase() === newTx.description.trim().toLowerCase()
      );

      if (matchingTransaction) {
        duplicates.push({
          newTransaction: {
            date: newTx.date,
            amount: newTx.amount,
            description: newTx.description,
            cardName: newTx.cardName || 'Unknown',
            index
          },
          existingTransaction: {
            id: matchingTransaction.id,
            date: matchingTransaction.date,
            amount: matchingTransaction.amount,
            description: matchingTransaction.description,
            cardName: matchingTransaction.cardName
          }
        });
      }
    } else {
      uniqueTransactions.push(newTx);
    }
  });

  return {
    duplicates,
    uniqueTransactions
  };
};
