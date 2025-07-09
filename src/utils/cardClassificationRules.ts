
import { cardClassificationService, CardClassificationRule } from '@/services/cardClassificationService';

// Re-export the interface and common templates for backwards compatibility
export { CardClassificationRule } from '@/services/cardClassificationService';

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

// Legacy interface for backwards compatibility - now just wraps the Supabase service
class CardClassificationEngine {
  async saveCardClassification(cardName: string, classification: 'person1' | 'person2' | 'shared' | 'skip'): Promise<void> {
    if (classification === 'skip') {
      return;
    }
    await cardClassificationService.saveCardClassification(cardName, classification);
  }

  async getCardClassification(cardName: string): Promise<'person1' | 'person2' | 'shared' | null> {
    return await cardClassificationService.getCardClassification(cardName);
  }

  async getAllRules(): Promise<CardClassificationRule[]> {
    return await cardClassificationService.getAllRules();
  }

  async deleteRule(cardName: string): Promise<void> {
    await cardClassificationService.deleteRule(cardName);
  }

  async searchCards(query: string): Promise<CardClassificationRule[]> {
    return await cardClassificationService.searchCards(query);
  }

  async getExactMatch(cardName: string): Promise<CardClassificationRule | null> {
    return await cardClassificationService.getExactMatch(cardName);
  }

  getSuggestions(query: string): string[] {
    return cardClassificationService.getSuggestions(query);
  }

  async updateCardName(oldName: string, newName: string): Promise<void> {
    await cardClassificationService.updateCardName(oldName, newName);
  }

  async mergeCards(sourceCardName: string, targetCardName: string): Promise<void> {
    await cardClassificationService.mergeCards(sourceCardName, targetCardName);
  }
}

export const cardClassificationEngine = new CardClassificationEngine();
