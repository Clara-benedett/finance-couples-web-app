
import { Transaction } from "@/types/transaction";
import TransactionActions from "./TransactionActions";
import TransactionMetadata from "./TransactionMetadata";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

interface TransactionDetailsProps {
  transaction: Transaction;
  ruleEligibility: {
    category: CategoryType;
    categoryDisplayName: string;
    count: number;
  } | null;
  onCreateRuleClick: (merchantName: string, category: CategoryType, categoryDisplayName: string) => void;
  isInCategorizedSection?: boolean;
}

const TransactionDetails = ({
  transaction,
  ruleEligibility,
  onCreateRuleClick,
  isInCategorizedSection = false
}: TransactionDetailsProps) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {transaction.description}
            </h3>
            
            <TransactionActions
              transaction={transaction}
              ruleEligibility={ruleEligibility}
              onCreateRuleClick={onCreateRuleClick}
              isInCategorizedSection={isInCategorizedSection}
            />
          </div>
          
          <TransactionMetadata transaction={transaction} />
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
