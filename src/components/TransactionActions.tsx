
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Zap, Bot } from "lucide-react";
import { Transaction } from "@/types/transaction";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface TransactionActionsProps {
  transaction: Transaction;
  ruleEligibility: {
    category: CategoryType;
    categoryDisplayName: string;
    count: number;
  } | null;
  onCreateRuleClick: (merchantName: string, category: CategoryType, categoryDisplayName: string) => void;
  isInCategorizedSection?: boolean;
}

const TransactionActions = ({
  transaction,
  ruleEligibility,
  onCreateRuleClick,
  isInCategorizedSection = false
}: TransactionActionsProps) => {
  const handleCreateRuleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (ruleEligibility) {
      onCreateRuleClick(transaction.description, ruleEligibility.category, ruleEligibility.categoryDisplayName);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Auto-rule Button - only show for uncategorized */}
      {ruleEligibility && !isInCategorizedSection && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateRuleClick}
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 animate-fade-in"
            >
              <Bot className="w-3 h-3 mr-1" />
              Auto-rule
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create rule to auto-categorize {transaction.description}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Zap icon for auto-categorized transactions */}
      {transaction.autoAppliedRule && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Zap className="w-4 h-4 text-yellow-500" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Auto-categorized using rule (click to override)</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Hover card for additional details */}
      {(transaction.transactionType || transaction.referenceNumber) && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600">
              <Info className="w-4 h-4" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 bg-white border shadow-lg">
            <div className="space-y-2">
              {transaction.transactionType && (
                <div>
                  <span className="font-medium text-gray-700">Type: </span>
                  <span className="text-gray-600">{transaction.transactionType}</span>
                </div>
              )}
              {transaction.referenceNumber && (
                <div>
                  <span className="font-medium text-gray-700">Reference: </span>
                  <span className="text-gray-600">{transaction.referenceNumber}</span>
                </div>
              )}
              {transaction.mccCode && (
                <div>
                  <span className="font-medium text-gray-700">MCC Code: </span>
                  <span className="text-gray-600">{transaction.mccCode}</span>
                </div>
              )}
              {transaction.autoAppliedRule && (
                <div>
                  <span className="font-medium text-gray-700">Auto-categorized: </span>
                  <span className="text-yellow-600">Yes (editable)</span>
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};

export default TransactionActions;
