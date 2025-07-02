
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, RotateCcw } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { supabaseTransactionStore } from "@/store/supabaseTransactionStore";
import { calculateExpenses } from "@/utils/calculationEngine";

const TestScenarios = () => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const createSampleData = (): Transaction[] => {
    return [
      // Person1's personal expenses
      {
        id: 'test-1',
        date: '2024-01-15',
        description: 'Personal Gym Membership',
        amount: 50,
        category: 'person1',
        cardName: 'Person1 Card',
        paidBy: 'person1',
        isClassified: true
      },
      {
        id: 'test-2',
        date: '2024-01-16',
        description: 'Personal Coffee',
        amount: 15,
        category: 'person1',
        cardName: 'Person1 Card',
        paidBy: 'person1',
        isClassified: true
      },
      
      // Person2's personal expenses
      {
        id: 'test-3',
        date: '2024-01-17',
        description: 'Personal Book',
        amount: 25,
        category: 'person2',
        cardName: 'Person2 Card',
        paidBy: 'person2',
        isClassified: true
      },
      {
        id: 'test-4',
        date: '2024-01-18',
        description: 'Personal Lunch',
        amount: 30,
        category: 'person2',
        cardName: 'Person2 Card',
        paidBy: 'person2',
        isClassified: true
      },
      
      // Shared expenses - some paid by person1, some by person2
      {
        id: 'test-5',
        date: '2024-01-19',
        description: 'Groceries',
        amount: 100,
        category: 'shared',
        cardName: 'Person1 Card',
        paidBy: 'person1',
        isClassified: true
      },
      {
        id: 'test-6',
        date: '2024-01-20',
        description: 'Dinner Date',
        amount: 80,
        category: 'shared',
        cardName: 'Person2 Card',
        paidBy: 'person2',
        isClassified: true
      },
      {
        id: 'test-7',
        date: '2024-01-21',
        description: 'Utilities',
        amount: 120,
        category: 'shared',
        cardName: 'Person1 Card',
        paidBy: 'person1',
        isClassified: true
      }
    ];
  };

  const runTestScenario = async () => {
    const sampleData = createSampleData();
    
    // Clear existing data and add sample data
    await supabaseTransactionStore.clearTransactions();
    await supabaseTransactionStore.addTransactions(sampleData);
  };

  const clearTestData = async () => {
    await supabaseTransactionStore.clearTransactions();
  };

  // Calculate expected results for the test scenario
  const sampleData = createSampleData();
  const testCalculations = calculateExpenses(sampleData);

  const expectedResults = {
    person1Individual: 65, // 50 + 15
    person2Individual: 55, // 25 + 30
    sharedTotal: 300, // 100 + 80 + 120
    person1ShareOfShared: 135, // 45% of 300
    person2ShareOfShared: 165, // 55% of 300
    person1ShouldPay: 200, // 65 + 135
    person2ShouldPay: 220, // 55 + 165
    person1ActuallyPaid: 220, // 100 + 120 (from person1 card)
    person2ActuallyPaid: 110, // 80 + 30 (from person2 card)
    person1NetPosition: -20, // 200 - 220
    person2NetPosition: 110, // 220 - 110
    finalSettlement: 65 // |(-20) - 110| / 2 = 65
  };

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800 flex items-center gap-2">
          🧪 Test Scenarios
          <Badge variant="outline" className="text-xs">TESTING</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-purple-800 mb-2">Test Scenario 1: Mixed Payments</h4>
            <div className="text-sm space-y-1 text-purple-700">
              <div>• Person1 personal: {formatCurrency(expectedResults.person1Individual)}</div>
              <div>• Person2 personal: {formatCurrency(expectedResults.person2Individual)}</div>
              <div>• Shared total: {formatCurrency(expectedResults.sharedTotal)}</div>
              <div>• Person1 card bills: {formatCurrency(expectedResults.person1ActuallyPaid)}</div>
              <div>• Person2 card bills: {formatCurrency(expectedResults.person2ActuallyPaid)}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-purple-800 mb-2">Expected Results:</h4>
            <div className="text-sm space-y-1 text-purple-700">
              <div>• Person1 should pay: {formatCurrency(expectedResults.person1ShouldPay)}</div>
              <div>• Person2 should pay: {formatCurrency(expectedResults.person2ShouldPay)}</div>
              <div>• Person1 net: {formatCurrency(expectedResults.person1NetPosition)}</div>
              <div>• Person2 net: {formatCurrency(expectedResults.person2NetPosition)}</div>
              <div className="font-bold">• Settlement: {formatCurrency(expectedResults.finalSettlement)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={runTestScenario}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Load Test Data
          </Button>
          <Button 
            onClick={clearTestData}
            variant="outline"
            className="border-purple-300 hover:bg-purple-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Test Data
          </Button>
        </div>

        <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
          💡 This will replace all current transactions with test data. Use "Clear Test Data" to remove the test transactions.
        </div>
      </CardContent>
    </Card>
  );
};

export default TestScenarios;
