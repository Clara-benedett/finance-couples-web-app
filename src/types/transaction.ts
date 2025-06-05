
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  cardName: string;
  isClassified: boolean;
}

export interface ParsedTransaction {
  date: string;
  amount: number;
  description: string;
  category?: string;
}
