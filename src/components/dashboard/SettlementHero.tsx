
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, Calendar } from "lucide-react";
import { CalculationResults } from "@/utils/calculationEngine";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { supabaseTransactionStore } from "@/store/supabaseTransactionStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SettlementHeroProps {
  calculations: CalculationResults;
  proportions: { person1Percentage: number; person2Percentage: number };
  currentMonth: string;
}

const SettlementHero = ({ calculations, proportions, currentMonth }: SettlementHeroProps) => {
  const { categoryNames, loading } = useCategoryNames();
  const { toast } = useToast();
  const navigate = useNavigate();
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const handleMarkAsPaid = async () => {
    try {
      const success = await supabaseTransactionStore.markTransactionsAsPaid();
      
      if (success) {
        toast({
          title: "Payment Marked as Paid",
          description: "Settlement has been recorded successfully.",
        });
        // Refresh the page to update calculations
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to mark transactions as paid. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error marking transactions as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark transactions as paid. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 border-2 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div>
            <div className="text-sm text-orange-700 mb-2 font-medium">Final Settlement</div>
            <div className="text-5xl font-bold text-orange-600 mb-3">
              {formatCurrency(calculations.finalSettlementAmount)}
            </div>
            {loading ? (
              <p className="text-xl text-orange-800 font-medium">
                Loading...
              </p>
            ) : (
              <p className="text-xl text-orange-800 font-medium">
                {calculations.settlementDirection === 'person1ToPerson2'
                  ? `${categoryNames.person1} owes ${categoryNames.person2}`
                  : `${categoryNames.person2} owes ${categoryNames.person1}`
                }
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-orange-700">
            <span>Split: {proportions.person1Percentage}% / {proportions.person2Percentage}%</span>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
              onClick={handleMarkAsPaid}
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
  );
};

export default SettlementHero;
