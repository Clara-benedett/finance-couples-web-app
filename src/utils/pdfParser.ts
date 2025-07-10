
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
    
    // Extract text from all pages with better structure preservation
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group text items by their Y position to preserve line structure
      const lines: Map<number, string[]> = new Map();
      
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          const y = Math.round(item.transform[5]); // Y position
          if (!lines.has(y)) {
            lines.set(y, []);
          }
          lines.get(y)!.push(item.str);
        }
      });
      
      // Sort by Y position (descending, as PDF coordinates start from bottom)
      const sortedLines = Array.from(lines.entries())
        .sort(([a], [b]) => b - a)
        .map(([, texts]) => texts.join(' ').trim())
        .filter(line => line.length > 0);
      
      fullText += sortedLines.join('\n') + '\n';
    }
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('PDF file appears to be empty or contains no readable text');
    }

    console.log('PDF text extracted, length:', fullText.length);
    console.log('First 1000 characters:', fullText.substring(0, 1000));
    console.log('Looking for Transaction Summary...');
    console.log('Contains Transaction Summary:', fullText.includes('Transaction Summary'));
    console.log('Contains Trans Date:', fullText.includes('Trans Date'));
    
    // Let's also search for other possible section headers
    console.log('Contains transaction:', fullText.toLowerCase().includes('transaction'));
    console.log('Contains statement:', fullText.toLowerCase().includes('statement'));

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
  
  console.log('Total lines to process:', lines.length);
  console.log('Sample lines:', lines.slice(0, 10));
  
  let inTransactionSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering the transaction section
    if (line.includes('Transaction Summary') || line.includes('Trans Date')) {
      inTransactionSection = true;
      continue;
    }
    
    // Check if we're leaving the transaction section
    if (inTransactionSection && (line.includes('Fees Charged') || line.includes('Interest Charged') || line.includes('BiltProtect Summary'))) {
      inTransactionSection = false;
      continue;
    }
    
    // Parse transaction lines only when in the transaction section
    if (inTransactionSection) {
      console.log('Trying to parse transaction line:', line);
      const transaction = parseTransactionLine(line);
      if (transaction) {
        console.log('Successfully parsed transaction:', transaction);
        transactions.push(transaction);
      } else {
        console.log('Failed to parse line:', line);
      }
    }
  }
  
  return transactions;
}

function parseTransactionLine(line: string): ParsedTransaction | null {
  console.log('Parsing line:', line);
  
  // Skip header lines and empty lines
  if (!line || line.includes('Trans Date') || line.includes('Post Date') || line.includes('Reference Number') || line.includes('Description') || line.includes('Amount') || line.includes('PAGE') || line.includes('NOTICE') || line.includes('CHASE')) {
    console.log('Skipping header/noise line');
    return null;
  }

  // BILT specific patterns - handle the actual format from the console logs
  // Pattern from logs: "5596 AWJ 1 7 11 250518 0 PAGE 3 of 3 1 0 2290 1000 MC03 01EG5596"
  // This looks like: RefNumber Month Day Year Amount Description
  
  // Try to extract date and amount from the mangled line
  // Look for date patterns like MM/DD or MMDDYY embedded in the text
  const dateAmountPattern = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})[^$]*\$?([\d,]+\.?\d*)/;
  const dateAmountMatch = line.match(dateAmountPattern);
  
  if (dateAmountMatch) {
    const [, month, day, year, amountStr] = dateAmountMatch;
    const amount = parseAmount(amountStr);
    
    if (amount > 0) {
      const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
      const dateStr = `${month}/${day}/${fullYear}`;
      
      // Extract description - everything between date and amount
      const beforeAmount = line.substring(0, line.indexOf(amountStr));
      const afterDate = beforeAmount.substring(beforeAmount.lastIndexOf(year) + year.length).trim();
      
      return {
        date: parseDate(dateStr),
        amount: amount,
        description: afterDate || 'Transaction',
        category: 'UNCLASSIFIED',
        location: parseOptionalField(extractLocation(afterDate))
      };
    }
  }

  // BILT Statement Pattern: MM/DD MM/DD ReferenceNumber Description $Amount
  // Example: 05/17 05/19 920001300 TACOS RODRIGUEZ SAN FRANCISCO CA $13.91
  const biltPattern = /^(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(\w+)\s+(.+?)\s+\$?([\d,]+\.?\d*)$/;
  const biltMatch = line.match(biltPattern);
  
  if (biltMatch) {
    const [, transDate, postDate, refNumber, description, amountStr] = biltMatch;
    const amount = parseAmount(amountStr);
    
    if (amount > 0) {
      // For MM/DD format, assume current year
      const currentYear = new Date().getFullYear();
      const fullDate = `${transDate}/${currentYear}`;
      
      // Clean up the description by removing any reference number patterns at the beginning
      let cleanDescription = description.trim();
      
      // Remove reference numbers that might be at the start of description
      // Pattern: alphanumeric codes followed by space, typically 8-15 characters
      cleanDescription = cleanDescription.replace(/^[A-Z0-9]{8,15}\s+/, '');
      
      return {
        date: parseDate(fullDate),
        amount: amount,
        description: cleanDescription,
        category: 'UNCLASSIFIED',
        referenceNumber: refNumber,
        location: parseOptionalField(extractLocation(cleanDescription))
      };
    }
  }

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
