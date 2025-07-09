
import { getTransactionEmoji } from "@/utils/emojiMapping";

interface TransactionMCCEmojiProps {
  mccCode?: string;
  bankCategory?: string;
  description?: string;
  isManualEntry?: boolean;
}

const TransactionMCCEmoji = ({ 
  mccCode, 
  bankCategory, 
  description, 
  isManualEntry 
}: TransactionMCCEmojiProps) => {
  // Show hand icon for manual entries
  if (isManualEntry) {
    return (
      <div className="text-xl" title="Manual Entry">
        ✋
      </div>
    );
  }

  const emoji = getTransactionEmoji(mccCode, bankCategory, description);
  const sources = [];
  if (mccCode) sources.push(`MCC: ${mccCode}`);
  if (bankCategory) sources.push(`Category: ${bankCategory}`);
  if (description) sources.push(`Description: ${description.substring(0, 30)}...`);
  
  const title = sources.length > 0 ? sources.join(' | ') : 'Transaction';

  return (
    <div className="text-xl" title={title}>
      {emoji}
    </div>
  );
};

export default TransactionMCCEmoji;
