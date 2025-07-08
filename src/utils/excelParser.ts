
import * as XLSX from 'xlsx';
import { ParsedTransaction } from '@/types/transaction';
import { parseDate, parseAmount, parseOptionalField } from './dateParser';
import { COLUMN_MAPPINGS, findDataStartRow, findColumnIndex, detectExtraFields } from './columnMapper';

export async function parseExcel(file: File): Promise<{ transactions: ParsedTransaction[], detectedFields: string[] }> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting Excel parse for file:', file.name);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('FileReader loaded successfully');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          console.log('Excel data loaded, total rows:', jsonData.length);
          console.log('First few rows of raw Excel data:', jsonData.slice(0, 3));
          
          const { startRow, headers } = findDataStartRow(jsonData);
          
          console.log('Excel Headers found:', headers);
          console.log('Looking for columns:', COLUMN_MAPPINGS);
          
          const dateIndex = findColumnIndex(headers, COLUMN_MAPPINGS.date);
          const amountIndex = findColumnIndex(headers, COLUMN_MAPPINGS.amount);
          const descIndex = findColumnIndex(headers, COLUMN_MAPPINGS.description);

          console.log('Column indices found:', { dateIndex, amountIndex, descIndex });

          if (dateIndex === -1 || amountIndex === -1 || descIndex === -1) {
            reject(new Error(`Required columns not found. Found headers: ${headers.join(', ')}. Please ensure your Excel file has Date, Amount, and Description columns.`));
            return;
          }

          // Detect extra fields
          const extraFields = detectExtraFields(headers);
          const detectedFields = Object.keys(extraFields);
          
          console.log('Extra fields detected:', extraFields);

          // Skip the header row and process data
          const dataRows = jsonData.slice(startRow + 1);
          console.log('Date column values from first 5 rows:', dataRows.slice(0, 5).map(row => row[dateIndex]));
          
          const transactions: ParsedTransaction[] = dataRows.map(row => {
            const transaction: ParsedTransaction = {
              date: parseDate(row[dateIndex]),
              amount: parseAmount(row[amountIndex]),
              description: String(row[descIndex] || 'Unknown'),
              category: 'UNCLASSIFIED'
            };

            // Add extra fields if detected
            if (extraFields.mccCode !== undefined) {
              transaction.mccCode = parseOptionalField(row[extraFields.mccCode]);
            }
            if (extraFields.transactionType !== undefined) {
              transaction.transactionType = parseOptionalField(row[extraFields.transactionType]);
            }
            if (extraFields.location !== undefined) {
              transaction.location = parseOptionalField(row[extraFields.location]);
            }
            if (extraFields.referenceNumber !== undefined) {
              transaction.referenceNumber = parseOptionalField(row[extraFields.referenceNumber]);
            }

            return transaction;
          }).filter(t => t.amount > 0);

          console.log('Parsed transactions:', transactions.length);
          console.log('Sample transaction with extra fields:', transactions[0]);
          
          resolve({ transactions, detectedFields });
        } catch (error) {
          console.error('Error processing Excel data:', error);
          reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error in parseExcel:', error);
      reject(new Error('Failed to initialize Excel parsing: ' + (error as Error).message));
    }
  });
}
