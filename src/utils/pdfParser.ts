
import * as pdfjsLib from 'pdfjs-dist';
import { ParsedTransaction } from '@/types/transaction';
import { parseDate, parseAmount, parseOptionalField } from './dateParser';

// Set up the worker for pdfjs with matching version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function parsePDF(file: File): Promise<{ transactions: ParsedTransaction[], detectedFields: string[] }> {
  try {
    console.log('Starting PDF parse for file:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('PDF file appears to be empty or contains no readable text');
    }

    console.log('PDF text extracted, length:', fullText.length);
    console.log('First 500 characters:', fullText.substring(0, 500));

    // Parse transactions from the extracted text
    const transactions = parseTransactionsFromText(fullText);
    
    if (transactions.length === 0) {
      throw new Error('No transactions found in PDF. Please ensure it contains transaction data in a supported format.');
    }

    console.log('Parsed transactions:', transactions.length);
    console.log('Sample transaction:', transactions[0]);
    
    // For PDFs, we typically detect location since bank statements often include this
    const detectedFields = ['location'];
    
    return { transactions, detectedFields };
    
  } catch (error) {
    console.error('Error in parsePDF:', error);
    throw new Error('Failed to parse PDF file: ' + (error as Error).message);
  }
}

function parseTransactionsFromText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for transaction patterns - this is a basic implementation
    // that can be extended based on specific bank statement formats
    const transaction = parseTransactionLine(line);
    if (transaction) {
      transactions.push(transaction);
    }
  }
  
  return transactions;
}

function parseTransactionLine(line: string): ParsedTransaction | null {
  // Common patterns for bank statement transactions
  // This is a basic implementation that looks for: Date Amount Description
  
  // Pattern 1: MM/DD/YYYY or MM-DD-YYYY followed by amount and description
  const pattern1 = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+([+-]?\$?[\d,]+\.?\d*)\s+(.+)/;
  const match1 = line.match(pattern1);
  
  if (match1) {
    const [, dateStr, amountStr, description] = match1;
    const amount = parseAmount(amountStr);
    
    if (amount > 0) {
      return {
        date: parseDate(dateStr),
        amount: amount,
        description: description.trim(),
        category: 'UNCLASSIFIED',
        location: parseOptionalField(extractLocation(description))
      };
    }
  }
  
  // Pattern 2: YYYY-MM-DD format
  const pattern2 = /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\s+([+-]?\$?[\d,]+\.?\d*)\s+(.+)/;
  const match2 = line.match(pattern2);
  
  if (match2) {
    const [, dateStr, amountStr, description] = match2;
    const amount = parseAmount(amountStr);
    
    if (amount > 0) {
      return {
        date: parseDate(dateStr),
        amount: amount,
        description: description.trim(),
        category: 'UNCLASSIFIED',
        location: parseOptionalField(extractLocation(description))
      };
    }
  }
  
  // Pattern 3: Look for amounts followed by descriptions (some statements have this format)
  const pattern3 = /([+-]?\$?[\d,]+\.?\d*)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+(.+)/;
  const match3 = line.match(pattern3);
  
  if (match3) {
    const [, amountStr, dateStr, description] = match3;
    const amount = parseAmount(amountStr);
    
    if (amount > 0) {
      return {
        date: parseDate(dateStr),
        amount: amount,
        description: description.trim(),
        category: 'UNCLASSIFIED',
        location: parseOptionalField(extractLocation(description))
      };
    }
  }
  
  return null;
}

function extractLocation(description: string): string | undefined {
  // Try to extract location information from transaction description
  // Common patterns include city/state at the end of description
  const locationPattern = /\b([A-Z]{2,}(?:\s+[A-Z]{2,})*)\s+([A-Z]{2})\s*$/;
  const match = description.match(locationPattern);
  
  if (match) {
    return `${match[1].trim()}, ${match[2]}`;
  }
  
  return undefined;
}
