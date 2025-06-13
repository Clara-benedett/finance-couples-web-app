
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Square } from "lucide-react";
import { Transaction } from "@/types/transaction";
import CategoryButtons from "./CategoryButtons";
import TransactionMCCEmoji from "./TransactionMCCEmoji";
import TransactionDetails from "./TransactionDetails";

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
  // Update card styling to show subtle difference for auto-categorized transactions
  const getCardClassName = () => {
    let baseClass = "hover:shadow-md transition-shadow";
    
    if (isInCategorizedSection) {
      baseClass = "hover:shadow-sm transition-shadow bg-gray-50";
      
      // Add subtle styling for auto-categorized transactions
      if (transaction.autoAppliedRule) {
        baseClass += " border-l-2 border-l-yellow-300";
      } else {
        baseClass += " opacity-90";
      }
    }
    
    return baseClass;
  };

  return (
    <Card className={getCardClassName()}>
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
          <TransactionMCCEmoji mccCode={transaction.mccCode} />

          {/* Transaction Details */}
          <TransactionDetails
            transaction={transaction}
            ruleEligibility={ruleEligibility}
            onCreateRuleClick={onCreateRuleClick}
            isInCategorizedSection={isInCategorizedSection}
          />

          {/* Category Buttons - Always enabled, never disabled */}
          <div className="ml-4">
            <CategoryButtons
              currentCategory={transaction.category}
              onCategoryClick={onCategoryClick}
              isDisabled={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
