import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [isAlreadyCategorizedExpanded, setIsAlreadyCategorizedExpanded] = useState(false);
  const categoryNames = getCategoryNames();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const { uncategorizedTransactions, categorizedTransactions } = useMemo(() => {
    const uncategorized = filteredTransactions.filter(t => t.category === 'UNCLASSIFIED');
    const categorized = filteredTransactions.filter(t => t.category !== 'UNCLASSIFIED');
    return { uncategorizedTransactions: uncategorized, categorizedTransactions: categorized };
  }, [filteredTransactions]);

  // Check against complete dataset for celebration logic
  const allUncategorizedCount = useMemo(() => {
    return transactions.filter(t => t.category === 'UNCLASSIFIED').length;
  }, [transactions]);

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

        {/* Transactions Sections */}
        <div className="space-y-6">
          {/* Needs Categorization Section */}
          {uncategorizedTransactions.length > 0 && (
            <div className="space-y-3">
              <Card className="bg-white border-l-4 border-l-blue-500 shadow-md">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    ⚡ Needs Categorization ({uncategorizedTransactions.length} remaining)
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    These transactions need to be categorized
                  </p>
                </CardContent>
              </Card>
              
              <div className="space-y-3">
                {uncategorizedTransactions.map((transaction) => {
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
              </div>
            </div>
          )}

          {/* All Categorized Celebration - Only show when ALL transactions are categorized */}
          {allUncategorizedCount === 0 && totalCount > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">All transactions categorized!</h2>
                <p className="text-green-700">Great job organizing your expenses!</p>
              </CardContent>
            </Card>
          )}

          {/* Filtered completion message - Show when filtered view is complete but overall work remains */}
          {allUncategorizedCount > 0 && uncategorizedTransactions.length === 0 && searchTerm && categorizedTransactions.length > 0 && (
            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">✨</div>
                <h2 className="text-lg font-semibold text-blue-800 mb-1">All filtered transactions categorized!</h2>
                <p className="text-blue-700">
                  {allUncategorizedCount} more transactions need categorization (clear search to see them)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Already Categorized Section */}
          {categorizedTransactions.length > 0 && (
            <Collapsible open={isAlreadyCategorizedExpanded} onOpenChange={setIsAlreadyCategorizedExpanded}>
              <Card className="bg-gray-50 opacity-75">
                <CardContent className="p-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-700">
                          ✅ Already Categorized ({categorizedTransactions.length} completed)
                        </h2>
                      </div>
                      {isAlreadyCategorizedExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </CardContent>
              </Card>
              
              <CollapsibleContent className="space-y-2 mt-3">
                {categorizedTransactions.map((transaction) => (
                  <div key={transaction.id} className="scale-95 transform">
                    <TransactionCard
                      transaction={transaction}
                      isSelected={selectedTransactions.has(transaction.id)}
                      ruleEligibility={null}
                      onToggleSelection={() => toggleTransactionSelection(transaction.id)}
                      onCategoryClick={(category) => handleCategoryClick(transaction.id, category)}
                      onCreateRuleClick={handleCreateRuleClick}
                      isInCategorizedSection={true}
                    />
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Empty state - no transactions match search */}
          {filteredTransactions.length === 0 && searchTerm && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">No transactions match your search.</div>
              </CardContent>
            </Card>
          )}

          {/* Empty state - no transactions at all */}
          {filteredTransactions.length === 0 && !searchTerm && (
            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="p-8 text-center">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Start categorizing your transactions</h2>
                <p className="text-blue-700">Upload your expense data to begin organizing your finances.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TransactionCategorizer;
