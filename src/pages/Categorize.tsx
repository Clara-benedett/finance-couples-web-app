
import { useState, useEffect } from "react";
import CategorizeHeader from "@/components/CategorizeHeader";
import CategoryEditModal from "@/components/CategoryEditModal";
import EmptyTransactionsState from "@/components/EmptyTransactionsState";
import RuleSuggestionDialog from "@/components/RuleSuggestionDialog";
import ManualExpenseDialog from "@/components/ManualExpenseDialog";
import ManualExpenseFAB from "@/components/ManualExpenseFAB";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import TransactionCategorizer from "@/components/TransactionCategorizer";
import { useEmergencyRecovery } from "@/components/categorize/EmergencyRecoveryFunctions";
import { useTransactionLoader } from "@/components/categorize/TransactionLoader";
import { useTransactionHandlers } from "@/components/categorize/TransactionHandlers";
import { useRuleHandlers } from "@/components/categorize/RuleHandlers";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

const Categorize = () => {
  const [showCategoryEdit, setShowCategoryEdit] = useState(false);
  const [showManualExpense, setShowManualExpense] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [ruleSuggestion, setRuleSuggestion] = useState<{
    merchantName: string;
    category: CategoryType;
    categoryDisplayName: string;
  } | null>(null);

  // Initialize recovery functions
  const { initializeRecoveryFunctions } = useEmergencyRecovery();
  
  // Load transactions
  const { transactions, isLoading } = useTransactionLoader();
  
  // Transaction handlers
  const {
    handleUpdateTransaction,
    handleBulkUpdate,
    handleRequestRuleSuggestion,
    handleDeleteSelected,
    handleConfirmDelete
  } = useTransactionHandlers(transactions, setRuleSuggestion);
  
  // Rule handlers
  const { handleAcceptRule, applyRules } = useRuleHandlers(transactions);

  useEffect(() => {
    // Initialize emergency recovery functions
    initializeRecoveryFunctions();
    
    // Apply rules after initial load
    setTimeout(applyRules, 1000);
  }, [initializeRecoveryFunctions, applyRules]);

  const handleDeclineRule = () => {
    setRuleSuggestion(null);
  };

  const handleCategoryUpdate = (names: any) => {
    // Category names are now handled by the useCategoryNames hook
    // The hook will automatically update when database changes
    setShowCategoryEdit(false);
  };

  const handleAcceptRuleWrapper = () => {
    handleAcceptRule(ruleSuggestion);
    setRuleSuggestion(null);
  };

  const handleDeleteSelectedWrapper = () => {
    handleDeleteSelected(selectedTransactions, setShowDeleteConfirmation);
  };

  const handleConfirmDeleteWrapper = async () => {
    await handleConfirmDelete(selectedTransactions, setSelectedTransactions, setShowDeleteConfirmation);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
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
        onConfirm={handleConfirmDeleteWrapper}
        onCancel={handleCancelDelete}
      />

      {/* Rule Suggestion Dialog - Used for both automatic suggestions and auto-rule button clicks */}
      {ruleSuggestion && (
        <RuleSuggestionDialog
          isOpen={true}
          merchantName={ruleSuggestion.merchantName}
          categoryName={ruleSuggestion.categoryDisplayName}
          onAccept={handleAcceptRuleWrapper}
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
        onDeleteSelected={handleDeleteSelectedWrapper}
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
