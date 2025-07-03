
import { Card, CardContent } from "@/components/ui/card";
import { CalculationResults } from "@/utils/calculationEngine";
import { useCategoryNames } from "@/hooks/useCategoryNames";

interface OverviewCardsProps {
  calculations: CalculationResults;
}

const OverviewCards = ({ calculations }: OverviewCardsProps) => {
  const { categoryNames } = useCategoryNames();
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
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
  );
};

export default OverviewCards;
