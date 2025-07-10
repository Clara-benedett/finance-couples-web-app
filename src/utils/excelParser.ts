import * as XLSX from 'xlsx';
import { ParsedTransaction } from '@/types/transaction';
import { findColumn, detectExtraFields } from './columnMapper';
import { parseDate } from './dateParser';

const parseOptionalField = (value: any): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const strValue = String(value).trim();
  return strValue === '' ? undefined : strValue;
};

const parseAmount = (value: any): number => {
  if (value === null || value === undefined) {
    return NaN;
  }

  const strValue = String(value).trim();
  const parsedValue = parseFloat(strValue.replace(/[^0-9.-]+/g, ''));

  return isNaN(parsedValue) ? NaN : parsedValue;
};

export function parseExcel(file: File): Promise<{ 
  transactions: ParsedTransaction[], 
  detectedFields: string[] 
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          resolve({ transactions: [], detectedFields: [] });
          return;
        }
        
        // Get headers and data rows
        const headers = (jsonData[0] as string[]).map(h => (h || '').toString().trim());
        const dataRows = jsonData.slice(1);
        
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
        
        const transactions: ParsedTransaction[] = dataRows
          .filter(row => row && Array.isArray(row) && row.length > 0)
          .map(row => {
            const rowData = row as any[];
            
            const transaction: ParsedTransaction = {
              date: parseDate((rowData[dateColumn] || '').toString()),
              amount: parseAmount(rowData[amountColumn]),
              description: (rowData[descriptionColumn] || '').toString().trim(),
              category: parseOptionalField(rowData[categoryColumn])
            };

            // Add optional fields if they exist
            if (mccColumn !== -1 && rowData[mccColumn]) {
              transaction.mccCode = parseOptionalField(rowData[mccColumn]);
            }
            if (bankCategoryColumn !== -1 && rowData[bankCategoryColumn]) {
              transaction.bankCategory = parseOptionalField(rowData[bankCategoryColumn]);
            }
            if (transactionTypeColumn !== -1 && rowData[transactionTypeColumn]) {
              transaction.transactionType = parseOptionalField(rowData[transactionTypeColumn]);
            }
            if (locationColumn !== -1 && rowData[locationColumn]) {
              transaction.location = parseOptionalField(rowData[locationColumn]);
            }
            if (referenceNumberColumn !== -1 && rowData[referenceNumberColumn]) {
              transaction.referenceNumber = parseOptionalField(rowData[referenceNumberColumn]);
            }
            if (cardMemberColumn !== -1 && rowData[cardMemberColumn]) {
              transaction.cardMember = parseOptionalField(rowData[cardMemberColumn]);
            }
            if (accountNumberColumn !== -1 && rowData[accountNumberColumn]) {
              transaction.accountNumber = parseOptionalField(rowData[accountNumberColumn]);
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
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
}
