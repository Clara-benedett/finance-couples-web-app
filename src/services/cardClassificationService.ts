
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CardClassificationRule {
  id: string;
  user_id: string;
  card_name: string;
  classification: 'person1' | 'person2' | 'shared';
  created_at: string;
  last_used: string;
  updated_at: string;
}

export class CardClassificationService {
  async getAllRules(): Promise<CardClassificationRule[]> {
    const { data, error } = await supabase
      .from('card_classification_rules')
      .select('*')
      .order('last_used', { ascending: false });

    if (error) {
      console.error('Error fetching card rules:', error);
      return [];
    }

    return data || [];
  }

  async getCardClassification(cardName: string): Promise<'person1' | 'person2' | 'shared' | null> {
    const normalizedCardName = cardName.toUpperCase().trim();
    
    const { data, error } = await supabase
      .from('card_classification_rules')
      .select('classification, id')
      .eq('card_name', normalizedCardName)
      .single();

    if (error || !data) {
      return null;
    }

    // Update last_used timestamp
    await supabase
      .from('card_classification_rules')
      .update({ last_used: new Date().toISOString() })
      .eq('id', data.id);

    return data.classification as 'person1' | 'person2' | 'shared';
  }

  async saveCardClassification(cardName: string, classification: 'person1' | 'person2' | 'shared'): Promise<boolean> {
    const normalizedCardName = cardName.toUpperCase().trim();
    const now = new Date().toISOString();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    // Try to update existing rule first
    const { data: existingRule } = await supabase
      .from('card_classification_rules')
      .select('id')
      .eq('card_name', normalizedCardName)
      .single();

    if (existingRule) {
      const { error } = await supabase
        .from('card_classification_rules')
        .update({
          classification,
          last_used: now,
          updated_at: now
        })
        .eq('id', existingRule.id);

      if (error) {
        console.error('Error updating card rule:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('card_classification_rules')
        .insert({
          user_id: user.id,
          card_name: normalizedCardName,
          classification,
          created_at: now,
          last_used: now,
          updated_at: now
        });

      if (error) {
        console.error('Error creating card rule:', error);
        return false;
      }
    }

    console.log(`Card classification rule saved: ${cardName} → ${classification}`);
    return true;
  }

  async deleteRule(cardName: string): Promise<boolean> {
    const normalizedCardName = cardName.toUpperCase().trim();
    
    const { error } = await supabase
      .from('card_classification_rules')
      .delete()
      .eq('card_name', normalizedCardName);

    if (error) {
      console.error('Error deleting card rule:', error);
      return false;
    }

    return true;
  }

  async getExactMatch(cardName: string): Promise<CardClassificationRule | null> {
    const normalizedCardName = cardName.toUpperCase().trim();
    
    const { data, error } = await supabase
      .from('card_classification_rules')
      .select('*')
      .eq('card_name', normalizedCardName)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async searchCards(query: string): Promise<CardClassificationRule[]> {
    const { data, error } = await supabase
      .from('card_classification_rules')
      .select('*')
      .ilike('card_name', `%${query}%`)
      .order('last_used', { ascending: false });

    if (error) {
      console.error('Error searching card rules:', error);
      return [];
    }

    return data || [];
  }

  async updateCardName(oldName: string, newName: string): Promise<boolean> {
    const normalizedOldName = oldName.toUpperCase().trim();
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('card_classification_rules')
      .update({
        card_name: newName.toUpperCase().trim(),
        updated_at: now
      })
      .eq('card_name', normalizedOldName);

    if (error) {
      console.error('Error updating card name:', error);
      return false;
    }

    return true;
  }

  async mergeCards(sourceCardName: string, targetCardName: string): Promise<boolean> {
    const normalizedSource = sourceCardName.toUpperCase().trim();
    
    // Get the source rule
    const { data: sourceRule, error: sourceError } = await supabase
      .from('card_classification_rules')
      .select('classification')
      .eq('card_name', normalizedSource)
      .single();

    if (sourceError || !sourceRule) {
      console.error('Error fetching source rule:', sourceError);
      return false;
    }

    // Save the classification to the target card
    const saved = await this.saveCardClassification(targetCardName, sourceRule.classification);
    if (!saved) {
      return false;
    }

    // Delete the source rule
    const deleted = await this.deleteRule(sourceCardName);
    return deleted;
  }

  // Common card name templates for suggestions
  getSuggestions(query: string): string[] {
    const COMMON_CARD_TEMPLATES = [
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

    const lowerQuery = query.toLowerCase();
    return COMMON_CARD_TEMPLATES.filter(template => 
      template.toLowerCase().includes(lowerQuery)
    );
  }
}

export const cardClassificationService = new CardClassificationService();
