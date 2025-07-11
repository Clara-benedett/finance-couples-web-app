import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transaction';

/**
 * BULLETPROOF DATA PROTECTION SYSTEM
 * Implements multiple backup strategies to NEVER lose data again
 */

const BACKUP_KEY = 'expense_tracker_backup';
const BACKUP_HISTORY_KEY = 'expense_tracker_backup_history';
const MAX_BACKUPS = 10;

export class DataProtectionSystem {
  private static instance: DataProtectionSystem;
  
  static getInstance(): DataProtectionSystem {
    if (!DataProtectionSystem.instance) {
      DataProtectionSystem.instance = new DataProtectionSystem();
    }
    return DataProtectionSystem.instance;
  }

  /**
   * Create multiple backups immediately
   */
  async createEmergencyBackup(transactions: Transaction[]): Promise<void> {
    console.log(`🛡️ [PROTECTION] Creating emergency backup of ${transactions.length} transactions`);
    
    const backupData = {
      transactions,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      count: transactions.length
    };

    // 1. localStorage backup
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
    
    // 2. sessionStorage backup
    sessionStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
    
    // 3. Create backup history (rotating)
    this.addToBackupHistory(backupData);
    
    // 4. Download backup file only in debug mode
    if ((window as any).DEBUG_MODE) {
      this.downloadBackupFile(backupData);
    }
    
    console.log('✅ [PROTECTION] Emergency backups created in multiple locations');
  }

  private addToBackupHistory(backupData: any): void {
    try {
      const historyStr = localStorage.getItem(BACKUP_HISTORY_KEY);
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      history.unshift(backupData);
      
      // Keep only latest backups
      if (history.length > MAX_BACKUPS) {
        history.splice(MAX_BACKUPS);
      }
      
      localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('[PROTECTION] Failed to save backup history:', error);
    }
  }

  private downloadBackupFile(backupData: any): void {
    try {
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('📥 [PROTECTION] Backup file downloaded automatically');
    } catch (error) {
      console.error('[PROTECTION] Failed to download backup file:', error);
    }
  }

  /**
   * Get all available backups
   */
  getAllBackups(): any[] {
    const backups = [];
    
    // Check current localStorage
    const current = localStorage.getItem(BACKUP_KEY);
    if (current) {
      try {
        backups.push({ source: 'localStorage_current', data: JSON.parse(current) });
      } catch (e) {}
    }
    
    // Check sessionStorage
    const session = sessionStorage.getItem(BACKUP_KEY);
    if (session) {
      try {
        backups.push({ source: 'sessionStorage', data: JSON.parse(session) });
      } catch (e) {}
    }
    
    // Check backup history
    const historyStr = localStorage.getItem(BACKUP_HISTORY_KEY);
    if (historyStr) {
      try {
        const history = JSON.parse(historyStr);
        history.forEach((backup: any, index: number) => {
          backups.push({ source: `history_${index}`, data: backup });
        });
      } catch (e) {}
    }
    
    return backups;
  }

  /**
   * Prevent destructive operations without explicit confirmation
   */
  async confirmDestructiveOperation(operation: string, dataCount: number): Promise<boolean> {
    const message = `
🚨 DESTRUCTIVE OPERATION WARNING 🚨

Operation: ${operation}
This will affect ${dataCount} transactions.

This operation CANNOT be undone!

Type "I UNDERSTAND THE RISK" to continue:`;

    const confirmation = prompt(message);
    
    if (confirmation === "I UNDERSTAND THE RISK") {
      console.log(`⚠️ [PROTECTION] User confirmed destructive operation: ${operation}`);
      return true;
    } else {
      console.log(`🛡️ [PROTECTION] Destructive operation blocked: ${operation}`);
      return false;
    }
  }

  /**
   * Safe database clear with multiple confirmations
   */
  async safeClearDatabase(): Promise<boolean> {
    // Get current data first
    const { data: currentTransactions } = await supabase
      .from('transactions')
      .select('*');
      
    const count = currentTransactions?.length || 0;
    
    if (count === 0) {
      console.log('[PROTECTION] Database already empty, no action needed');
      return true;
    }

    // Create backup before clearing
    if (currentTransactions) {
      await this.createEmergencyBackup(currentTransactions.map(this.mapDatabaseToTransaction));
    }

    // Require explicit confirmation
    const confirmed = await this.confirmDestructiveOperation('CLEAR ALL DATABASE DATA', count);
    
    if (!confirmed) {
      return false;
    }

    // Double confirmation
    const doubleConfirm = confirm(`FINAL CONFIRMATION: Delete ${count} transactions from database? This CANNOT be undone!`);
    
    if (!doubleConfirm) {
      console.log('[PROTECTION] User cancelled on double confirmation');
      return false;
    }

    return true;
  }

  private mapDatabaseToTransaction(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      date: dbTransaction.date,
      amount: parseFloat(dbTransaction.amount),
      description: dbTransaction.description,
      category: dbTransaction.category,
      cardName: dbTransaction.card_name,
      paidBy: dbTransaction.paid_by,
      isClassified: dbTransaction.is_classified,
      mccCode: dbTransaction.mcc_code,
      transactionType: dbTransaction.transaction_type,
      location: dbTransaction.location,
      referenceNumber: dbTransaction.reference_number,
      autoAppliedRule: dbTransaction.auto_applied_rule,
      isManualEntry: dbTransaction.is_manual_entry,
      paymentMethod: dbTransaction.payment_method,
    };
  }
}

// Create global instance
export const dataProtection = DataProtectionSystem.getInstance();

// Make globally available for emergency use
(window as any).dataProtection = dataProtection;
(window as any).getAllBackups = () => dataProtection.getAllBackups();
(window as any).emergencyBackup = (transactions: Transaction[]) => dataProtection.createEmergencyBackup(transactions);
