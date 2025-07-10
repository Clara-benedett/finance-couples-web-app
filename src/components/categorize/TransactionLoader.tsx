
import { useState, useEffect } from "react";
import { Transaction } from "@/types/transaction";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTransactionLoader = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const updateTransactions = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        console.log('[Categorize] Loading transactions...');
        
        // Ensure user is authenticated first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[Categorize] No authenticated user');
          setTransactions([]);
          return;
        }
        
        console.log('[Categorize] User authenticated:', user.email);
        
        // Wait for store initialization with proper timeout
        await unifiedTransactionStore.waitForInitialization();
        const allTransactions = await unifiedTransactionStore.getTransactions();
        
        if (isMounted) {
          console.log(`[Categorize] Loaded ${allTransactions.length} transactions from unified store`);
          setTransactions(allTransactions);
          
          // If no transactions found, remind user about recovery
          if (allTransactions.length === 0) {
            console.log('');
            console.log('💡 NO TRANSACTIONS FOUND. Try these recovery commands:');
            console.log('   checkAllStorage()    - Check for data in browser storage');
            console.log('   emergencyRecover()   - Restore found data to database');
            console.log('');
          }
        }
      } catch (error) {
        console.error('[Categorize] Error loading transactions:', error);
        if (isMounted) {
          toast({
            title: "Error loading transactions",
            description: "Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    updateTransactions();
    const unsubscribe = unifiedTransactionStore.subscribe(() => {
      if (isMounted) updateTransactions();
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [toast]);

  return { transactions, isLoading };
};
