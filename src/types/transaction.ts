
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  cardName: string;
  isClassified: boolean;
  mccCode?: string;
  transactionType?: string;
  location?: string;
  referenceNumber?: string;
}

export interface ParsedTransaction {
  date: string;
  amount: number;
  description: string;
  category?: string;
  mccCode?: string;
  transactionType?: string;
  location?: string;
  referenceNumber?: string;
}
