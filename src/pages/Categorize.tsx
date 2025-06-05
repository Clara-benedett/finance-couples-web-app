
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, User, ShoppingCart, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { transactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types/transaction";

type ExpenseCategory = "shared" | "personal";

const Categorize = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const updateTransactions = () => {
      setTransactions(transactionStore.getTransactions());
    };

    updateTransactions();
    const unsubscribe = transactionStore.subscribe(updateTransactions);
    return unsubscribe;
  }, []);

  const updateTransactionCategory = (id: string, category: ExpenseCategory) => {
    transactionStore.updateTransaction(id, { 
      category,
      isClassified: true 
    });
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    return category === "shared" ? Users : User;
  };

  const getCategoryBadge = (transaction: Transaction) => {
    if (transaction.isClassified && transaction.category !== 'UNCLASSIFIED') {
      const category = transaction.category as ExpenseCategory;
      const Icon = getCategoryIcon(category);
      return (
        <Badge variant={category === "shared" ? "default" : "secondary"} className="flex items-center">
          <Icon className="w-3 h-3 mr-1" />
          {category === "shared" ? "Shared" : "Personal"}
        </Badge>
      );
    }
    
    return <Badge variant="outline">Uncategorized</Badge>;
  };

  const unclassifiedTransactions = transactions.filter(t => !t.isClassified || t.category === 'UNCLASSIFIED');
  const classifiedCount = transactions.filter(t => t.isClassified && t.category !== 'UNCLASSIFIED').length;
  const totalCount = transactions.length;

  if (totalCount === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorize Expenses</h1>
          <p className="text-gray-600">
            No transactions to categorize. Please upload some expense data first.
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-500">
              Upload your expense files to start categorizing transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorize Expenses</h1>
        <p className="text-gray-600">
          Review and categorize your expenses as shared or personal
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Progress</h3>
              <p className="text-gray-500">
                {classifiedCount} of {totalCount} expenses categorized
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {totalCount > 0 ? Math.round((classifiedCount / totalCount) * 100) : 0}%
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: totalCount > 0 ? `${(classifiedCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {unclassifiedTransactions.length > 0 && (
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Review ({unclassifiedTransactions.length})
          </h2>
        )}
        
        {unclassifiedTransactions.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${transaction.amount.toFixed(2)}</div>
                    {getCategoryBadge(transaction)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select
                      onValueChange={(value: ExpenseCategory) => updateTransactionCategory(transaction.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Shared
                          </div>
                        </SelectItem>
                        <SelectItem value="personal">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Personal
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {unclassifiedTransactions.length === 0 && totalCount > 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-500">
                All your expenses have been categorized. Great job!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Categorize;
