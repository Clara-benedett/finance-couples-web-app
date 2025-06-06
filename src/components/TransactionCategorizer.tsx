
import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Transaction } from "@/types/transaction";
import { categorizationRulesEngine } from "@/utils/categorizationRules";
import { getCategoryNames } from "@/utils/categoryNames";
import ProgressCard from "./ProgressCard";
import TransactionFilters from "./TransactionFilters";
import TransactionCard from "./TransactionCard";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface TransactionCategorizerProps {
  transactions: Transaction[];
  onUpdateTransaction: (id: string, category: CategoryType) => void;
  onBulkUpdate: (ids: string[], category: CategoryType) => void;
  onRequestRuleSuggestion?: (merchantName: string, category: CategoryType, categoryDisplayName: string) => void;
}

const TransactionCategorizer = ({ 
  transactions, 
  onUpdateTransaction, 
  onBulkUpdate,
  onRequestRuleSuggestion
}: TransactionCategorizerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const categoryNames = getCategoryNames();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const getMerchantRuleEligibility = (merchantName: string) => {
    const normalizedMerchant = merchantName.toUpperCase().trim();
    
    // Don't suggest if rule already exists
    if (categorizationRulesEngine.getRuleForMerchant(normalizedMerchant)) {
      return null;
    }

    // Count categorizations by category for this merchant
    const merchantTransactions = transactions.filter(t => 
      t.description.toUpperCase().trim() === normalizedMerchant && 
      t.category !== 'UNCLASSIFIED'
    );

    if (merchantTransactions.length < 3) return null;

    // Check if all categorizations are the same
    const categories = merchantTransactions.map(t => t.category);
    const uniqueCategories = [...new Set(categories)];
    
    if (uniqueCategories.length === 1) {
      const category = uniqueCategories[0];
      // Map string category back to CategoryType
      const categoryType = category as CategoryType;
      return {
        category: categoryType,
        categoryDisplayName: category === 'person1' ? categoryNames.person1 : 
                           category === 'person2' ? categoryNames.person2 : 
                           categoryNames.shared,
        count: merchantTransactions.length
      };
    }

    return null;
  };

  const handleCategoryClick = (transactionId: string, category: CategoryType) => {
    onUpdateTransaction(transactionId, category);
  };

  const handleBulkCategoryClick = (category: CategoryType) => {
    if (selectedTransactions.size > 0) {
      onBulkUpdate(Array.from(selectedTransactions), category);
      setSelectedTransactions(new Set());
    }
  };

  const handleCreateRuleClick = (merchantName: string, category: CategoryType, categoryDisplayName: string) => {
    console.log('Auto-rule button clicked for:', merchantName, category, categoryDisplayName);
    
    if (onRequestRuleSuggestion) {
      onRequestRuleSuggestion(merchantName, category, categoryDisplayName);
    }
  };

  const toggleTransactionSelection = (transactionId: string) => {
    const newSelection = new Set(selectedTransactions);
    if (newSelection.has(transactionId)) {
      newSelection.delete(transactionId);
    } else {
      newSelection.add(transactionId);
    }
    setSelectedTransactions(newSelection);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredTransactions.map(t => t.id);
    setSelectedTransactions(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedTransactions(new Set());
  };

  const categorizedCount = transactions.filter(t => t.category !== 'UNCLASSIFIED').length;
  const totalCount = transactions.length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Progress Header */}
        <ProgressCard categorizedCount={categorizedCount} totalCount={totalCount} />

        {/* Search and Selection Controls */}
        <TransactionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTransactions={selectedTransactions}
          onSelectAll={selectAllVisible}
          onClearSelection={clearSelection}
          onBulkCategoryClick={handleBulkCategoryClick}
        />

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const ruleEligibility = getMerchantRuleEligibility(transaction.description);
            
            return (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                isSelected={selectedTransactions.has(transaction.id)}
                ruleEligibility={ruleEligibility}
                onToggleSelection={() => toggleTransactionSelection(transaction.id)}
                onCategoryClick={(category) => handleCategoryClick(transaction.id, category)}
                onCreateRuleClick={handleCreateRuleClick}
              />
            );
          })}

          {filteredTransactions.length === 0 && searchTerm && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">No transactions match your search.</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TransactionCategorizer;
