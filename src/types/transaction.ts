
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  cardName: string;
  paidBy: 'person1' | 'person2';
  isClassified: boolean;
  mccCode?: string;
  bankCategory?: string;
  transactionType?: string;
  location?: string;
  referenceNumber?: string;
  autoAppliedRule?: boolean;
  isManualEntry?: boolean;
  paymentMethod?: string;
}

export interface ParsedTransaction {
  date: string;
  amount: number;
  description: string;
  category?: string;
  mccCode?: string;
  bankCategory?: string;
  transactionType?: string;
  location?: string;
  referenceNumber?: string;
}
