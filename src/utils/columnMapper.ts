
// Common column name variations
export const COLUMN_MAPPINGS = {
  date: ['date', 'data', 'fecha', 'datum', 'transaction date', 'trans date', 'transactiondate', 'posting date', 'settlement date'],
  amount: ['amount', 'valor', 'value', 'price', 'precio', 'montant', 'betrag', 'debit', 'debito', 'credit', 'credito', 'cost', 'costo', 'total', 'sum', 'balance'],
  description: ['description', 'descricao', 'descripcion', 'merchant', 'vendor', 'payee', 'memo', 'details', 'detalles', 'reference', 'transaction details', 'narrative'],
  mccCode: ['mcc', 'mcc code', 'merchant category', 'category code', 'merchant category code', 'mcc_code', 'merchantcategory', 'merchant_category_code', 'sic', 'sic code'],
  transactionType: ['type', 'transaction type', 'trans type', 'tipo', 'transaction_type', 'transactiontype', 'trans_type', 'payment type', 'entry type', 'debit credit'],
  location: ['location', 'city', 'cidade', 'local', 'place', 'merchant city', 'city/state', 'merchant location', 'city state', 'merchant_city', 'state', 'address'],
  referenceNumber: ['reference', 'ref', 'referencia', 'transaction id', 'id', 'reference number', 'ref number', 'transaction_id', 'trans_id', 'check number', 'confirmation']
};

export function normalizeColumnName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export function findColumnIndex(headers: string[], columnTypes: string[]): number {
  const normalizedHeaders = headers.map(h => normalizeColumnName(h));
  const normalizedColumnTypes = columnTypes.map(t => normalizeColumnName(t));
  
  for (const type of normalizedColumnTypes) {
    const index = normalizedHeaders.findIndex(h => h.includes(type) || type.includes(h));
    if (index !== -1) return index;
  }
  return -1;
}

export function findDataStartRow(data: any[]): { startRow: number, headers: string[] } {
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

export function detectExtraFields(headers: string[]): { [key: string]: number } {
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
