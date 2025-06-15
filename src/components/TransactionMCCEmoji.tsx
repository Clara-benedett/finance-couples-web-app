
import { Transaction } from "@/types/transaction";

interface TransactionMCCEmojiProps {
  mccCode?: string;
  isManualEntry?: boolean;
}

const TransactionMCCEmoji = ({ mccCode, isManualEntry }: TransactionMCCEmojiProps) => {
  // Show hand icon for manual entries
  if (isManualEntry) {
    return (
      <div className="text-xl" title="Manual Entry">
        ✋
      </div>
    );
  }

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

  if (!mccCode) return null;

  return (
    <div className="text-xl" title={`MCC: ${mccCode}`}>
      {getMCCEmoji(mccCode)}
    </div>
  );
};

export default TransactionMCCEmoji;
