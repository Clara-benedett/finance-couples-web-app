
import { useState, useEffect } from "react";
import { Transaction } from "@/types/transaction";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTransactionLoader = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const updateTransactions = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('[Categorize] Loading transactions...');
      
      // Ensure user is authenticated first with better error handling
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        console.log('[Categorize] No authenticated user');
        setLoadError('Please log in to view your transactions');
        setTransactions([]);
        return;
      }
      
      console.log('[Categorize] User authenticated:', user.email);
      
      // Wait for store initialization with timeout
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Store initialization timeout')), 10000)
      );
      
      const storePromise = unifiedTransactionStore.waitForInitialization();
      
      await Promise.race([storePromise, timeout]);
      const allTransactions = await unifiedTransactionStore.getTransactions();
      
      console.log(`[Categorize] Loaded ${allTransactions.length} transactions from unified store`);
      setTransactions(allTransactions);
      setRetryCount(0); // Reset retry count on success
      
      // If no transactions found, provide helpful guidance
      if (allTransactions.length === 0) {
        console.log('');
        console.log('💡 NO TRANSACTIONS FOUND. Try these recovery commands:');
        console.log('   checkAllStorage()    - Check for data in browser storage');
        console.log('   emergencyRecover()   - Restore found data to database');
        console.log('');
      }
    } catch (error) {
      console.error('[Categorize] Error loading transactions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setLoadError(errorMessage);
      
      // Auto-retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`[Categorize] Will retry in ${retryDelay}ms (attempt ${retryCount + 1}/3)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          updateTransactions();
        }, retryDelay);
      } else {
        // Show user-friendly error after all retries failed
        toast({
          title: "Failed to load transactions",
          description: "Your data might still be safe. Try refreshing the page or check if you're connected to the internet.",
          variant: "destructive",
          action: <button onClick={() => window.location.reload()}>Refresh Page</button>
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const safeUpdateTransactions = async () => {
      if (!isMounted) return;
      await updateTransactions();
    };

    safeUpdateTransactions();
    const unsubscribe = unifiedTransactionStore.subscribe(() => {
      if (isMounted) safeUpdateTransactions();
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [toast, retryCount]);

  return { 
    transactions, 
    isLoading, 
    loadError,
    retryLoading: () => {
      setRetryCount(0);
      setLoadError(null);
      updateTransactions();
    }
  };
};
