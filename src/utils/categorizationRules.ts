
const RULES_STORAGE_KEY = 'expense_tracker_categorization_rules';
const USAGE_STORAGE_KEY = 'expense_tracker_rule_usage';

export interface CategorizationRule {
  merchantName: string;
  category: string;
  createdAt: string;
}

export interface RuleUsage {
  [merchantName: string]: {
    [category: string]: number;
  };
}

class CategorizationRulesEngine {
  private rules: { [merchantName: string]: string } = {};
  private usage: RuleUsage = {};

  constructor() {
    this.loadRules();
    this.loadUsage();
  }

  private loadRules() {
    try {
      const data = localStorage.getItem(RULES_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.rules = parsed.categorizationRules || {};
      }
    } catch (error) {
      console.error('Error loading categorization rules:', error);
      this.rules = {};
    }
  }

  private loadUsage() {
    try {
      const data = localStorage.getItem(USAGE_STORAGE_KEY);
      if (data) {
        this.usage = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading rule usage:', error);
      this.usage = {};
    }
  }

  private saveRules() {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify({
        categorizationRules: this.rules
      }));
    } catch (error) {
      console.error('Error saving categorization rules:', error);
    }
  }

  private saveUsage() {
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(this.usage));
    } catch (error) {
      console.error('Error saving rule usage:', error);
    }
  }

  trackCategorization(merchantName: string, category: string) {
    const normalizedMerchant = merchantName.toUpperCase().trim();
    
    if (!this.usage[normalizedMerchant]) {
      this.usage[normalizedMerchant] = {};
    }
    
    if (!this.usage[normalizedMerchant][category]) {
      this.usage[normalizedMerchant][category] = 0;
    }
    
    this.usage[normalizedMerchant][category]++;
    this.saveUsage();
  }

  shouldSuggestRule(merchantName: string, category: string): boolean {
    const normalizedMerchant = merchantName.toUpperCase().trim();
    
    // Don't suggest if rule already exists
    if (this.rules[normalizedMerchant]) {
      return false;
    }
    
    const merchantUsage = this.usage[normalizedMerchant];
    if (!merchantUsage || !merchantUsage[category]) {
      return false;
    }
    
    return merchantUsage[category] >= 3;
  }

  createRule(merchantName: string, category: string) {
    const normalizedMerchant = merchantName.toUpperCase().trim();
    this.rules[normalizedMerchant] = category;
    this.saveRules();
    console.log(`Rule created: ${normalizedMerchant} → ${category}`);
  }

  getRuleForMerchant(merchantName: string): string | null {
    const normalizedMerchant = merchantName.toUpperCase().trim();
    return this.rules[normalizedMerchant] || null;
  }

  getAllRules() {
    return { ...this.rules };
  }

  applyRulesToTransactions(transactions: any[]): { transaction: any; wasAutoApplied: boolean }[] {
    return transactions.map(transaction => {
      if (transaction.category !== 'UNCLASSIFIED' || transaction.isClassified) {
        return { transaction, wasAutoApplied: false };
      }

      const ruleCategory = this.getRuleForMerchant(transaction.description);
      if (ruleCategory) {
        return {
          transaction: {
            ...transaction,
            category: ruleCategory,
            isClassified: true,
            autoAppliedRule: true
          },
          wasAutoApplied: true
        };
      }

      return { transaction, wasAutoApplied: false };
    });
  }
}

export const categorizationRulesEngine = new CategorizationRulesEngine();
