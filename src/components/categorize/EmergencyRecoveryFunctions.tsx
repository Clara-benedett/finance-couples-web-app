
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEmergencyRecovery = () => {
  const { toast } = useToast();

  const initializeRecoveryFunctions = () => {
    console.log('🛠️ [RECOVERY] Loading emergency recovery functions...');
    
    (window as any).checkAllStorage = () => {
      console.log('🔍 CHECKING ALL STORAGE LOCATIONS...');
      
      const localStorage_transactions = localStorage.getItem('expense_tracker_transactions');
      const localStorage_backup = localStorage.getItem('expense_tracker_backup');
      const sessionStorage_transactions = sessionStorage.getItem('expense_tracker_transactions');
      const sessionStorage_backup = sessionStorage.getItem('expense_tracker_backup');
      
      console.log('📦 STORAGE AUDIT:');
      console.log('localStorage transactions:', localStorage_transactions ? `${localStorage_transactions.length} chars` : 'EMPTY');
      console.log('localStorage backup:', localStorage_backup ? `${localStorage_backup.length} chars` : 'EMPTY');
      console.log('sessionStorage transactions:', sessionStorage_transactions ? `${sessionStorage_transactions.length} chars` : 'EMPTY');
      console.log('sessionStorage backup:', sessionStorage_backup ? `${sessionStorage_backup.length} chars` : 'EMPTY');
      
      // Find best data source
      const bestData = localStorage_transactions || localStorage_backup || sessionStorage_transactions || sessionStorage_backup;
      
      if (bestData) {
        try {
          const parsed = JSON.parse(bestData);
          console.log(`🎯 FOUND ${parsed.length} TRANSACTIONS! Use emergencyRecover() to restore them.`);
          return parsed;
        } catch (e) {
          console.error('❌ Data found but corrupted:', e);
        }
      } else {
        console.log('💀 NO DATA FOUND');
        
        // Check if user needs to enter data manually
        console.log('');
        console.log('🆘 LAST RESORT OPTIONS:');
        console.log('1. Check browser history for previous sessions');
        console.log('2. Check if you have any downloaded backup files');
        console.log('3. Check other browser profiles/devices');
      }
      
      return null;
    };

    (window as any).emergencyRecover = async () => {
      console.log('🚨 [RECOVERY] Starting emergency data recovery...');
      
      try {
        // Check all storage locations
        const localStorage_data = localStorage.getItem('expense_tracker_transactions');
        const backup_data = localStorage.getItem('expense_tracker_backup');
        const session_data = sessionStorage.getItem('expense_tracker_transactions');
        
        let dataToRecover = null;
        let dataSource = '';
        
        if (localStorage_data) {
          dataToRecover = JSON.parse(localStorage_data);
          dataSource = 'localStorage';
        } else if (backup_data) {
          const parsed = JSON.parse(backup_data);
          dataToRecover = parsed.transactions || parsed;
          dataSource = 'localStorage backup';
        } else if (session_data) {
          dataToRecover = JSON.parse(session_data);
          dataSource = 'sessionStorage';
        }
        
        if (!dataToRecover || dataToRecover.length === 0) {
          console.log('❌ [RECOVERY] No data found to recover');
          return false;
        }
        
        console.log(`📦 [RECOVERY] Found ${dataToRecover.length} transactions in ${dataSource}`);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ [RECOVERY] Authentication issue:', userError);
          return false;
        }
        
        console.log('👤 [RECOVERY] Authenticated as:', user.email);
        
        // Map data to database format
        const dbTransactions = dataToRecover.map((t: any) => ({
          id: t.id,
          user_id: user.id,
          date: t.date,
          amount: parseFloat(t.amount || 0),
          description: t.description,
          category: t.category,
          card_name: t.cardName,
          paid_by: t.paidBy,
          is_classified: t.isClassified || false,
          mcc_code: t.mccCode,
          bank_category: t.bankCategory,
          transaction_type: t.transactionType,
          location: t.location,
          reference_number: t.referenceNumber,
          auto_applied_rule: t.autoAppliedRule || false,
          is_manual_entry: t.isManualEntry || false,
          payment_method: t.paymentMethod,
        }));
        
        console.log('💾 [RECOVERY] Uploading to database...');
        
        // Insert into database
        const { error } = await supabase.from('transactions').insert(dbTransactions);
        
        if (error) {
          console.error('❌ [RECOVERY] Database error:', error);
          return false;
        }
        
        console.log('✅ [RECOVERY] SUCCESS! Data restored to database.');
        console.log('🔄 [RECOVERY] Refreshing page...');
        
        setTimeout(() => window.location.reload(), 1000);
        return true;
        
      } catch (error) {
        console.error('❌ [RECOVERY] Recovery failed:', error);
        return false;
      }
    };
    
    console.log('🛠️ [RECOVERY] Recovery functions loaded. Use checkAllStorage() and emergencyRecover() in console.');
  };

  return { initializeRecoveryFunctions };
};
