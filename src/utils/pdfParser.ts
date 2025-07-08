
import pdf from 'pdf-parse';
import { ParsedTransaction } from '@/types/transaction';
import { parseDate, parseAmount, parseOptionalField } from './dateParser';
import { detectExtraFields } from './columnMapper';

export async function parsePDF(file: File): Promise<{ transactions: ParsedTransaction[], detectedFields: string[] }> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF parse for file:', file.name);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          console.log('FileReader loaded PDF successfully');
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Convert ArrayBuffer to Uint8Array for browser compatibility
          const uint8Array = new Uint8Array(arrayBuffer);
          const data = await pdf(uint8Array);
          
          if (!data.text) {
            reject(new Error('PDF file is empty or unreadable'));
            return;
          }

          console.log('PDF text extracted, length:', data.text.length);
          console.log('First 500 characters of PDF text:', data.text.substring(0, 500));
          
          // Find transaction summary section
          const text = data.text;
          const transactionSectionStart = text.indexOf('Transaction Summary');
          
          if (transactionSectionStart === -1) {
            reject(new Error('Transaction Summary section not found in PDF. Please ensure this is a valid bank statement.'));
            return;
          }

          // Find the end of transaction section (look for common terminators)
          const terminators = [
            'Continued on next page',
            'Fees Charged',
            'Interest Summary',
            'Payment Information',
            'Account Summary',
            'Total Fees',
            'Interest Rate Information'
          ];
          
          let transactionSectionEnd = text.length;
          for (const terminator of terminators) {
            const terminatorIndex = text.indexOf(terminator, transactionSectionStart);
            if (terminatorIndex !== -1 && terminatorIndex < transactionSectionEnd) {
              transactionSectionEnd = terminatorIndex;
            }
          }

          const transactionSection = text.substring(transactionSectionStart, transactionSectionEnd);
          console.log('Transaction section extracted, length:', transactionSection.length);
          
          // Parse transaction lines - Wells Fargo format: MM/DD MM/DD REFERENCE_NUMBER DESCRIPTION $AMOUNT
          // Example: 12/15 12/16 4532*********1234 AMAZON.COM AMZN.COM/BILL WA $19.98
          const transactionRegex = /(\d{1,2}\/\d{1,2})\s+(\d{1,2}\/\d{1,2})\s+(\S+)\s+(.+?)\s+\$(\d+\.\d{2})/g;
          
          const transactions: ParsedTransaction[] = [];
          let match;
          
          while ((match = transactionRegex.exec(transactionSection)) !== null) {
            const [, transDate, postDate, reference, description, amount] = match;
            
            console.log('Parsed transaction:', { transDate, postDate, reference, description, amount });
            
            const transaction: ParsedTransaction = {
              date: parseDate(transDate),
              amount: parseAmount(amount),
              description: description.trim(),
              category: 'UNCLASSIFIED',
              referenceNumber: parseOptionalField(reference)
            };

            // Try to extract location from description
            const locationMatch = description.match(/([A-Z]{2,3}\s+[A-Z]{2})$/);
            if (locationMatch) {
              transaction.location = parseOptionalField(locationMatch[1]);
            }

            transactions.push(transaction);
          }

          console.log('Parsed transactions from PDF:', transactions.length);
          
          if (transactions.length === 0) {
            reject(new Error('No transactions found in PDF. Please check if this is a valid Wells Fargo statement format.'));
            return;
          }

          // Create mock headers to detect extra fields
          const mockHeaders = ['Trans Date', 'Post Date', 'Reference Number', 'Description', 'Amount', 'Location'];
          const extraFields = detectExtraFields(mockHeaders);
          const detectedFields = Object.keys(extraFields);
          
          console.log('PDF parsing completed successfully');
          console.log('Sample transaction:', transactions[0]);
          console.log('Detected fields:', detectedFields);
          
          resolve({ transactions, detectedFields });
        } catch (error) {
          console.error('Error processing PDF data:', error);
          reject(new Error('Failed to parse PDF file: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        reject(new Error('Failed to read PDF file'));
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error in parsePDF:', error);
      reject(new Error('Failed to initialize PDF parsing: ' + (error as Error).message));
    }
  });
}
