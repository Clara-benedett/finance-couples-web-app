import { ParsedTransaction } from "@/types/transaction";

export function parseOptionalField(value: any): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const strValue = String(value).trim();
  return strValue === '' ? undefined : strValue;
}

export function findColumn(headers: string[], columnType: string): number {
  const columnMappings = {
    date: ['date', 'transaction date', 'trans date', 'posting date', 'post date', 'fecha', 'datum', 'data', 'дата', '日期', '날짜'],
    amount: ['amount', 'transaction amount', 'trans amount', 'debit', 'credit', 'sum', 'total', 'value', 'importe', 'betrag', 'importo', 'сумма', '金额', '금액'],
    description: ['description', 'memo', 'reference', 'details', 'merchant', 'payee', 'descripción', 'beschreibung', 'descrizione', 'описание', '描述', '설명'],
    category: ['category', 'type', 'classification', 'class', 'group', 'categoría', 'kategorie', 'categoria', 'категория', '类别', '카테고리'],
    mccCode: ['mcc', 'mcc code', 'merchant category code', 'category code'],
    bankCategory: ['bank category', 'bank type', 'institution category'],
    transactionType: ['transaction type', 'trans type', 'payment type', 'type'],
    location: ['location', 'merchant location', 'address', 'city', 'place'],
    referenceNumber: ['reference number', 'ref number', 'ref no', 'reference', 'confirmation number'],
    cardMember: ['card member', 'cardholder', 'member', 'card holder', 'account holder', 'user', 'name', 'holder name', 'member name'],
    accountNumber: ['account number', 'account no', 'account #', 'acct number', 'acct no', 'card number', 'card no', 'account', 'acct']
  };

  const normalizedHeaders = headers.map(header => header.toLowerCase().trim());
  const columnOptions = columnMappings[columnType];

  for (const option of columnOptions) {
    const index = normalizedHeaders.indexOf(option);
    if (index > -1) {
      return index;
    }
  }

  return -1;
}

export interface ColumnMappings {
  date: string[];
  amount: string[];
  description: string[];
  category: string[];
  mccCode: string[];
  bankCategory: string[];
  transactionType: string[];
  location: string[];
  referenceNumber: string[];
  cardMember: string[];
  accountNumber: string[];
}

export const COLUMN_MAPPINGS: ColumnMappings = {
  date: [
    'date', 'transaction date', 'trans date', 'posting date', 'post date',
    'fecha', 'datum', 'data', 'дата', '日期', '날짜'
  ],
  amount: [
    'amount', 'transaction amount', 'trans amount', 'debit', 'credit',
    'sum', 'total', 'value', 'importe', 'betrag', 'importo', 'сумма', '金额', '금액'
  ],
  description: [
    'description', 'memo', 'reference', 'details', 'merchant', 'payee',
    'descripción', 'beschreibung', 'descrizione', 'описание', '描述', '설명'
  ],
  category: [
    'category', 'type', 'classification', 'class', 'group',
    'categoría', 'kategorie', 'categoria', 'категория', '类别', '카테고리'
  ],
  mccCode: [
    'mcc', 'mcc code', 'merchant category code', 'category code'
  ],
  bankCategory: [
    'bank category', 'bank type', 'institution category'
  ],
  transactionType: [
    'transaction type', 'trans type', 'payment type', 'type'
  ],
  location: [
    'location', 'merchant location', 'address', 'city', 'place'
  ],
  referenceNumber: [
    'reference number', 'ref number', 'ref no', 'reference', 'confirmation number'
  ],
  cardMember: [
    'card member', 'cardholder', 'member', 'card holder', 'account holder',
    'user', 'name', 'holder name', 'member name'
  ],
  accountNumber: [
    'account number', 'account no', 'account #', 'acct number', 'acct no',
    'card number', 'card no', 'account', 'acct'
  ]
};

export function detectExtraFields(headers: string[]): string[] {
  const detectedFields: string[] = [];
  
  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    
    // Check for MCC code
    if (COLUMN_MAPPINGS.mccCode.some(pattern => normalizedHeader.includes(pattern))) {
      if (!detectedFields.includes('mccCode')) {
        detectedFields.push('mccCode');
      }
    }
    
    // Check for bank category
    if (COLUMN_MAPPINGS.bankCategory.some(pattern => normalizedHeader.includes(pattern))) {
      if (!detectedFields.includes('bankCategory')) {
        detectedFields.push('bankCategory');
      }
    }
    
    // Check for transaction type
    if (COLUMN_MAPPINGS.transactionType.some(pattern => normalizedHeader.includes(pattern))) {
      if (!detectedFields.includes('transactionType')) {
        detectedFields.push('transactionType');
      }
    }
    
    // Check for location
    if (COLUMN_MAPPINGS.location.some(pattern => normalizedHeader.includes(pattern))) {
      if (!detectedFields.includes('location')) {
        detectedFields.push('location');
      }
    }
    
    // Check for reference number
    if (COLUMN_MAPPINGS.referenceNumber.some(pattern => normalizedHeader.includes(pattern))) {
      if (!detectedFields.includes('referenceNumber')) {
        detectedFields.push('referenceNumber');
      }
    }
    
    // Check for card member
    if (COLUMN_MAPPINGS.cardMember.some(pattern => normalizedHeader.includes(pattern))) {
      if (!detectedFields.includes('cardMember')) {
        detectedFields.push('cardMember');
      }
    }
    
    // Check for account number
    if (COLUMN_MAPPINGS.accountNumber.some(pattern => normalizedHeader.includes(pattern))) {
      if (!detectedFields.includes('accountNumber')) {
        detectedFields.push('accountNumber');
      }
    }
  }
  
  return detectedFields;
}
