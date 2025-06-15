
export interface DuplicateMatch {
  newTransaction: {
    date: string;
    amount: number;
    description: string;
    cardName: string;
    index: number; // Index in the new transactions array
  };
  existingTransaction: {
    id: string;
    date: string;
    amount: number;
    description: string;
    cardName: string;
  };
}

export interface DuplicateDetectionResult {
  duplicates: DuplicateMatch[];
  uniqueTransactions: any[]; // Transactions that are not duplicates
}

export interface DuplicateReviewDecision {
  duplicateIndex: number;
  shouldInclude: boolean;
}
