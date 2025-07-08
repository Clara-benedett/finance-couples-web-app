
import Papa from 'papaparse';
import { ParsedTransaction } from '@/types/transaction';
import { parseDate, parseAmount, parseOptionalField } from './dateParser';
import { COLUMN_MAPPINGS, findDataStartRow, findColumnIndex, detectExtraFields } from './columnMapper';

export async function parseCSV(file: File): Promise<{ transactions: ParsedTransaction[], detectedFields: string[] }> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting CSV parse for file:', file.name);
      Papa.parse(file, {
        header: false, // Parse as array to handle dynamic header detection
        skipEmptyLines: true,
        complete: (results) => {
          try {
            console.log('Papa.parse completed successfully');
            const data = results.data as any[][];
            
            if (data.length === 0) {
              reject(new Error('CSV file is empty'));
              return;
            }
            
            console.log('CSV data loaded, total rows:', data.length);
            console.log('First few rows of raw CSV data:', data.slice(0, 3));
            
            const { startRow, headers } = findDataStartRow(data);
            
            console.log('CSV Headers found:', headers);
            console.log('Looking for columns:', COLUMN_MAPPINGS);
            
            const dateIndex = findColumnIndex(headers, COLUMN_MAPPINGS.date);
            const amountIndex = findColumnIndex(headers, COLUMN_MAPPINGS.amount);
            const descIndex = findColumnIndex(headers, COLUMN_MAPPINGS.description);

            console.log('Column indices found:', { dateIndex, amountIndex, descIndex });

            if (dateIndex === -1 || amountIndex === -1 || descIndex === -1) {
              reject(new Error(`Required columns not found. Found headers: ${headers.join(', ')}. Please ensure your CSV has Date, Amount, and Description columns.`));
              return;
            }

            // Detect extra fields
            const extraFields = detectExtraFields(headers);
            const detectedFields = Object.keys(extraFields);
            
            console.log('Extra fields detected:', extraFields);

            // Skip the header row and process data
            const dataRows = data.slice(startRow + 1);
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
            console.error('Error processing CSV data:', error);
            reject(new Error('Failed to parse CSV file: ' + (error as Error).message));
          }
        },
        error: (error) => {
          console.error('Papa.parse error:', error);
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('Error in parseCSV:', error);
      reject(new Error('Failed to initialize CSV parsing: ' + (error as Error).message));
    }
  });
}
