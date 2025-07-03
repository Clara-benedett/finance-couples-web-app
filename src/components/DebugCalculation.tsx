
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Copy, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Transaction } from "@/types/transaction";
import { CalculationResults } from "@/utils/calculationEngine";
import { useCategoryNames } from "@/hooks/useCategoryNames";

interface DebugCalculationProps {
  calculations: CalculationResults;
  transactions: Transaction[];
}

const DebugCalculation = ({ calculations, transactions }: DebugCalculationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { categoryNames } = useCategoryNames();

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Data validation
  const validationIssues = [];
  const invalidTransactions = transactions.filter(t => !t.cardName || !t.paidBy);
  if (invalidTransactions.length > 0) {
    validationIssues.push(`${invalidTransactions.length} transactions missing cardName or paidBy`);
  }

  // Card breakdown
  const cardBreakdown = transactions.reduce((acc, transaction) => {
    const cardName = transaction.cardName || 'Unknown Card';
    if (!acc[cardName]) {
      acc[cardName] = {
        total: 0,
        paidBy: transaction.paidBy,
        transactions: []
      };
    }
    acc[cardName].total += transaction.amount;
    acc[cardName].transactions.push(transaction);
    return acc;
  }, {} as Record<string, { total: number; paidBy: string; transactions: Transaction[] }>);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const generateDebugReport = () => {
    return `
DEBUG CALCULATION BREAKDOWN:

1. Should Pay:
   - ${categoryNames.person1}: ${formatCurrency(calculations.person1Individual)} personal + ${formatCurrency(calculations.person1ShareOfShared)} shared = ${formatCurrency(calculations.person1ShouldPay)} total
   - ${categoryNames.person2}: ${formatCurrency(calculations.person2Individual)} personal + ${formatCurrency(calculations.person2ShareOfShared)} shared = ${formatCurrency(calculations.person2ShouldPay)} total

2. Actually Paid:
   - ${categoryNames.person1}: ${formatCurrency(calculations.person1ActuallyPaid)}
   - ${categoryNames.person2}: ${formatCurrency(calculations.person2ActuallyPaid)}

3. Net Positions:
   - ${categoryNames.person1}: Should pay ${formatCurrency(calculations.person1ShouldPay)} - Actually paid ${formatCurrency(calculations.person1ActuallyPaid)} = ${formatCurrency(calculations.person1NetPosition)} net
   - ${categoryNames.person2}: Should pay ${formatCurrency(calculations.person2ShouldPay)} - Actually paid ${formatCurrency(calculations.person2ActuallyPaid)} = ${formatCurrency(calculations.person2NetPosition)} net

4. Final Settlement: ${formatCurrency(calculations.finalSettlementAmount)} from ${calculations.settlementDirection === 'person1ToPerson2' ? categoryNames.person1 : categoryNames.person2} to ${calculations.settlementDirection === 'person1ToPerson2' ? categoryNames.person2 : categoryNames.person1}

CARD BREAKDOWN:
${Object.entries(cardBreakdown).map(([cardName, info]) => 
  `${cardName}: ${formatCurrency(info.total)} (paid by ${info.paidBy})`
).join('\n')}
    `.trim();
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border-2 border-yellow-300 bg-yellow-50">
        <CardHeader>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                🔍 Debug Calculation Breakdown
                <Badge variant="outline" className="text-xs">DEV MODE</Badge>
              </CardTitle>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-yellow-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-yellow-600" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
      </Card>

      <CollapsibleContent className="space-y-4 mt-3">
        {/* Data Validation Issues */}
        {validationIssues.length > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Data Validation Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-red-700 text-sm">
                {validationIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Step-by-Step Calculation */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-800">Step-by-Step Calculation</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generateDebugReport(), 'calculation')}
              className="text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              {copiedSection === 'calculation' ? 'Copied!' : 'Copy'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-sm">
            <div>
              <h4 className="font-bold text-blue-800 mb-2">1. Should Pay:</h4>
              <div className="ml-4 space-y-1">
                <div>• {categoryNames.person1}: {formatCurrency(calculations.person1Individual)} personal + {formatCurrency(calculations.person1ShareOfShared)} shared = <span className="font-bold">{formatCurrency(calculations.person1ShouldPay)}</span> total</div>
                <div>• {categoryNames.person2}: {formatCurrency(calculations.person2Individual)} personal + {formatCurrency(calculations.person2ShareOfShared)} shared = <span className="font-bold">{formatCurrency(calculations.person2ShouldPay)}</span> total</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-blue-800 mb-2">2. Actually Paid:</h4>
              <div className="ml-4 space-y-1">
                <div>• {categoryNames.person1}: <span className="font-bold">{formatCurrency(calculations.person1ActuallyPaid)}</span></div>
                <div>• {categoryNames.person2}: <span className="font-bold">{formatCurrency(calculations.person2ActuallyPaid)}</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-blue-800 mb-2">3. Net Positions:</h4>
              <div className="ml-4 space-y-1">
                <div>• {categoryNames.person1}: Should pay {formatCurrency(calculations.person1ShouldPay)} - Actually paid {formatCurrency(calculations.person1ActuallyPaid)} = <span className={`font-bold ${calculations.person1NetPosition >= 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(calculations.person1NetPosition)}</span> net</div>
                <div>• {categoryNames.person2}: Should pay {formatCurrency(calculations.person2ShouldPay)} - Actually paid {formatCurrency(calculations.person2ActuallyPaid)} = <span className={`font-bold ${calculations.person2NetPosition >= 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(calculations.person2NetPosition)}</span> net</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-blue-800 mb-2">4. Final Settlement:</h4>
              <div className="ml-4">
                <span className="font-bold text-orange-600">{formatCurrency(calculations.finalSettlementAmount)}</span> from {calculations.settlementDirection === 'person1ToPerson2' ? categoryNames.person1 : categoryNames.person2} to {calculations.settlementDirection === 'person1ToPerson2' ? categoryNames.person2 : categoryNames.person1}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Breakdown */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Card Attribution Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(cardBreakdown).map(([cardName, info]) => (
                <div key={cardName} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">{cardName}</span>
                  <div className="text-sm">
                    <span className="font-bold">{formatCurrency(info.total)}</span>
                    <span className="text-gray-600 ml-2">(paid by {info.paidBy})</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <h5 className="font-bold text-green-800 mb-2">Verification:</h5>
              <div className="text-sm space-y-1">
                <div>Total from cards: {formatCurrency(Object.values(cardBreakdown).reduce((sum, info) => sum + info.total, 0))}</div>
                <div>Sum of actually paid: {formatCurrency(calculations.person1ActuallyPaid + calculations.person2ActuallyPaid)}</div>
                <div className={`font-bold ${Math.abs((Object.values(cardBreakdown).reduce((sum, info) => sum + info.total, 0)) - (calculations.person1ActuallyPaid + calculations.person2ActuallyPaid)) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  ✓ Totals match: {Math.abs((Object.values(cardBreakdown).reduce((sum, info) => sum + info.total, 0)) - (calculations.person1ActuallyPaid + calculations.person2ActuallyPaid)) < 0.01 ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DebugCalculation;
