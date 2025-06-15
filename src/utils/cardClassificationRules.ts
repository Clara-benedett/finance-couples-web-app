
const CARD_CLASSIFICATION_STORAGE_KEY = 'expense_tracker_card_classification_rules';

export interface CardClassificationRule {
  cardName: string;
  classification: 'person1' | 'person2' | 'shared' | 'skip';
  createdAt: string;
  lastUsed: string;
}

// Common card name templates for suggestions
export const COMMON_CARD_TEMPLATES = [
  'Chase Sapphire Preferred',
  'Chase Sapphire Reserve',
  'Chase Freedom',
  'Chase Freedom Unlimited',
  'AMEX Gold',
  'AMEX Platinum',
  'AMEX Blue Cash',
  'Capital One Venture',
  'Capital One Quicksilver',
  'Citi Double Cash',
  'Discover It',
  'Apple Card',
  'Bank of America Cash Rewards',
  'Wells Fargo Active Cash',
  'PayPal Credit',
  'Venmo Credit Card',
  'Target RedCard',
  'Amazon Prime Card'
];

class CardClassificationEngine {
  private rules: { [cardName: string]: CardClassificationRule } = {};

  constructor() {
    this.loadRules();
  }

  private loadRules() {
    try {
      const data = localStorage.getItem(CARD_CLASSIFICATION_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.rules = parsed || {};
      }
    } catch (error) {
      console.error('Error loading card classification rules:', error);
      this.rules = {};
    }
  }

  private saveRules() {
    try {
      localStorage.setItem(CARD_CLASSIFICATION_STORAGE_KEY, JSON.stringify(this.rules));
    } catch (error) {
      console.error('Error saving card classification rules:', error);
    }
  }

  saveCardClassification(cardName: string, classification: 'person1' | 'person2' | 'shared' | 'skip') {
    if (classification === 'skip') {
      return;
    }

    const normalizedCardName = cardName.toUpperCase().trim();
    
    this.rules[normalizedCardName] = {
      cardName: cardName,
      classification,
      createdAt: this.rules[normalizedCardName]?.createdAt || new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    this.saveRules();
    console.log(`Card classification rule saved: ${cardName} → ${classification}`);
  }

  getCardClassification(cardName: string): 'person1' | 'person2' | 'shared' | null {
    const normalizedCardName = cardName.toUpperCase().trim();
    const rule = this.rules[normalizedCardName];
    
    if (rule && rule.classification !== 'skip') {
      rule.lastUsed = new Date().toISOString();
      this.saveRules();
      return rule.classification;
    }
    
    return null;
  }

  getAllRules(): CardClassificationRule[] {
    return Object.values(this.rules);
  }

  deleteRule(cardName: string) {
    const normalizedCardName = cardName.toUpperCase().trim();
    delete this.rules[normalizedCardName];
    this.saveRules();
  }

  // New methods for smart management
  searchCards(query: string): CardClassificationRule[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllRules().filter(rule => 
      rule.cardName.toLowerCase().includes(lowerQuery)
    );
  }

  getExactMatch(cardName: string): CardClassificationRule | null {
    const normalizedCardName = cardName.toUpperCase().trim();
    return this.rules[normalizedCardName] || null;
  }

  getSuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    
    // Only return common card templates that match the query
    return COMMON_CARD_TEMPLATES.filter(template => 
      template.toLowerCase().includes(lowerQuery)
    );
  }

  updateCardName(oldName: string, newName: string) {
    const normalizedOldName = oldName.toUpperCase().trim();
    const rule = this.rules[normalizedOldName];
    
    if (rule) {
      delete this.rules[normalizedOldName];
      this.saveCardClassification(newName, rule.classification);
    }
  }

  mergeCards(sourceCardName: string, targetCardName: string) {
    const normalizedSource = sourceCardName.toUpperCase().trim();
    const sourceRule = this.rules[normalizedSource];
    
    if (sourceRule) {
      this.saveCardClassification(targetCardName, sourceRule.classification);
      delete this.rules[normalizedSource];
      this.saveRules();
    }
  }
}

export const cardClassificationEngine = new CardClassificationEngine();
