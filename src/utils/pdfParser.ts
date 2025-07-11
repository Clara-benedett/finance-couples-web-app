import * as pdfjsLib from 'pdfjs-dist';
import { ParsedTransaction } from '@/types/transaction';
import { parseDate } from './dateParser';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const parseOptionalField = (value: any): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const strValue = String(value).trim();
  return strValue === '' ? undefined : strValue;
};

const extractLocation = (description: string): string | undefined => {
  const locationRegex = /(?:at|from)\s+([A-Za-z\s]+(?:[A-Za-z]+)?)$/;
  const match = description.match(locationRegex);
  return match ? match[1].trim() : undefined;
};

interface AmexTransaction {
  date: string;
  description: string;
  amount: number;
  referenceNumber?: string;
  location?: string;
  cardMember?: string;
  accountNumber?: string;
}

export async function parsePDF(file: File): Promise<{ 
  transactions: ParsedTransaction[], 
  detectedFields: string[] 
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let allText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      allText += pageText + '\n';
    }

    const transactions = parseAmexTransactions(allText);
    const detectedFields: string[] = [];
    
    // Check if we found card member information in any transaction
    if (transactions.some(t => t.cardMember)) {
      detectedFields.push('cardMember');
    }
    
    // Check if we found account number information in any transaction
    if (transactions.some(t => t.accountNumber)) {
      detectedFields.push('accountNumber');
    }
    
    // Check for other fields
    if (transactions.some(t => t.referenceNumber)) {
      detectedFields.push('referenceNumber');
    }
    if (transactions.some(t => t.location)) {
      detectedFields.push('location');
    }

    return {
      transactions: transactions.map(t => ({
        date: t.date,
        amount: t.amount,
        description: t.description,
        category: 'UNCLASSIFIED',
        referenceNumber: t.referenceNumber,
        location: t.location,
        cardMember: t.cardMember,
        accountNumber: t.accountNumber
      })),
      detectedFields
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

// Keep the parseAmexPDF function for backward compatibility
export const parseAmexPDF = parsePDF;

function parseAmexTransactions(text: string): AmexTransaction[] {
  const transactions: AmexTransaction[] = [];
  const lines = text.split('\n');
  
  let currentCardMember: string | undefined;
  let currentAccountNumber: string | undefined;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for card member patterns (names in caps followed by account info)
    const cardMemberMatch = line.match(/^([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]+)*)\s+Account/i);
    if (cardMemberMatch) {
      currentCardMember = cardMemberMatch[1].trim();
      // Look for account number in the same line or next few lines
      const accountMatch = line.match(/Account\s+#?\s*([X\d-]+)/i);
      if (accountMatch) {
        currentAccountNumber = accountMatch[1].trim();
      }
      continue;
    }
    
    // Look for standalone account number patterns
    const accountOnlyMatch = line.match(/Account\s+#?\s*([X\d-]+)/i);
    if (accountOnlyMatch && !currentAccountNumber) {
      currentAccountNumber = accountOnlyMatch[1].trim();
      continue;
    }
    
    // Parse transaction lines
    const transaction = parseAmexTransactionLine(line);
    if (transaction) {
      // Add current card member and account info to the transaction
      if (currentCardMember) {
        transaction.cardMember = currentCardMember;
      }
      if (currentAccountNumber) {
        transaction.accountNumber = currentAccountNumber;
      }
      transactions.push(transaction);
    }
  }
  
  return transactions;
}

function parseAmexTransactionLine(line: string): AmexTransaction | null {
  // AMEX transaction pattern: Date Description Amount [RefNumber]
  const patterns = [
    // Pattern 1: MM/DD Description $Amount RefNumber
    /^(\d{1,2}\/\d{1,2})\s+(.+?)\s+\$?([\d,]+\.?\d*)-?\s*([A-Z0-9]{8,})?$/,
    // Pattern 2: MM/DD Description Amount RefNumber  
    /^(\d{1,2}\/\d{1,2})\s+(.+?)\s+([\d,]+\.?\d*)-?\s*([A-Z0-9]{8,})?$/,
    // Pattern 3: More flexible pattern
    /^(\d{1,2}\/\d{1,2})\s+(.+?)\s+\$?([\d,]+\.?\d*)[\s-]*([A-Z0-9]{8,15})?.*$/
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      const [, transDate, description, amountStr, refNumber] = match;
      
      // Parse amount
      const amount = parseFloat(amountStr.replace(/[,$]/g, ''));
      if (isNaN(amount)) continue;
      
      // Format date (add current year)
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
        referenceNumber: refNumber,
        location: parseOptionalField(extractLocation(cleanDescription))
      };
    }
  }
  
  return null;
}
