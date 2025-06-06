
import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Search, Filter, CheckSquare, Square, Info, X, Lightning } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { getCategoryNames } from "@/utils/categoryNames";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface TransactionCategorizerProps {
  transactions: Transaction[];
  onUpdateTransaction: (id: string, category: CategoryType) => void;
  onBulkUpdate: (ids: string[], category: CategoryType) => void;
}

const TransactionCategorizer = ({ 
  transactions, 
  onUpdateTransaction, 
  onBulkUpdate 
}: TransactionCategorizerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const categoryNames = getCategoryNames();

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

  const handleCategoryClick = (transactionId: string, category: CategoryType) => {
    onUpdateTransaction(transactionId, category);
  };

  const handleBulkCategoryClick = (category: CategoryType) => {
    if (selectedTransactions.size > 0) {
      onBulkUpdate(Array.from(selectedTransactions), category);
      setSelectedTransactions(new Set());
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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'person1':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{categoryNames.person1}</Badge>;
      case 'person2':
        return <Badge className="bg-green-100 text-green-800 border-green-200">{categoryNames.person2}</Badge>;
      case 'shared':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{categoryNames.shared}</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Unclassified</Badge>;
    }
  };

  const categorizedCount = transactions.filter(t => t.category !== 'UNCLASSIFIED').length;
  const totalCount = transactions.length;
  const progressPercentage = totalCount > 0 ? Math.round((categorizedCount / totalCount) * 100) : 0;

  return (
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
            {/* Top row: Selection controls on left, Search on right */}
            <div className="flex items-center justify-between">
              {/* Selection Controls - Left side, aligned with checkboxes */}
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
              
              {/* Search - Right side */}
              <div className="w-80">
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
            </div>

            {/* Bulk Action Buttons */}
            {selectedTransactions.size > 0 && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-gray-600 self-center mr-2">Categorize selected as:</span>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => handleBulkCategoryClick('person1')}
                >
                  {categoryNames.person1}
                </Button>
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleBulkCategoryClick('person2')}
                >
                  {categoryNames.person2}
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={() => handleBulkCategoryClick('shared')}
                >
                  {categoryNames.shared}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkCategoryClick('UNCLASSIFIED')}
                >
                  Unclassified
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
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
                        {/* Lightning icon for auto-categorized transactions */}
                        {transaction.autoAppliedRule && (
                          <Lightning className="w-4 h-4 text-yellow-500" title="Auto-categorized using rule" />
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
                    
                    <div className="ml-4 text-right">
                      {getCategoryBadge(transaction.category)}
                    </div>
                  </div>
                </div>

                {/* Category Buttons */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handleCategoryClick(transaction.id, 'person1')}
                  >
                    {categoryNames.person1}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleCategoryClick(transaction.id, 'person2')}
                  >
                    {categoryNames.person2}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={() => handleCategoryClick(transaction.id, 'shared')}
                  >
                    {categoryNames.shared}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCategoryClick(transaction.id, 'UNCLASSIFIED')}
                  >
                    Unclassified
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTransactions.length === 0 && searchTerm && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">No transactions match your search.</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionCategorizer;
