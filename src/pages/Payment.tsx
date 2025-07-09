import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ArrowRight, CheckCircle, TrendingUp, TrendingDown, DollarSign, Calculator, History } from "lucide-react";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { supabaseTransactionStore } from "@/store/supabaseTransactionStore";
import { Transaction } from "@/types/transaction";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { calculateExpenses, type CalculationResults, type ProportionSettings } from "@/utils/calculationEngine";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [calculations, setCalculations] = useState<CalculationResults | null>(null);
  const [proportions, setProportions] = useState<ProportionSettings>({ person1Percentage: 50, person2Percentage: 50 });
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { categoryNames } = useCategoryNames();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load transactions
        const allTransactions = await unifiedTransactionStore.getTransactions();
        setTransactions(allTransactions);

        // Load proportions from Supabase
        const supabaseProportions = await supabaseTransactionStore.getProportionSettings();
        
        // Convert from snake_case to camelCase for calculation engine
        const proportionsForCalculation: ProportionSettings = {
          person1Percentage: supabaseProportions.person1_percentage,
          person2Percentage: supabaseProportions.person2_percentage,
        };
        
        setProportions(proportionsForCalculation);

        // Calculate expenses
        const calculationResults = calculateExpenses(allTransactions, proportionsForCalculation);
        setCalculations(calculationResults);
      } catch (error) {
        console.error('Error loading payment data:', error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load payment information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleMarkAsPaid = () => {
    toast({
      title: "Payment Marked as Paid",
      description: "Settlement has been recorded successfully.",
    });
    navigate('/app');
  };

  const handleRecalculate = () => {
    navigate('/app/categorize');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!calculations) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No calculation data available</h2>
        <p className="text-gray-600 mb-4">Please ensure you have categorized transactions.</p>
        <Button onClick={() => navigate('/app/categorize')}>
          Go to Categorize
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${Math.abs(amount).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Review the detailed calculation breakdown and verify the settlement amount before marking as paid.
        </p>
      </div>

      {/* Settlement Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Final Settlement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-900 mb-2">
              {formatCurrency(calculations.finalSettlementAmount)}
            </div>
            <div className="text-lg text-blue-700 mb-4">
              {calculations.settlementDirection === 'person1ToPerson2' 
                ? `${categoryNames.person1} owes ${categoryNames.person2}`
                : `${categoryNames.person2} owes ${categoryNames.person1}`
              }
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-blue-600">
              <span>Split: {proportions.person1Percentage}% / {proportions.person2Percentage}%</span>
              <span>•</span>
              <span>Total Expenses: {formatCurrency(calculations.totalSpending)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Should Pay vs Actually Paid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {categoryNames.person1}
              {calculations.person1NetPosition > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Should Pay</span>
                <span className="font-semibold">{formatCurrency(calculations.person1ShouldPay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Actually Paid</span>
                <span className="font-semibold">{formatCurrency(calculations.person1ActuallyPaid)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Position</span>
                  <span className={`font-bold ${calculations.person1NetPosition > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {calculations.person1NetPosition > 0 ? 'Owes' : 'Owed'} {formatCurrency(calculations.person1NetPosition)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Person 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {categoryNames.person2}
              {calculations.person2NetPosition > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Should Pay</span>
                <span className="font-semibold">{formatCurrency(calculations.person2ShouldPay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Actually Paid</span>
                <span className="font-semibold">{formatCurrency(calculations.person2ActuallyPaid)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Position</span>
                  <span className={`font-bold ${calculations.person2NetPosition > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {calculations.person2NetPosition > 0 ? 'Owes' : 'Owed'} {formatCurrency(calculations.person2NetPosition)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Calculation Breakdown */}
      <Card>
        <Collapsible open={showCalculationDetails} onOpenChange={setShowCalculationDetails}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Detailed Calculation Breakdown
                </CardTitle>
                {showCalculationDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              <CardDescription>
                View step-by-step calculation details and expense breakdown
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-700">Individual Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{categoryNames.person1}</span>
                        <span className="font-semibold">{formatCurrency(calculations.person1Individual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{categoryNames.person2}</span>
                        <span className="font-semibold">{formatCurrency(calculations.person2Individual)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-700">Shared Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Shared</span>
                        <span className="font-semibold">{formatCurrency(calculations.sharedTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{categoryNames.person1} Share</span>
                        <span className="font-semibold">{formatCurrency(calculations.person1ShareOfShared)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{categoryNames.person2} Share</span>
                        <span className="font-semibold">{formatCurrency(calculations.person2ShareOfShared)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-700">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Spending</span>
                        <span className="font-semibold">{formatCurrency(calculations.totalSpending)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Transactions</span>
                        <span className="font-semibold">{transactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Unclassified</span>
                        <span className="font-semibold">{calculations.categoryBreakdown.unclassified.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Settlement History Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Settlement History
          </CardTitle>
          <CardDescription>
            Previous payment cycles and verification checkpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <p className="mb-2">No previous settlements found</p>
            <p className="text-sm">This will be your first recorded settlement</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t p-4 -mx-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/app/review')}
          >
            Back to Review
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRecalculate}
            >
              Recalculate
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;