import { useState, useEffect } from "react";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { Transaction } from "@/types/transaction";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { categorizationRulesEngine } from "@/utils/categorizationRules";
import TransactionCategorizer from "@/components/TransactionCategorizer";
import CategorizeHeader from "@/components/CategorizeHeader";
import CategoryEditModal from "@/components/CategoryEditModal";
import EmptyTransactionsState from "@/components/EmptyTransactionsState";
import RuleSuggestionDialog from "@/components/RuleSuggestionDialog";
import ManualExpenseDialog from "@/components/ManualExpenseDialog";
import ManualExpenseFAB from "@/components/ManualExpenseFAB";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// Import emergency recovery function
import "@/utils/emergencyRecovery";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

const Categorize = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryEdit, setShowCategoryEdit] = useState(false);
  const [showManualExpense, setShowManualExpense] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { categoryNames } = useCategoryNames();
  const [ruleSuggestion, setRuleSuggestion] = useState<{
    merchantName: string;
    category: CategoryType;
    categoryDisplayName: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const updateTransactions = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        console.log('[Categorize] Loading transactions...');
        
        // Ensure user is authenticated first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[Categorize] No authenticated user');
          setTransactions([]);
          return;
        }
        
        console.log('[Categorize] User authenticated:', user.email);
        
        // Wait for store initialization with proper timeout
        await unifiedTransactionStore.waitForInitialization();
        const allTransactions = await unifiedTransactionStore.getTransactions();
        
        if (isMounted) {
          console.log(`[Categorize] Loaded ${allTransactions.length} transactions from unified store`);
          setTransactions(allTransactions);
        }
      } catch (error) {
        console.error('[Categorize] Error loading transactions:', error);
        if (isMounted) {
          toast({
            title: "Error loading transactions",
            description: "Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const applyRules = async () => {
      try {
        const appliedCount = await unifiedTransactionStore.applyRulesToExistingTransactions();
        if (appliedCount > 0 && isMounted) {
          toast({
            title: "Rules Applied",
            description: `${appliedCount} transactions were automatically categorized.`,
          });
        }
      } catch (error) {
        console.error('[Categorize] Error applying rules:', error);
      }
    };
    
    updateTransactions();
    const unsubscribe = unifiedTransactionStore.subscribe(() => {
      if (isMounted) updateTransactions();
    });
    
    // Apply rules after initial load
    setTimeout(applyRules, 1000);
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [toast]);

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

  const handleDeleteSelected = () => {
    console.log('Delete selected called with:', selectedTransactions.size, 'transactions');
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
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

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleAcceptRule = () => {
    if (!ruleSuggestion) return;
    
    const categoryMap: Record<CategoryType, string> = {
      person1: 'person1',
      person2: 'person2', 
      shared: 'shared',
      UNCLASSIFIED: 'UNCLASSIFIED'
    };
    
    // Create the rule
    categorizationRulesEngine.createRule(
      ruleSuggestion.merchantName, 
      categoryMap[ruleSuggestion.category]
    );
    
    // Apply to remaining unclassified transactions with same merchant
    const unclassifiedSameMerchant = transactions.filter(t => 
      !t.isClassified && 
      t.description.toUpperCase().trim() === ruleSuggestion.merchantName.toUpperCase().trim()
    );
    
    unclassifiedSameMerchant.forEach(async (transaction) => {
      await unifiedTransactionStore.updateTransaction(transaction.id, {
        category: categoryMap[ruleSuggestion.category],
        isClassified: true,
        autoAppliedRule: true
      });
    });
    
    if (unclassifiedSameMerchant.length > 0) {
      toast({
        title: "Rule created!",
        description: `Applied to ${unclassifiedSameMerchant.length} remaining ${ruleSuggestion.merchantName} transactions`,
      });
    } else {
      toast({
        title: "Rule created!",
        description: `Future ${ruleSuggestion.merchantName} transactions will be auto-categorized`,
      });
    }
    
    setRuleSuggestion(null);
  };

  const handleDeclineRule = () => {
    setRuleSuggestion(null);
  };

  const handleCategoryUpdate = (names: any) => {
    // Category names are now handled by the useCategoryNames hook
    // The hook will automatically update when database changes
    setShowCategoryEdit(false);
  };

  // Show loading state while transactions are being loaded
  if (isLoading) {
    return (
      <div className="space-y-6">
        <CategorizeHeader onEditCategories={() => setShowCategoryEdit(true)} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return <EmptyTransactionsState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CategorizeHeader onEditCategories={() => setShowCategoryEdit(true)} />

      {/* Category Edit Modal */}
      <CategoryEditModal
        isOpen={showCategoryEdit}
        onComplete={handleCategoryUpdate}
        onCancel={() => setShowCategoryEdit(false)}
      />

      {/* Manual Expense Dialog */}
      <ManualExpenseDialog
        open={showManualExpense}
        onOpenChange={setShowManualExpense}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        transactionCount={selectedTransactions.size}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Rule Suggestion Dialog - Used for both automatic suggestions and auto-rule button clicks */}
      {ruleSuggestion && (
        <RuleSuggestionDialog
          isOpen={true}
          merchantName={ruleSuggestion.merchantName}
          categoryName={ruleSuggestion.categoryDisplayName}
          onAccept={handleAcceptRule}
          onDecline={handleDeclineRule}
        />
      )}

      {/* Transaction Categorizer */}
      <TransactionCategorizer
        transactions={transactions}
        selectedTransactions={selectedTransactions}
        onSelectionChange={setSelectedTransactions}
        onUpdateTransaction={handleUpdateTransaction}
        onBulkUpdate={handleBulkUpdate}
        onRequestRuleSuggestion={handleRequestRuleSuggestion}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Floating Action Button */}
      <ManualExpenseFAB
        onClick={() => setShowManualExpense(true)}
        show={transactions.length > 0}
      />
    </div>
  );
};

export default Categorize;
