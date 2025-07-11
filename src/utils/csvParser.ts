
import Papa from 'papaparse';
import { ParsedTransaction } from '@/types/transaction';
import { findColumn, detectExtraFields } from './columnMapper';
import { parseDate } from './dateParser';

function parseOptionalField(value: any): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const strValue = String(value).trim();
  return strValue === '' ? undefined : strValue;
}

function parseAmount(value: any): number {
  const cleanedValue = String(value).replace(/[^0-9.-]+/g, '');
  const parsedAmount = parseFloat(cleanedValue);
  return isNaN(parsedAmount) ? 0 : parsedAmount;
}

export function parseCSV(file: File): Promise<{ 
  transactions: ParsedTransaction[], 
  detectedFields: string[] 
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        
        const result = Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim()
        });

        if (result.errors.length > 0) {
          console.warn('CSV parsing errors:', result.errors);
        }

        const data = result.data as any[];
        const headers = Object.keys(data[0] || {});
        
        // Detect extra fields
        const detectedFields = detectExtraFields(headers);
        
        // Find column mappings
        const dateColumn = findColumn(headers, 'date');
        const amountColumn = findColumn(headers, 'amount');
        const descriptionColumn = findColumn(headers, 'description');
        const categoryColumn = findColumn(headers, 'category');
        const mccColumn = findColumn(headers, 'mccCode');
        const bankCategoryColumn = findColumn(headers, 'bankCategory');
        const transactionTypeColumn = findColumn(headers, 'transactionType');
        const locationColumn = findColumn(headers, 'location');
        const referenceNumberColumn = findColumn(headers, 'referenceNumber');
        const cardMemberColumn = findColumn(headers, 'cardMember');
        const accountNumberColumn = findColumn(headers, 'accountNumber');

        const transactions: ParsedTransaction[] = data
          .filter(row => row && typeof row === 'object')
          .map(row => {
            const transaction: ParsedTransaction = {
              date: parseDate(row[dateColumn] || ''),
              amount: parseAmount(row[amountColumn]),
              description: (row[descriptionColumn] || '').toString().trim(),
              category: parseOptionalField(row[categoryColumn])
            };

            // Add optional fields if they exist
            if (mccColumn && row[mccColumn]) {
              transaction.mccCode = parseOptionalField(row[mccColumn]);
            }
            if (bankCategoryColumn && row[bankCategoryColumn]) {
              transaction.bankCategory = parseOptionalField(row[bankCategoryColumn]);
            }
            if (transactionTypeColumn && row[transactionTypeColumn]) {
              transaction.transactionType = parseOptionalField(row[transactionTypeColumn]);
            }
            if (locationColumn && row[locationColumn]) {
              transaction.location = parseOptionalField(row[locationColumn]);
            }
            if (referenceNumberColumn && row[referenceNumberColumn]) {
              transaction.referenceNumber = parseOptionalField(row[referenceNumberColumn]);
            }
            if (cardMemberColumn && row[cardMemberColumn]) {
              transaction.cardMember = parseOptionalField(row[cardMemberColumn]);
            }
            if (accountNumberColumn && row[accountNumberColumn]) {
              transaction.accountNumber = parseOptionalField(row[accountNumberColumn]);
            }

            return transaction;
          })
          .filter(transaction => 
            transaction.date && 
            !isNaN(transaction.amount) && 
            transaction.description
          );

        resolve({ transactions, detectedFields });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
}
