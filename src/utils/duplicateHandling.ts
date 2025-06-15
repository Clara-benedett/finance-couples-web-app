
import { transactionStore } from "@/store/transactionStore";
import { DuplicateReviewDecision } from "@/types/duplicateDetection";
import { CardInfo, DuplicateReviewState } from "@/types/upload";

export const handleDuplicateDetection = (
  allParsedTransactions: any[],
  cardInfos: CardInfo[]
): { hasDuplicates: boolean; duplicateResult?: any } => {
  const duplicateResult = transactionStore.checkForDuplicates(allParsedTransactions);
  
  if (duplicateResult.duplicates.length > 0) {
    return {
      hasDuplicates: true,
      duplicateResult: {
        duplicates: duplicateResult.duplicates,
        pendingTransactions: allParsedTransactions,
        cardInfos
      }
    };
  }
  
  return { hasDuplicates: false };
};

export const processDuplicateDecisions = (
  decisions: DuplicateReviewDecision[],
  duplicateReview: DuplicateReviewState
) => {
  const { duplicates, pendingTransactions } = duplicateReview;
  
  // Include selected duplicates with the unique transactions
  const selectedDuplicateTransactions = decisions
    .filter(decision => decision.shouldInclude)
    .map(decision => pendingTransactions[duplicates[decision.duplicateIndex].newTransaction.index]);
  
  // Get unique transactions (non-duplicates)
  const uniqueTransactions = pendingTransactions.filter((_, index) => 
    !duplicates.some(dup => dup.newTransaction.index === index)
  );
  
  const transactionsToUpload = [...uniqueTransactions, ...selectedDuplicateTransactions];
  const skippedCount = duplicates.length - selectedDuplicateTransactions.length;
  
  return { transactionsToUpload, skippedCount, totalDuplicates: duplicates.length };
};
