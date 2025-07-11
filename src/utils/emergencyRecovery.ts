import { supabase } from '@/integrations/supabase/client';

// Emergency recovery function to restore transactions from localStorage
export const emergencyRecover = async () => {
  console.log('🚨 [RECOVERY] Starting emergency data recovery...');
  
  try {
    // Force load from localStorage
    const localStorageData = localStorage.getItem('expense_tracker_transactions');
    if (!localStorageData) {
      console.log('📭 [RECOVERY] No data found in localStorage');
      return false;
    }

    const localData = JSON.parse(localStorageData);
    console.log(`📦 [RECOVERY] Found ${localData.length} transactions in localStorage`);
    
    if (localData.length === 0) {
      console.log('📭 [RECOVERY] No transactions in localStorage data');
      return false;
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ [RECOVERY] Auth error:', userError);
      return false;
    }

    if (!user) {
      console.error('❌ [RECOVERY] No authenticated user found');
      return false;
    }

    console.log('👤 [RECOVERY] Current user:', user.email);
    console.log('🆔 [RECOVERY] User ID:', user.id);

    // Map localStorage transactions to database format
    const dbTransactions = localData.map((t: any) => ({
      id: t.id,
      user_id: user.id,
      date: t.date,
      amount: parseFloat(t.amount),
      description: t.description,
      category: t.category,
      card_name: t.cardName,
      paid_by: t.paidBy,
      is_classified: t.isClassified || false,
      mcc_code: t.mccCode,
      transaction_type: t.transactionType,
      location: t.location,
      reference_number: t.referenceNumber,
      auto_applied_rule: t.autoAppliedRule || false,
      is_manual_entry: t.isManualEntry || false,
      payment_method: t.paymentMethod,
    }));

    console.log(`💾 [RECOVERY] Uploading ${dbTransactions.length} transactions to database...`);
    console.log('📄 [RECOVERY] Sample transaction:', dbTransactions[0]);

    // Insert transactions into database
    const { error: insertError } = await supabase
      .from('transactions')
      .insert(dbTransactions);

    if (insertError) {
      console.error('❌ [RECOVERY] Failed to restore data:', insertError);
      return false;
    } else {
      console.log('✅ [RECOVERY] Successfully restored data to database!');
      console.log('🔄 [RECOVERY] Refreshing page to show data...');
      
      // Small delay then refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    }
  } catch (error) {
    console.error('❌ [RECOVERY] Recovery failed with error:', error);
    return false;
  }
};

// Make it globally available
(window as any).emergencyRecover = emergencyRecover;