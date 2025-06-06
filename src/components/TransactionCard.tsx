
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Square, Info, Zap, Bot } from "lucide-react";
import { Transaction } from "@/types/transaction";
import CategoryButtons from "./CategoryButtons";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface TransactionCardProps {
  transaction: Transaction;
  isSelected: boolean;
  ruleEligibility: {
    category: CategoryType;
    categoryDisplayName: string;
    count: number;
  } | null;
  onToggleSelection: () => void;
  onCategoryClick: (category: CategoryType) => void;
  onCreateRuleClick: (merchantName: string, category: CategoryType, categoryDisplayName: string) => void;
  isInCategorizedSection?: boolean;
}

const TransactionCard = ({
  transaction,
  isSelected,
  ruleEligibility,
  onToggleSelection,
  onCategoryClick,
  onCreateRuleClick,
  isInCategorizedSection = false
}: TransactionCardProps) => {
  const getMCCEmoji = (mccCode?: string) => {
    if (!mccCode) return '';
    
    const code = mccCode.trim();
    
    // Fast Food
    if (['5814'].includes(code)) return '🍔';
    
    // Restaurants
    if (['5812', '5813'].includes(code)) return '🍽️';
    
    // Transportation (Uber, Lyft, Taxi)
    if (['4121', '4131', '4111'].includes(code)) return '🚗';
    
    // Gas Stations
    if (['5541', '5542'].includes(code)) return '⛽';
    
    // Grocery Stores
    if (['5411'].includes(code)) return '🛒';
    
    // Department Stores
    if (['5311', '5331'].includes(code)) return '🏪';
    
    // Hotels
    if (['7011'].includes(code)) return '🏨';
    
    // Airlines
    if (['4511'].includes(code)) return '✈️';
    
    // Pharmacies
    if (['5912'].includes(code)) return '💊';
    
    // Coffee Shops
    if (['5814'].includes(code)) return '☕';
    
    // ATM/Banking
    if (['6011', '6012'].includes(code)) return '🏧';
    
    return '💳'; // Default for other transactions
  };

  const handleCreateRuleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (ruleEligibility) {
      onCreateRuleClick(transaction.description, ruleEligibility.category, ruleEligibility.categoryDisplayName);
    }
  };

  const cardClassName = isInCategorizedSection 
    ? "hover:shadow-sm transition-shadow bg-gray-50 opacity-90"
    : "hover:shadow-md transition-shadow";

  return (
    <Card className={cardClassName}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Selection Checkbox */}
          <button
            onClick={onToggleSelection}
            className="text-gray-400 hover:text-gray-600"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>

          {/* MCC Emoji */}
          {transaction.mccCode && (
            <div className="text-xl" title={`MCC: ${transaction.mccCode}`}>
              {getMCCEmoji(transaction.mccCode)}
            </div>
          )}

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {transaction.description}
                  </h3>
                  
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
                        <p>Auto-categorized using rule</p>
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
                              <span className="text-yellow-600">Yes</span>
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                  <span>{transaction.date}</span>
                  <span>•</span>
                  <span className="font-medium">{transaction.cardName}</span>
                  <span>•</span>
                  <span className="font-semibold text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </span>
                  {transaction.location && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">{transaction.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="ml-4">
            <CategoryButtons
              currentCategory={transaction.category}
              onCategoryClick={onCategoryClick}
              isDisabled={isInCategorizedSection}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
