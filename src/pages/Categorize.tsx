
import { useState, useEffect } from "react";
import { supabaseTransactionStore } from "@/store/supabaseTransactionStore";
import { Transaction } from "@/types/transaction";
import { getCategoryNames } from "@/utils/categoryNames";
import { categorizationRulesEngine } from "@/utils/categorizationRules";
import TransactionCategorizer from "@/components/TransactionCategorizer";
import CategorizeHeader from "@/components/CategorizeHeader";
import CategoryEditModal from "@/components/CategoryEditModal";
import EmptyTransactionsState from "@/components/EmptyTransactionsState";
import RuleSuggestionDialog from "@/components/RuleSuggestionDialog";
import ManualExpenseDialog from "@/components/ManualExpenseDialog";
import ManualExpenseFAB from "@/components/ManualExpenseFAB";
import { useToast } from "@/hooks/use-toast";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

const Categorize = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showCategoryEdit, setShowCategoryEdit] = useState(false);
  const [showManualExpense, setShowManualExpense] = useState(false);
  const [categoryNames, setCategoryNames] = useState(getCategoryNames());
  const [ruleSuggestion, setRuleSuggestion] = useState<{
    merchantName: string;
    category: CategoryType;
    categoryDisplayName: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const updateTransactions = () => {
      setTransactions(supabaseTransactionStore.getTransactions());
    };

    const applyRules = async () => {
      // Auto-apply rules to existing transactions on page load
      const appliedCount = await supabaseTransactionStore.applyRulesToExistingTransactions();
      if (appliedCount > 0) {
        toast({
          title: "Auto-categorization applied",
          description: `Applied existing rules to ${appliedCount} transactions`,
        });
      }
    };

    updateTransactions();
    applyRules();
    
    const unsubscribe = supabaseTransactionStore.subscribe(updateTransactions);
    return unsubscribe;
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
    await supabaseTransactionStore.updateTransaction(id, { 
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

  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await supabaseTransactionStore.deleteTransaction(id);
    }
    toast({
      title: "Transactions deleted",
      description: `Deleted ${ids.length} transaction${ids.length > 1 ? 's' : ''}`,
    });
  };

  const handleRequestRuleSuggestion = (merchantName: string, category: CategoryType, categoryDisplayName: string) => {
    // Show the rule suggestion modal when requested by the auto-rule button
    setRuleSuggestion({
      merchantName,
      category,
      categoryDisplayName
    });
  };

  const handleAcceptRule = async () => {
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
    
    for (const transaction of unclassifiedSameMerchant) {
      await supabaseTransactionStore.updateTransaction(transaction.id, {
        category: categoryMap[ruleSuggestion.category],
        isClassified: true,
        autoAppliedRule: true
      });
    }
    
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
    setCategoryNames(names);
    setShowCategoryEdit(false);
  };

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
        onUpdateTransaction={handleUpdateTransaction}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        onRequestRuleSuggestion={handleRequestRuleSuggestion}
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
