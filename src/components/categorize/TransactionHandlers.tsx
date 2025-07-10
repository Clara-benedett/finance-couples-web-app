
import { Transaction } from "@/types/transaction";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { categorizationRulesEngine } from "@/utils/categorizationRules";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { useToast } from "@/hooks/use-toast";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

export const useTransactionHandlers = (
  transactions: Transaction[],
  setRuleSuggestion: (suggestion: {
    merchantName: string;
    category: CategoryType;
    categoryDisplayName: string;
  } | null) => void
) => {
  const { categoryNames } = useCategoryNames();
  const { toast } = useToast();

  const handleUpdateTransaction = async (id: string, category: CategoryType) => {
    // Map the category types to the transaction store format
    const categoryMap: Record<CategoryType, string> = {
      person1: 'person1',
      person2: 'person2', 
      shared: 'shared',
      UNCLASSIFIED: 'UNCLASSIFIED'
    };

    // Find the transaction to get merchant name
    const transaction = transactions.find(t => t.id === id);
    if (transaction && category !== 'UNCLASSIFIED') {
      // Track this categorization
      categorizationRulesEngine.trackCategorization(transaction.description, categoryMap[category]);
      
      // Only suggest rule for manual categorizations (automatic suggestion after 3+ times)
      if (categorizationRulesEngine.shouldSuggestRule(transaction.description, categoryMap[category])) {
        setRuleSuggestion({
          merchantName: transaction.description,
          category,
          categoryDisplayName: category === 'person1' ? categoryNames.person1 : 
                              category === 'person2' ? categoryNames.person2 : 
                              categoryNames.shared
        });
      }
    }

    // Update transaction and clear autoAppliedRule flag when manually categorizing
    await unifiedTransactionStore.updateTransaction(id, { 
      category: categoryMap[category],
      isClassified: category !== 'UNCLASSIFIED',
      autoAppliedRule: false // Clear auto-applied flag to indicate manual override
    });
  };

  const handleBulkUpdate = async (ids: string[], category: CategoryType) => {
    for (const id of ids) {
      await handleUpdateTransaction(id, category);
    }
  };

  const handleRequestRuleSuggestion = (merchantName: string, category: CategoryType, categoryDisplayName: string) => {
    // Show the rule suggestion modal when requested by the auto-rule button
    setRuleSuggestion({
      merchantName,
      category,
      categoryDisplayName
    });
  };

  const handleDeleteSelected = (
    selectedTransactions: Set<string>,
    setShowDeleteConfirmation: (show: boolean) => void
  ) => {
    console.log('Delete selected called with:', selectedTransactions.size, 'transactions');
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async (
    selectedTransactions: Set<string>,
    setSelectedTransactions: (selection: Set<string>) => void,
    setShowDeleteConfirmation: (show: boolean) => void
  ) => {
    const selectedIds = Array.from(selectedTransactions);
    console.log('Confirming delete for transaction IDs:', selectedIds);
    
    const success = await unifiedTransactionStore.deleteTransactions(selectedIds);
    
    if (success) {
      toast({
        title: "Transactions deleted",
        description: `Successfully deleted ${selectedIds.length} transaction${selectedIds.length === 1 ? '' : 's'} permanently`,
      });
      setSelectedTransactions(new Set());
    } else {
      toast({
        title: "Delete failed",
        description: "Failed to delete transactions. Please try again.",
        variant: "destructive",
      });
    }
    
    setShowDeleteConfirmation(false);
  };

  return {
    handleUpdateTransaction,
    handleBulkUpdate,
    handleRequestRuleSuggestion,
    handleDeleteSelected,
    handleConfirmDelete
  };
};
