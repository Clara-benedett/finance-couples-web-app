
const CARD_CLASSIFICATION_STORAGE_KEY = 'expense_tracker_card_classification_rules';

export interface CardClassificationRule {
  cardName: string;
  classification: 'person1' | 'person2' | 'shared' | 'skip';
  createdAt: string;
  lastUsed: string;
}

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
      // Don't save skip rules
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
    
    if (rule) {
      // Update last used timestamp
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
}

export const cardClassificationEngine = new CardClassificationEngine();
