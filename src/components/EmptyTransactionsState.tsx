
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const EmptyTransactionsState = () => {
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
};

export default EmptyTransactionsState;
