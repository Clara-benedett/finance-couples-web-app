// Check all possible browser storage locations for transaction data
export const checkAllStorage = () => {
  console.log('🔍 CHECKING ALL STORAGE LOCATIONS...');
  
  // Check localStorage
  const localStorage_transactions = localStorage.getItem('expense_tracker_transactions');
  const localStorage_backup = localStorage.getItem('expense_tracker_backup');
  const localStorage_migration = localStorage.getItem('migration_unified_v2');
  
  // Check sessionStorage
  const sessionStorage_transactions = sessionStorage.getItem('expense_tracker_transactions');
  const sessionStorage_backup = sessionStorage.getItem('expense_tracker_backup');
  
  // Check IndexedDB (if available)
  const checkIndexedDB = () => {
    if ('indexedDB' in window) {
      const request = indexedDB.open('expense_tracker');
      request.onsuccess = (event) => {
        const db = (event.target as any).result;
        console.log('📊 IndexedDB databases:', db.objectStoreNames);
      };
    }
  };
  
  console.log('📦 STORAGE AUDIT:');
  console.log('localStorage transactions:', localStorage_transactions ? `${localStorage_transactions.length} chars` : 'EMPTY');
  console.log('localStorage backup:', localStorage_backup ? `${localStorage_backup.length} chars` : 'EMPTY');
  console.log('localStorage migration flag:', localStorage_migration);
  console.log('sessionStorage transactions:', sessionStorage_transactions ? `${sessionStorage_transactions.length} chars` : 'EMPTY');
  console.log('sessionStorage backup:', sessionStorage_backup ? `${sessionStorage_backup.length} chars` : 'EMPTY');
  
  // Check if any data exists
  const hasAnyData = localStorage_transactions || localStorage_backup || sessionStorage_transactions || sessionStorage_backup;
  
  if (hasAnyData) {
    console.log('✅ FOUND DATA! Attempting recovery...');
    const bestData = localStorage_transactions || localStorage_backup || sessionStorage_transactions || sessionStorage_backup;
    
    try {
      const parsed = JSON.parse(bestData);
      console.log(`🎯 RECOVERABLE: ${parsed.length} transactions found!`);
      return parsed;
    } catch (e) {
      console.error('❌ Data found but corrupted:', e);
    }
  } else {
    console.log('💀 NO DATA FOUND IN ANY STORAGE LOCATION');
  }
  
  checkIndexedDB();
  return null;
};

// Make globally available
(window as any).checkAllStorage = checkAllStorage;