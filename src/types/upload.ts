
export interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  transactionCount?: number;
  cardName?: string;
  autoClassifiedCount?: number;
}

export interface CardInfo {
  name: string;
  paidBy: 'person1' | 'person2';
  autoClassification?: 'person1' | 'person2' | 'shared' | 'skip';
}

export interface DuplicateReviewState {
  duplicates: any[];
  pendingTransactions: any[];
  cardInfos: CardInfo[];
  totalTransactions: number;
  uniqueTransactions: number;
}
