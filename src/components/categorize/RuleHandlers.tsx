
import { Transaction } from "@/types/transaction";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { categorizationRulesEngine } from "@/utils/categorizationRules";
import { useToast } from "@/hooks/use-toast";

type CategoryType = "person1" | "person2" | "shared" | "UNCLASSIFIED";

export const useRuleHandlers = (transactions: Transaction[]) => {
  const { toast } = useToast();

  const handleAcceptRule = (ruleSuggestion: {
    merchantName: string;
    category: CategoryType;
    categoryDisplayName: string;
  } | null) => {
    if (!ruleSuggestion) return;
    
    const categoryMap: Record<CategoryType, string> = {
      person1: 'person1',
      person2: 'person2', 
      shared: 'shared',
      UNCLASSIFIED: 'UNCLASSIFIED'
    };
    
    // Create the rule
    categorizationRulesEngine.createRule(
      ruleSuggestion.merchantName, 
      categoryMap[ruleSuggestion.category]
    );
    
    // Apply to remaining unclassified transactions with same merchant
    const unclassifiedSameMerchant = transactions.filter(t => 
      !t.isClassified && 
      t.description.toUpperCase().trim() === ruleSuggestion.merchantName.toUpperCase().trim()
    );
    
    unclassifiedSameMerchant.forEach(async (transaction) => {
      await unifiedTransactionStore.updateTransaction(transaction.id, {
        category: categoryMap[ruleSuggestion.category],
        isClassified: true,
        autoAppliedRule: true
      });
    });
    
    if (unclassifiedSameMerchant.length > 0) {
      toast({
        title: "Rule created!",
        description: `Applied to ${unclassifiedSameMerchant.length} remaining ${ruleSuggestion.merchantName} transactions`,
      });
    } else {
      toast({
        title: "Rule created!",
        description: `Future ${ruleSuggestion.merchantName} transactions will be auto-categorized`,
      });
    }
  };

  const applyRules = async () => {
    try {
      const appliedCount = await unifiedTransactionStore.applyRulesToExistingTransactions();
      if (appliedCount > 0) {
        toast({
          title: "Rules Applied",
          description: `${appliedCount} transactions were automatically categorized.`,
        });
      }
    } catch (error) {
      console.error('[Categorize] Error applying rules:', error);
    }
  };

  return {
    handleAcceptRule,
    applyRules
  };
};
