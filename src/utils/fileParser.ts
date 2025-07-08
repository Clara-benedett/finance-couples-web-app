
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedTransaction } from '@/types/transaction';

// Common column name variations
const COLUMN_MAPPINGS = {
  date: ['date', 'data', 'fecha', 'datum', 'transaction date', 'trans date', 'transactiondate', 'posting date', 'settlement date'],
  amount: ['amount', 'valor', 'value', 'price', 'precio', 'montant', 'betrag', 'debit', 'debito', 'credit', 'credito', 'cost', 'costo', 'total', 'sum', 'balance'],
  description: ['description', 'descricao', 'descripcion', 'merchant', 'vendor', 'payee', 'memo', 'details', 'detalles', 'reference', 'transaction details', 'narrative'],
  mccCode: ['mcc', 'mcc code', 'merchant category', 'category code', 'merchant category code', 'mcc_code', 'merchantcategory', 'merchant_category_code', 'sic', 'sic code'],
  transactionType: ['type', 'transaction type', 'trans type', 'tipo', 'transaction_type', 'transactiontype', 'trans_type', 'payment type', 'entry type', 'debit credit'],
  location: ['location', 'city', 'cidade', 'local', 'place', 'merchant city', 'city/state', 'merchant location', 'city state', 'merchant_city', 'state', 'address'],
  referenceNumber: ['reference', 'ref', 'referencia', 'transaction id', 'id', 'reference number', 'ref number', 'transaction_id', 'trans_id', 'check number', 'confirmation']
};

function normalizeColumnName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function findColumnIndex(headers: string[], columnTypes: string[]): number {
  const normalizedHeaders = headers.map(h => normalizeColumnName(h));
  const normalizedColumnTypes = columnTypes.map(t => normalizeColumnName(t));
  
  for (const type of normalizedColumnTypes) {
    const index = normalizedHeaders.findIndex(h => h.includes(type) || type.includes(h));
    if (index !== -1) return index;
  }
  return -1;
}

function findDataStartRow(data: any[]): { startRow: number, headers: string[] } {
  console.log('Scanning for data start row in', data.length, 'rows');
  
  for (let i = 0; i < Math.min(data.length, 20); i++) { // Check first 20 rows max
    const row = data[i];
    if (!row) continue;
    
    const rowValues = Array.isArray(row) ? row : Object.values(row);
    const potentialHeaders = rowValues.map(val => String(val || '').trim()).filter(val => val);
    
    if (potentialHeaders.length < 2) continue; // Need at least 2 columns
    
    console.log(`Row ${i} potential headers:`, potentialHeaders);
    
    // Check if this row contains recognizable column names
    const dateIndex = findColumnIndex(potentialHeaders, COLUMN_MAPPINGS.date);
    const amountIndex = findColumnIndex(potentialHeaders, COLUMN_MAPPINGS.amount);
    const descIndex = findColumnIndex(potentialHeaders, COLUMN_MAPPINGS.description);
    
    const foundColumns = [dateIndex, amountIndex, descIndex].filter(idx => idx !== -1).length;
    
    console.log(`Row ${i} found ${foundColumns} recognizable columns:`, { dateIndex, amountIndex, descIndex });
    
    // If we found at least 2 of the 3 required columns, this is likely our header row
    if (foundColumns >= 2) {
      console.log(`Found data start at row ${i}`);
      return { startRow: i, headers: potentialHeaders };
    }
  }
  
  // Fallback to first row if no clear headers found
  console.log('No clear header row found, using first row');
  const firstRow = data[0];
  const headers = Array.isArray(firstRow) ? firstRow : Object.keys(firstRow);
  return { startRow: 0, headers: headers.map(h => String(h)) };
}

function parseDate(dateString: string): string {
  // Add debugging for date parsing
  console.log('parseDate input:', dateString, 'typeof:', typeof dateString);
  
  // Handle various date formats
  const cleanDate = String(dateString || '').trim();
  
  if (!cleanDate) {
    console.log('Empty date string, using current date');
    return new Date().toISOString().split('T')[0];
  }
  
  console.log('Clean date string:', cleanDate);
  
  // Try different date formats
  const formats = [
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY or DD-MM-YYYY
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/ // MM.DD.YYYY or DD.MM.YYYY
  ];

  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      const [, part1, part2, part3] = match;
      console.log('Date format matched:', format, 'parts:', part1, part2, part3);
      
      // Assume YYYY-MM-DD format for the first regex
      if (format === formats[0]) {
        const result = `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
        console.log('YYYY-MM-DD format result:', result);
        return result;
      }
      
      // For other formats, assume MM/DD/YYYY (US format)
      const year = part3;
      const month = part1.padStart(2, '0');
      const day = part2.padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      console.log('US format result:', result);
      return result;
    }
  }

  // Fallback: try to parse with Date constructor
  console.log('No regex match, trying Date constructor');
  const date = new Date(cleanDate);
  if (!isNaN(date.getTime())) {
    const result = date.toISOString().split('T')[0];
    console.log('Date constructor result:', result);
    return result;
  }

  // Return current date as fallback
  console.log('All parsing failed, using current date as fallback');
  return new Date().toISOString().split('T')[0];
}

function parseAmount(amountString: string): number {
  // Remove currency symbols and normalize
  const cleaned = String(amountString || '')
    .replace(/[$€£¥₹₽]/g, '')
    .replace(/[,\s]/g, '')
    .trim();
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount); // Always positive
}

function parseOptionalField(value: any): string | undefined {
  if (!value) return undefined;
  const cleanValue = String(value).trim();
  return cleanValue === '' ? undefined : cleanValue;
}

function detectExtraFields(headers: string[]): { [key: string]: number } {
  const extraFields: { [key: string]: number } = {};
  
  const mccIndex = findColumnIndex(headers, COLUMN_MAPPINGS.mccCode);
  const typeIndex = findColumnIndex(headers, COLUMN_MAPPINGS.transactionType);
  const locationIndex = findColumnIndex(headers, COLUMN_MAPPINGS.location);
  const refIndex = findColumnIndex(headers, COLUMN_MAPPINGS.referenceNumber);
  
  if (mccIndex !== -1) extraFields.mccCode = mccIndex;
  if (typeIndex !== -1) extraFields.transactionType = typeIndex;
  if (locationIndex !== -1) extraFields.location = locationIndex;
  if (refIndex !== -1) extraFields.referenceNumber = refIndex;
  
  return extraFields;
}

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

export async function parseFile(file: File): Promise<{ transactions: ParsedTransaction[], detectedFields: string[] }> {
  try {
    console.log('parseFile called with:', file.name, 'type:', file.type);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        console.log('Parsing as CSV');
        return await parseCSV(file);
      case 'xlsx':
      case 'xls':
        console.log('Parsing as Excel');
        return await parseExcel(file);
      default:
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
    }
  } catch (error) {
    console.error('Error in parseFile:', error);
    throw error;
  }
}
