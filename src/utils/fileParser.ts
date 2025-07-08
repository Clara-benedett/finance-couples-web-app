
import { ParsedTransaction } from '@/types/transaction';
import { parseCSV } from './csvParser';
import { parseExcel } from './excelParser';

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
