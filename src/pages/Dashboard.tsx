
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, TrendingUp, Users, DollarSign, Settings, RefreshCw, Calendar, CreditCard, Target, Bug, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { transactionStore } from '@/store/transactionStore';
import { getCategoryNames } from '@/utils/categoryNames';
import { calculateExpenses, getProportionSettings, ProportionSettings } from '@/utils/calculationEngine';
import ProportionSettingsComponent from '@/components/ProportionSettings';
import DebugCalculation from '@/components/DebugCalculation';
import TestScenarios from '@/components/TestScenarios';
import { useDebugMode } from '@/hooks/useDebugMode';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Dashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(transactionStore.getTransactions());
  const [proportions, setProportions] = useState<ProportionSettings>(getProportionSettings());
  const [showProportionSettings, setShowProportionSettings] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const { isDebugMode, toggleDebugMode } = useDebugMode();
  const categoryNames = getCategoryNames();

  useEffect(() => {
    const unsubscribe = transactionStore.subscribe(() => {
      setTransactions(transactionStore.getTransactions());
    });
    return unsubscribe;
  }, []);

  const calculations = calculateExpenses(transactions, proportions);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleProportionUpdate = (newProportions: ProportionSettings) => {
    setProportions(newProportions);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (showProportionSettings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Settings</h1>
          <Button variant="outline" onClick={() => setShowProportionSettings(false)}>
            Back to Dashboard
          </Button>
        </div>
        <ProportionSettingsComponent
          proportions={proportions}
          onUpdate={handleProportionUpdate}
          onClose={() => setShowProportionSettings(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Couply</h1>
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{currentMonth}</span>
              {isDebugMode && (
                <Badge variant="secondary" className="ml-2 text-xs">DEBUG MODE</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={toggleDebugMode}
              variant={isDebugMode ? "secondary" : "outline"}
              size="sm"
              className={isDebugMode ? "bg-yellow-500 text-yellow-900 hover:bg-yellow-400" : "bg-white text-blue-600 hover:bg-gray-100"}
            >
              <Bug className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => setShowProportionSettings(true)}
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => navigate("/upload")}
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Mode Sections */}
      {isDebugMode && (
        <div className="space-y-6">
          <DebugCalculation calculations={calculations} transactions={transactions} />
          <TestScenarios />
        </div>
      )}

      {/* HERO SECTION - Final Settlement */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 border-2 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div>
              <div className="text-sm text-orange-700 mb-2 font-medium">Final Settlement</div>
              <div className="text-5xl font-bold text-orange-600 mb-3">
                {formatCurrency(calculations.finalSettlementAmount)}
              </div>
              <p className="text-xl text-orange-800 font-medium">
                {calculations.settlementDirection === 'person1ToPerson2'
                  ? `${categoryNames.person1} owes ${categoryNames.person2}`
                  : `${categoryNames.person2} owes ${categoryNames.person1}`
                }
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-orange-700">
              <span>Split: {proportions.person1Percentage}% / {proportions.person2Percentage}%</span>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Paid
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-orange-300 hover:bg-orange-50"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculations.totalSpending)}</div>
            <div className="text-sm text-gray-600">Total Monthly Spending</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(calculations.person1Individual + calculations.person1ShareOfShared)}</div>
            <div className="text-sm text-gray-600">{categoryNames.person1} Expenses</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(calculations.person2Individual + calculations.person2ShareOfShared)}</div>
            <div className="text-sm text-gray-600">{categoryNames.person2} Expenses</div>
          </CardContent>
        </Card>
      </div>

      {/* ACTION ITEMS */}
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
                onClick={() => navigate("/categorize")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Categorize Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PROGRESSIVE DISCLOSURE - Calculation Details */}
      <Collapsible open={showCalculationDetails} onOpenChange={setShowCalculationDetails}>
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
              onClick={() => navigate("/upload")}
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
              onClick={() => navigate("/categorize")}
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

export default Dashboard;
