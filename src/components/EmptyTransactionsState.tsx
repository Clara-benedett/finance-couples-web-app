
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, RefreshCw, Search, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyTransactionsStateProps {
  loadError?: string | null;
  isLoading?: boolean;
  retryLoading?: () => void;
}

const EmptyTransactionsState = ({ loadError, isLoading, retryLoading }: EmptyTransactionsStateProps) => {
  const navigate = useNavigate();

  // If there's a loading error, show recovery options
  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorize Expenses</h1>
          <p className="text-amber-600">
            Having trouble loading your data? Don't worry - your transactions are likely still safe.
          </p>
        </div>

        <Card className="border-amber-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Issues</h3>
            <p className="text-gray-600 mb-4">
              {loadError.includes('Authentication') 
                ? 'Please try logging out and back in.' 
                : 'Unable to load your transactions. This is usually a temporary connection issue.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={retryLoading} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Retrying...' : 'Try Again'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal empty state when no transactions exist
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorize Expenses</h1>
        <p className="text-gray-600">
          No transactions to categorize yet. Upload some expense data to get started.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Get Started</h3>
          <p className="text-gray-500 mb-4">
            Upload your expense files to start categorizing and tracking your shared expenses.
          </p>
          <Button 
            onClick={() => navigate('/app/upload')} 
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Transactions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyTransactionsState;
