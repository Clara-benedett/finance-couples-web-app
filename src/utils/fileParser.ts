
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedTransaction } from '@/types/transaction';

// Common column name variations
const COLUMN_MAPPINGS = {
  date: ['date', 'data', 'fecha', 'datum', 'transaction date', 'trans date'],
  amount: ['amount', 'valor', 'value', 'price', 'precio', 'montant', 'betrag'],
  description: ['description', 'descricao', 'descripcion', 'merchant', 'vendor', 'payee', 'memo']
};

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function findColumnIndex(headers: string[], columnTypes: string[]): number {
  const normalizedHeaders = headers.map(h => normalizeColumnName(h));
  
  for (const type of columnTypes) {
    const index = normalizedHeaders.findIndex(h => h.includes(type));
    if (index !== -1) return index;
  }
  return -1;
}

function parseDate(dateString: string): string {
  // Handle various date formats
  const cleanDate = dateString.trim();
  
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
      
      // Assume YYYY-MM-DD format for the first regex
      if (format === formats[0]) {
        return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
      }
      
      // For other formats, assume MM/DD/YYYY (US format)
      // In a real app, you'd want to make this configurable
      const year = part3;
      const month = part1.padStart(2, '0');
      const day = part2.padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Fallback: try to parse with Date constructor
  const date = new Date(cleanDate);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // Return current date as fallback
  return new Date().toISOString().split('T')[0];
}

function parseAmount(amountString: string): number {
  // Remove currency symbols and normalize
  const cleaned = amountString.toString()
    .replace(/[$€£¥₹₽]/g, '')
    .replace(/[,\s]/g, '')
    .trim();
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount); // Always positive
}

export async function parseCSV(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          const headers = Object.keys(data[0] || {});
          
          const dateIndex = findColumnIndex(headers, COLUMN_MAPPINGS.date);
          const amountIndex = findColumnIndex(headers, COLUMN_MAPPINGS.amount);
          const descIndex = findColumnIndex(headers, COLUMN_MAPPINGS.description);

          if (dateIndex === -1 || amountIndex === -1 || descIndex === -1) {
            reject(new Error('Required columns not found. Please ensure your CSV has Date, Amount, and Description columns.'));
            return;
          }

          const transactions: ParsedTransaction[] = data.map(row => {
            const rowValues = Object.values(row) as string[];
            return {
              date: parseDate(rowValues[dateIndex]),
              amount: parseAmount(rowValues[amountIndex]),
              description: rowValues[descIndex] || 'Unknown',
              category: 'UNCLASSIFIED'
            };
          }).filter(t => t.amount > 0);

          resolve(transactions);
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

export async function parseExcel(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }

        const headers = Object.keys(jsonData[0] as any);
        const dateIndex = findColumnIndex(headers, COLUMN_MAPPINGS.date);
        const amountIndex = findColumnIndex(headers, COLUMN_MAPPINGS.amount);
        const descIndex = findColumnIndex(headers, COLUMN_MAPPINGS.description);

        if (dateIndex === -1 || amountIndex === -1 || descIndex === -1) {
          reject(new Error('Required columns not found. Please ensure your Excel file has Date, Amount, and Description columns.'));
          return;
        }

        const transactions: ParsedTransaction[] = jsonData.map(row => {
          const rowValues = Object.values(row as any) as string[];
          return {
            date: parseDate(rowValues[dateIndex]),
            amount: parseAmount(rowValues[amountIndex]),
            description: rowValues[descIndex] || 'Unknown',
            category: 'UNCLASSIFIED'
          };
        }).filter(t => t.amount > 0);

        resolve(transactions);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function parseFile(file: File): Promise<ParsedTransaction[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new Error('Unsupported file format. Please upload CSV or Excel files.');
  }
}
