
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Target, CreditCard } from "lucide-react";
import { CalculationResults } from "@/utils/calculationEngine";
import { getCategoryNames } from "@/utils/categoryNames";

interface CalculationDetailsProps {
  calculations: CalculationResults;
  showCalculationDetails: boolean;
  onToggle: (open: boolean) => void;
}

const CalculationDetails = ({ calculations, showCalculationDetails, onToggle }: CalculationDetailsProps) => {
  const categoryNames = getCategoryNames();
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <Collapsible open={showCalculationDetails} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">View Calculation Details</span>
              {showCalculationDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-6">
        {/* Should Pay vs Actually Paid Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-cyan-50 border-cyan-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-cyan-800 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Should Pay (Based on Expenses)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{categoryNames.person1}:</span>
                <span className="font-bold text-blue-600">{formatCurrency(calculations.person1ShouldPay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{categoryNames.person2}:</span>
                <span className="font-bold text-green-600">{formatCurrency(calculations.person2ShouldPay)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-indigo-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Actually Paid (Card Bills)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{categoryNames.person1}:</span>
                <span className="font-bold text-blue-600">{formatCurrency(calculations.person1ActuallyPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{categoryNames.person2}:</span>
                <span className="font-bold text-green-600">{formatCurrency(calculations.person2ActuallyPaid)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              <CardDescription>Detailed calculation breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{categoryNames.person1} Individual:</span>
                <span className="font-medium text-blue-600">{formatCurrency(calculations.person1Individual)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{categoryNames.person1} Share of Shared:</span>
                <span className="font-medium text-blue-600">{formatCurrency(calculations.person1ShareOfShared)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-gray-900">{categoryNames.person1} Should Pay:</span>
                  <span className="text-blue-600">{formatCurrency(calculations.person1ShouldPay)}</span>
                </div>
              </div>
              
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{categoryNames.person2} Individual:</span>
                  <span className="font-medium text-green-600">{formatCurrency(calculations.person2Individual)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{categoryNames.person2} Share of Shared:</span>
                  <span className="font-medium text-green-600">{formatCurrency(calculations.person2ShareOfShared)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-900">{categoryNames.person2} Should Pay:</span>
                    <span className="text-green-600">{formatCurrency(calculations.person2ShouldPay)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Net Positions</CardTitle>
              <CardDescription>Who owes what amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className={`flex justify-between items-center ${calculations.person1NetPosition >= 0 ? "text-red-600" : "text-green-600"}`}>
                  <span className="text-sm">{categoryNames.person1}:</span>
                  <span className="font-medium">
                    {calculations.person1NetPosition >= 0 ? "owes" : "owed"} {formatCurrency(Math.abs(calculations.person1NetPosition))}
                  </span>
                </div>
                <div className={`flex justify-between items-center ${calculations.person2NetPosition >= 0 ? "text-red-600" : "text-green-600"}`}>
                  <span className="text-sm">{categoryNames.person2}:</span>
                  <span className="font-medium">
                    {calculations.person2NetPosition >= 0 ? "owes" : "owed"} {formatCurrency(Math.abs(calculations.person2NetPosition))}
                  </span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Individual: {formatCurrency((calculations.person1Individual + calculations.person2Individual) / 2)} avg</div>
                  <div>Shared: {formatCurrency(calculations.sharedTotal)}</div>
                  <div>Categories: {calculations.categoryBreakdown.person1.length + calculations.categoryBreakdown.person2.length + calculations.categoryBreakdown.shared.length} classified</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CalculationDetails;
