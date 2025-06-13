
import { Transaction } from "@/types/transaction";

interface TransactionMetadataProps {
  transaction: Transaction;
}

const TransactionMetadata = ({ transaction }: TransactionMetadataProps) => {
  return (
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
  );
};

export default TransactionMetadata;
