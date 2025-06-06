import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Filter, CheckSquare, Square, Info, X, Zap, Check, Bot } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { getCategoryNames } from "@/utils/categoryNames";
import { categorizationRulesEngine } from "@/utils/categorizationRules";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const getMCCEmoji = (mccCode?: string) => {
    if (!mccCode) return '';
    
    const code = mccCode.trim();
    
    // Fast Food
    if (['5814'].includes(code)) return '🍔';
    
    // Restaurants
    if (['5812', '5813'].includes(code)) return '🍽️';
    
    // Transportation (Uber, Lyft, Taxi)
    if (['4121', '4131', '4111'].includes(code)) return '🚗';
    
    // Gas Stations
    if (['5541', '5542'].includes(code)) return '⛽';
    
    // Grocery Stores
    if (['5411'].includes(code)) return '🛒';
    
    // Department Stores
    if (['5311', '5331'].includes(code)) return '🏪';
    
    // Hotels
    if (['7011'].includes(code)) return '🏨';
    
    // Airlines
    if (['4511'].includes(code)) return '✈️';
    
    // Pharmacies
    if (['5912'].includes(code)) return '💊';
    
    // Coffee Shops
    if (['5814'].includes(code)) return '☕';
    
    // ATM/Banking
    if (['6011', '6012'].includes(code)) return '🏧';
    
    return '💳'; // Default for other transactions
  };

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
    // Only call the parent's update function - no rule suggestion logic here
    onUpdateTransaction(transactionId, category);
  };

  const handleBulkCategoryClick = (category: CategoryType) => {
    if (selectedTransactions.size > 0) {
      onBulkUpdate(Array.from(selectedTransactions), category);
      setSelectedTransactions(new Set());
    }
  };

  const handleCreateRuleClick = (event: React.MouseEvent, merchantName: string, category: CategoryType, categoryDisplayName: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Auto-rule button clicked for:', merchantName, category, categoryDisplayName);
    
    // Request the parent to show the rule suggestion modal
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

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getCategoryButtonClass = (category: CategoryType, currentCategory: string, isForBulk = false) => {
    const baseClass = "relative overflow-hidden transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 min-w-[100px] touch-manipulation rounded-full";
    const isSelected = currentCategory === category;
    
    if (isSelected) {
      // Selected state - solid with glow
      switch (category) {
        case 'person1':
          return `${baseClass} bg-blue-600 text-white border-2 border-blue-600 shadow-blue-200 shadow-lg hover:bg-blue-700 hover:shadow-blue-300`;
        case 'person2':
          return `${baseClass} bg-green-600 text-white border-2 border-green-600 shadow-green-200 shadow-lg hover:bg-green-700 hover:shadow-green-300`;
        case 'shared':
          return `${baseClass} bg-purple-600 text-white border-2 border-purple-600 shadow-purple-200 shadow-lg hover:bg-purple-700 hover:shadow-purple-300`;
        case 'UNCLASSIFIED':
          return `${baseClass} bg-gray-600 text-white border-2 border-gray-600 shadow-gray-200 shadow-lg hover:bg-gray-700 hover:shadow-gray-300`;
      }
    } else {
      // Unselected state - outline with opacity
      switch (category) {
        case 'person1':
          return `${baseClass} bg-transparent text-blue-600 border-2 border-blue-300 opacity-50 hover:opacity-100 hover:bg-blue-50 hover:border-blue-500 hover:shadow-blue-200`;
        case 'person2':
          return `${baseClass} bg-transparent text-green-600 border-2 border-green-300 opacity-50 hover:opacity-100 hover:bg-green-50 hover:border-green-500 hover:shadow-green-200`;
        case 'shared':
          return `${baseClass} bg-transparent text-purple-600 border-2 border-purple-300 opacity-50 hover:opacity-100 hover:bg-purple-50 hover:border-purple-500 hover:shadow-purple-200`;
        case 'UNCLASSIFIED':
          return `${baseClass} bg-transparent text-gray-600 border-2 border-gray-300 opacity-50 hover:opacity-100 hover:bg-gray-50 hover:border-gray-500 hover:shadow-gray-200`;
      }
    }
    
    return baseClass;
  };

  const renderCategoryButton = (category: CategoryType, currentCategory: string, onClick: () => void, isForBulk = false) => {
    const isSelected = currentCategory === category;
    const buttonClass = getCategoryButtonClass(category, currentCategory, isForBulk);
    
    let label = '';
    switch (category) {
      case 'person1':
        label = categoryNames.person1;
        break;
      case 'person2':
        label = categoryNames.person2;
        break;
      case 'shared':
        label = categoryNames.shared;
        break;
      case 'UNCLASSIFIED':
        label = 'Unclassified';
        break;
    }

    return (
      <button
        key={category}
        onClick={onClick}
        className={buttonClass}
        style={{ minHeight: '40px' }}
      >
        <div className="flex items-center justify-center gap-2 px-4 py-2">
          {isSelected && <Check className="w-4 h-4" />}
          <span className="font-medium">{label}</span>
        </div>
      </button>
    );
  };

  const categorizedCount = transactions.filter(t => t.category !== 'UNCLASSIFIED').length;
  const totalCount = transactions.length;
  const progressPercentage = totalCount > 0 ? Math.round((categorizedCount / totalCount) * 100) : 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Categorization Progress</h3>
                <p className="text-gray-500">
                  {categorizedCount} of {totalCount} transactions categorized
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Selection Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search bar */}
              <div className="w-96">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllVisible}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedTransactions.size} selected
                  </span>
                </div>
              </div>

              {/* Bulk Action Buttons */}
              {selectedTransactions.size > 0 && (
                <div className="flex gap-3 flex-wrap items-center">
                  <span className="text-sm text-gray-600 mr-2">Categorize selected as:</span>
                  <div className="flex gap-2">
                    {renderCategoryButton('person1', 'UNCLASSIFIED', () => handleBulkCategoryClick('person1'), true)}
                    {renderCategoryButton('person2', 'UNCLASSIFIED', () => handleBulkCategoryClick('person2'), true)}
                    {renderCategoryButton('shared', 'UNCLASSIFIED', () => handleBulkCategoryClick('shared'), true)}
                    {renderCategoryButton('UNCLASSIFIED', 'UNCLASSIFIED', () => handleBulkCategoryClick('UNCLASSIFIED'), true)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const ruleEligibility = getMerchantRuleEligibility(transaction.description);
            
            return (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => toggleTransactionSelection(transaction.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {selectedTransactions.has(transaction.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    {/* MCC Emoji */}
                    {transaction.mccCode && (
                      <div className="text-xl" title={`MCC: ${transaction.mccCode}`}>
                        {getMCCEmoji(transaction.mccCode)}
                      </div>
                    )}

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {transaction.description}
                            </h3>
                            
                            {/* Auto-rule Button */}
                            {ruleEligibility && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => handleCreateRuleClick(e, transaction.description, ruleEligibility.category, ruleEligibility.categoryDisplayName)}
                                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 animate-fade-in"
                                  >
                                    <Bot className="w-3 h-3 mr-1" />
                                    Auto-rule
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Create rule to auto-categorize {transaction.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            
                            {/* Zap icon for auto-categorized transactions */}
                            {transaction.autoAppliedRule && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Auto-categorized using rule</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            
                            {/* Hover card for additional details */}
                            {(transaction.transactionType || transaction.referenceNumber) && (
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <button className="text-gray-400 hover:text-gray-600">
                                    <Info className="w-4 h-4" />
                                  </button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80 bg-white border shadow-lg">
                                  <div className="space-y-2">
                                    {transaction.transactionType && (
                                      <div>
                                        <span className="font-medium text-gray-700">Type: </span>
                                        <span className="text-gray-600">{transaction.transactionType}</span>
                                      </div>
                                    )}
                                    {transaction.referenceNumber && (
                                      <div>
                                        <span className="font-medium text-gray-700">Reference: </span>
                                        <span className="text-gray-600">{transaction.referenceNumber}</span>
                                      </div>
                                    )}
                                    {transaction.mccCode && (
                                      <div>
                                        <span className="font-medium text-gray-700">MCC Code: </span>
                                        <span className="text-gray-600">{transaction.mccCode}</span>
                                      </div>
                                    )}
                                    {transaction.autoAppliedRule && (
                                      <div>
                                        <span className="font-medium text-gray-700">Auto-categorized: </span>
                                        <span className="text-yellow-600">Yes</span>
                                      </div>
                                    )}
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                            <span>{transaction.date}</span>
                            <span>•</span>
                            <span className="font-medium">{transaction.cardName}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-900">
                              ${transaction.amount.toFixed(2)}
                            </span>
                            {transaction.location && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">{transaction.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Buttons - Consistent Order */}
                    <div className="flex gap-2 ml-4">
                      {renderCategoryButton('person1', transaction.category, () => handleCategoryClick(transaction.id, 'person1'))}
                      {renderCategoryButton('person2', transaction.category, () => handleCategoryClick(transaction.id, 'person2'))}
                      {renderCategoryButton('shared', transaction.category, () => handleCategoryClick(transaction.id, 'shared'))}
                      {renderCategoryButton('UNCLASSIFIED', transaction.category, () => handleCategoryClick(transaction.id, 'UNCLASSIFIED'))}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
