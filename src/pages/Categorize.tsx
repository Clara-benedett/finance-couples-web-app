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
    
    // 🚨 EMERGENCY RECOVERY FUNCTIONS - LOADED IMMEDIATELY
    console.log('🛠️ [RECOVERY] Loading emergency recovery functions...');
    
    (window as any).checkAllStorage = () => {
      console.log('🔍 CHECKING ALL STORAGE LOCATIONS...');
      
      const localStorage_transactions = localStorage.getItem('expense_tracker_transactions');
      const localStorage_backup = localStorage.getItem('expense_tracker_backup');
      const sessionStorage_transactions = sessionStorage.getItem('expense_tracker_transactions');
      const sessionStorage_backup = sessionStorage.getItem('expense_tracker_backup');
      
      console.log('📦 STORAGE AUDIT:');
      console.log('localStorage transactions:', localStorage_transactions ? `${localStorage_transactions.length} chars` : 'EMPTY');
      console.log('localStorage backup:', localStorage_backup ? `${localStorage_backup.length} chars` : 'EMPTY');
      console.log('sessionStorage transactions:', sessionStorage_transactions ? `${sessionStorage_transactions.length} chars` : 'EMPTY');
      console.log('sessionStorage backup:', sessionStorage_backup ? `${sessionStorage_backup.length} chars` : 'EMPTY');
      
      // Find best data source
      const bestData = localStorage_transactions || localStorage_backup || sessionStorage_transactions || sessionStorage_backup;
      
      if (bestData) {
        try {
          const parsed = JSON.parse(bestData);
          console.log(`🎯 FOUND ${parsed.length} TRANSACTIONS! Use emergencyRecover() to restore them.`);
          return parsed;
        } catch (e) {
          console.error('❌ Data found but corrupted:', e);
        }
      } else {
        console.log('💀 NO DATA FOUND');
        
        // Check if user needs to enter data manually
        console.log('');
        console.log('🆘 LAST RESORT OPTIONS:');
        console.log('1. Check browser history for previous sessions');
        console.log('2. Check if you have any downloaded backup files');
        console.log('3. Check other browser profiles/devices');
      }
      
      return null;
    };

    (window as any).emergencyRecover = async () => {
      console.log('🚨 [RECOVERY] Starting emergency data recovery...');
      
      try {
        // Check all storage locations
        const localStorage_data = localStorage.getItem('expense_tracker_transactions');
        const backup_data = localStorage.getItem('expense_tracker_backup');
        const session_data = sessionStorage.getItem('expense_tracker_transactions');
        
        let dataToRecover = null;
        let dataSource = '';
        
        if (localStorage_data) {
          dataToRecover = JSON.parse(localStorage_data);
          dataSource = 'localStorage';
        } else if (backup_data) {
          const parsed = JSON.parse(backup_data);
          dataToRecover = parsed.transactions || parsed;
          dataSource = 'localStorage backup';
        } else if (session_data) {
          dataToRecover = JSON.parse(session_data);
          dataSource = 'sessionStorage';
        }
        
        if (!dataToRecover || dataToRecover.length === 0) {
          console.log('❌ [RECOVERY] No data found to recover');
          return false;
        }
        
        console.log(`📦 [RECOVERY] Found ${dataToRecover.length} transactions in ${dataSource}`);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ [RECOVERY] Authentication issue:', userError);
          return false;
        }
        
        console.log('👤 [RECOVERY] Authenticated as:', user.email);
        
        // Map data to database format
        const dbTransactions = dataToRecover.map((t: any) => ({
          id: t.id,
          user_id: user.id,
          date: t.date,
          amount: parseFloat(t.amount || 0),
          description: t.description,
          category: t.category,
          card_name: t.cardName,
          paid_by: t.paidBy,
          is_classified: t.isClassified || false,
          mcc_code: t.mccCode,
          bank_category: t.bankCategory,
          transaction_type: t.transactionType,
          location: t.location,
          reference_number: t.referenceNumber,
          auto_applied_rule: t.autoAppliedRule || false,
          is_manual_entry: t.isManualEntry || false,
          payment_method: t.paymentMethod,
        }));
        
        console.log('💾 [RECOVERY] Uploading to database...');
        
        // Insert into database
        const { error } = await supabase.from('transactions').insert(dbTransactions);
        
        if (error) {
          console.error('❌ [RECOVERY] Database error:', error);
          return false;
        }
        
        console.log('✅ [RECOVERY] SUCCESS! Data restored to database.');
        console.log('🔄 [RECOVERY] Refreshing page...');
        
        setTimeout(() => window.location.reload(), 1000);
        return true;
        
      } catch (error) {
        console.error('❌ [RECOVERY] Recovery failed:', error);
        return false;
      }
    };
    
    console.log('🛠️ [RECOVERY] Recovery functions loaded. Use checkAllStorage() and emergencyRecover() in console.');
    
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
          
          // If no transactions found, remind user about recovery
          if (allTransactions.length === 0) {
            console.log('');
            console.log('💡 NO TRANSACTIONS FOUND. Try these recovery commands:');
            console.log('   checkAllStorage()    - Check for data in browser storage');
            console.log('   emergencyRecover()   - Restore found data to database');
            console.log('');
          }
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
