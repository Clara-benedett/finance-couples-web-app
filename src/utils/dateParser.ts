
export function parseDate(dateString: string): string {
  // Add debugging for date parsing
  console.log('parseDate input:', dateString, 'typeof:', typeof dateString);
  
  // Handle Excel serial numbers FIRST
  const numericValue = Number(dateString);
  if (!isNaN(numericValue) && Number.isInteger(numericValue) && numericValue >= 43831 && numericValue <= 50000) {
    // This is an Excel serial date (2020-2037 range)
    console.log('Detected Excel serial number:', numericValue);
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const jsDate = new Date(excelEpoch.getTime() + (numericValue - 2) * millisecondsPerDay);
    const result = jsDate.toISOString().split('T')[0];
    console.log('Excel serial number converted to:', result);
    return result;
  }
  
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

export function parseAmount(amountString: string): number {
  // Remove currency symbols and normalize
  const cleaned = String(amountString || '')
    .replace(/[$€£¥₹₽]/g, '')
    .replace(/[,\s]/g, '')
    .trim();
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount); // Always positive
}

export function parseOptionalField(value: any): string | undefined {
  if (!value) return undefined;
  const cleanValue = String(value).trim();
  return cleanValue === '' ? undefined : cleanValue;
}
