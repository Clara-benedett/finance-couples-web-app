
import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, CheckSquare, Square } from "lucide-react";
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

      {/* Search and Bulk Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllVisible}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
                <span className="text-sm text-gray-500">
                  {selectedTransactions.size} selected
                </span>
              </div>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          {selectedTransactions.size > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
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

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {transaction.description}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span className="font-medium">{transaction.cardName}</span>
                        <span>•</span>
                        <span className="font-semibold text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </span>
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
