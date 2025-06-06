
import { useState, useEffect } from "react";
import { transactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types/transaction";
import { getCategoryNames } from "@/utils/categoryNames";
import TransactionCategorizer from "@/components/TransactionCategorizer";
import CategorySetup from "@/components/CategorySetup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Settings } from "lucide-react";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

const Categorize = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showCategoryEdit, setShowCategoryEdit] = useState(false);
  const [categoryNames, setCategoryNames] = useState(getCategoryNames());

  useEffect(() => {
    const updateTransactions = () => {
      setTransactions(transactionStore.getTransactions());
    };

    updateTransactions();
    const unsubscribe = transactionStore.subscribe(updateTransactions);
    return unsubscribe;
  }, []);

  const handleUpdateTransaction = (id: string, category: CategoryType) => {
    // Map the category types to the transaction store format
    const categoryMap: Record<CategoryType, string> = {
      person1: 'person1',
      person2: 'person2', 
      shared: 'shared',
      UNCLASSIFIED: 'UNCLASSIFIED'
    };

    transactionStore.updateTransaction(id, { 
      category: categoryMap[category],
      isClassified: category !== 'UNCLASSIFIED'
    });
  };

  const handleBulkUpdate = (ids: string[], category: CategoryType) => {
    ids.forEach(id => handleUpdateTransaction(id, category));
  };

  const handleCategoryUpdate = (names: any) => {
    setCategoryNames(names);
    setShowCategoryEdit(false);
  };

  if (transactions.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorize Expenses</h1>
          <p className="text-gray-600">
            Review and categorize your expenses using your custom categories
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCategoryEdit(true)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Edit Categories
        </Button>
      </div>

      {/* Category Edit Modal */}
      {showCategoryEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <CategorySetup
              onComplete={handleCategoryUpdate}
              isEditing={true}
              onCancel={() => setShowCategoryEdit(false)}
            />
          </div>
        </div>
      )}

      {/* Transaction Categorizer */}
      <TransactionCategorizer
        transactions={transactions}
        onUpdateTransaction={handleUpdateTransaction}
        onBulkUpdate={handleBulkUpdate}
      />
    </div>
  );
};

export default Categorize;
