
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp } from "lucide-react";
import { CalculationResults } from "@/utils/calculationEngine";

interface ActionItemsProps {
  calculations: CalculationResults;
  onCategorizeClick: () => void;
  onUploadClick: () => void;
}

const ActionItems = ({ calculations, onCategorizeClick, onUploadClick }: ActionItemsProps) => {
  return (
    <div className="space-y-6">
      {/* Unclassified transactions warning */}
      {calculations.categoryBreakdown.unclassified.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200 border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-yellow-800">Action Required</div>
                <div className="text-yellow-700">
                  {calculations.categoryBreakdown.unclassified.length} transactions need categorization
                </div>
              </div>
              <Button 
                onClick={onCategorizeClick}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Categorize Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg">Upload Statements</CardTitle>
            <CardDescription>
              Upload your latest credit card statements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onUploadClick}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Statements
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg">Review Categories</CardTitle>
            <CardDescription>
              Review and adjust expense categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onCategorizeClick}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Categorize Expenses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActionItems;
