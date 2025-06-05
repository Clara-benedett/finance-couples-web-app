
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, TrendingUp, Users, DollarSign, Settings, RefreshCw, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { transactionStore } from '@/store/transactionStore';
import { getCategoryNames } from '@/utils/categoryNames';
import { calculateExpenses, getProportionSettings, ProportionSettings } from '@/utils/calculationEngine';
import ProportionSettingsComponent from '@/components/ProportionSettings';

const Dashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(transactionStore.getTransactions());
  const [proportions, setProportions] = useState<ProportionSettings>(getProportionSettings());
  const [showProportionSettings, setShowProportionSettings] = useState(false);
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

  const stats = [
    {
      title: `${categoryNames.person1} Individual`,
      value: formatCurrency(calculations.person1Individual),
      description: `${calculations.categoryBreakdown.person1.length} transactions`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: `${categoryNames.person2} Individual`,
      value: formatCurrency(calculations.person2Individual),
      description: `${calculations.categoryBreakdown.person2.length} transactions`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: `${categoryNames.shared} Total`,
      value: formatCurrency(calculations.sharedTotal),
      description: `${calculations.categoryBreakdown.shared.length} transactions`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Couply</h1>
            <p className="text-blue-100 mb-2">
              Track, categorize, and split your expenses seamlessly as a couple
            </p>
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Calculations for {currentMonth}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowProportionSettings(true)}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-2" />
              Split Settings
            </Button>
            <Button 
              onClick={() => navigate("/upload")}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Expenses
            </Button>
          </div>
        </div>
      </div>

      {/* Individual Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={`hover:shadow-lg transition-shadow duration-200 ${stat.bgColor} ${stat.borderColor} border-2`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Final Amount Section */}
      <Card className="bg-orange-50 border-orange-200 border-2">
        <CardHeader>
          <CardTitle className="text-center text-xl text-orange-800">
            Final Settlement
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-orange-600">
            {formatCurrency(calculations.finalAmountOwed)}
          </div>
          <p className="text-lg text-orange-800">
            {calculations.whoOwesWho === 'person1' 
              ? `${categoryNames.person1} owes ${categoryNames.person2}`
              : `${categoryNames.person2} owes ${categoryNames.person1}`
            }
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>{categoryNames.person1}: {proportions.person1Percentage}% of shared</span>
            <span>•</span>
            <span>{categoryNames.person2}: {proportions.person2Percentage}% of shared</span>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalculate
          </Button>
        </CardContent>
      </Card>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Expense Breakdown</CardTitle>
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
                <span className="text-gray-900">{categoryNames.person1} Total:</span>
                <span className="text-blue-600">{formatCurrency(calculations.person1TotalOwed)}</span>
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
                  <span className="text-gray-900">{categoryNames.person2} Total:</span>
                  <span className="text-green-600">{formatCurrency(calculations.person2TotalOwed)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Monthly Summary</CardTitle>
            <CardDescription>Overall spending statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Monthly Spending:</span>
              <span className="font-bold text-xl text-gray-900">{formatCurrency(calculations.totalSpending)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Individual Average:</span>
                <span className="font-medium">{formatCurrency((calculations.person1Individual + calculations.person2Individual) / 2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Shared Expenses:</span>
                <span className="font-medium">{formatCurrency(calculations.sharedTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unclassified:</span>
                <span className="font-medium text-orange-600">
                  {calculations.categoryBreakdown.unclassified.length} transactions
                </span>
              </div>
            </div>

            {calculations.categoryBreakdown.unclassified.length > 0 && (
              <div className="pt-2">
                <Button 
                  onClick={() => navigate("/categorize")}
                  variant="outline"
                  className="w-full border-orange-300 hover:bg-orange-50"
                >
                  Categorize Remaining Transactions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Quick Upload</CardTitle>
            <CardDescription>
              Upload your latest credit card statements to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/upload")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Statements
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Review Categories</CardTitle>
            <CardDescription>
              Review and adjust expense categories for better tracking
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
