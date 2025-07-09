
// Enhanced MCC Code to Emoji mapping
export const MCC_EMOJI_MAP: { [key: string]: string } = {
  // Restaurants & Dining
  '5812': '🍽️', // Restaurants
  '5813': '🍻', // Bars & Drinking Places
  '5814': '🍔', // Fast Food
  
  // Transportation
  '4121': '🚗', // Taxicabs & Limousines
  '4131': '🚌', // Bus Lines
  '4111': '🚇', // Transportation/Suburban & Local
  '4511': '✈️', // Airlines
  '5541': '⛽', // Service Stations
  '5542': '⛽', // Automated Fuel Dispensers
  
  // Grocery & Food
  '5411': '🛒', // Grocery Stores
  '5422': '🥩', // Freezer & Meat Lockers
  '5441': '🍬', // Candy, Nut & Confectionery Stores
  
  // Retail
  '5311': '🏪', // Department Stores
  '5331': '🛍️', // Variety Stores
  '5399': '🛍️', // Miscellaneous General Merchandise
  '5732': '📱', // Electronics Stores
  '5411': '🛒', // Supermarkets
  
  // Entertainment
  '5813': '🍻', // Drinking Places
  '7832': '🎬', // Motion Picture Theaters
  '7933': '🎳', // Bowling Alleys
  
  // Hotels & Travel
  '7011': '🏨', // Hotels & Motels
  '3501': '🏨', // Hilton
  '3502': '🏨', // Marriott
  
  // Health & Pharmacy
  '5912': '💊', // Drug Stores & Pharmacies
  '8011': '🏥', // Doctors
  '8021': '🦷', // Dentists
  
  // Financial
  '6011': '🏧', // ATM
  '6012': '🏧', // Financial Institutions
  
  // Gas Stations
  '5541': '⛽', // Service Stations
  '5542': '⛽', // Automated Fuel Dispensers
};

// Bank Category to Emoji mapping
export const BANK_CATEGORY_EMOJI_MAP: { [key: string]: string } = {
  // Dining & Restaurants
  'restaurants': '🍽️',
  'dining': '🍽️',
  'food': '🍽️',
  'fast food': '🍔',
  'coffee': '☕',
  'bars': '🍻',
  
  // Transportation
  'gas': '⛽',
  'fuel': '⛽',
  'automotive': '🚗',
  'transportation': '🚗',
  'uber': '🚗',
  'lyft': '🚗',
  'taxi': '🚗',
  'airlines': '✈️',
  'travel': '✈️',
  
  // Shopping
  'shopping': '🛍️',
  'retail': '🛍️',
  'department stores': '🏪',
  'groceries': '🛒',
  'grocery': '🛒',
  'supermarket': '🛒',
  
  // Entertainment
  'entertainment': '🎬',
  'movies': '🎬',
  'recreation': '🎯',
  
  // Health
  'health': '🏥',
  'medical': '🏥',
  'pharmacy': '💊',
  'healthcare': '🏥',
  
  // Utilities
  'utilities': '💡',
  'internet': '💻',
  'phone': '📱',
  
  // Financial
  'banking': '🏧',
  'atm': '🏧',
  'fees': '💳',
  
  // General
  'miscellaneous': '💳',
  'other': '💳',
};

// Merchant/Description patterns to Emoji mapping
export const MERCHANT_EMOJI_PATTERNS: Array<{ pattern: RegExp; emoji: string }> = [
  // Transportation
  { pattern: /uber|lyft/i, emoji: '🚗' },
  { pattern: /shell|chevron|bp|exxon|mobil|texaco|citgo|sunoco|valero|marathon|speedway|wawa|sheetz/i, emoji: '⛽' },
  { pattern: /southwest|delta|american|united|alaska|jetblue|spirit|frontier/i, emoji: '✈️' },
  
  // Restaurants & Food
  { pattern: /starbucks|dunkin|coffee|cafe/i, emoji: '☕' },
  { pattern: /mcdonalds|burger king|taco bell|kfc|subway|chipotle|panera|pizza|dominos|papa johns/i, emoji: '🍔' },
  { pattern: /restaurant|dining|bistro|grill|kitchen|tavern|steakhouse/i, emoji: '🍽️' },
  { pattern: /bar|brewery|pub|lounge/i, emoji: '🍻' },
  
  // Grocery & Shopping
  { pattern: /safeway|kroger|walmart|target|costco|sams club|whole foods|trader joes|aldi/i, emoji: '🛒' },
  { pattern: /amazon|ebay|etsy|shopping/i, emoji: '📦' },
  { pattern: /home depot|lowes|menards/i, emoji: '🔨' },
  { pattern: /best buy|apple store|electronics/i, emoji: '📱' },
  { pattern: /macy|nordstrom|kohls|tjmaxx|marshall|clothing|apparel/i, emoji: '👕' },
  
  // Entertainment
  { pattern: /netflix|hulu|spotify|apple music|disney|entertainment/i, emoji: '🎬' },
  { pattern: /gym|fitness|yoga|sport/i, emoji: '💪' },
  
  // Health & Pharmacy
  { pattern: /cvs|walgreens|rite aid|pharmacy|drugstore/i, emoji: '💊' },
  { pattern: /hospital|medical|doctor|clinic|dentist/i, emoji: '🏥' },
  
  // Utilities & Services
  { pattern: /electric|gas company|water|sewer|utility/i, emoji: '💡' },
  { pattern: /internet|cable|phone|verizon|att|comcast|spectrum/i, emoji: '📡' },
  { pattern: /bank|atm|fee|wells fargo|chase|bank of america|citibank/i, emoji: '🏧' },
  
  // Default fallback
  { pattern: /.*/, emoji: '💳' }
];

export function getTransactionEmoji(
  mccCode?: string,
  bankCategory?: string,
  description?: string
): string {
  console.log('Getting emoji for:', { mccCode, bankCategory, description });
  
  // Priority 1: MCC Code
  if (mccCode && MCC_EMOJI_MAP[mccCode]) {
    console.log('Using MCC emoji:', MCC_EMOJI_MAP[mccCode]);
    return MCC_EMOJI_MAP[mccCode];
  }
  
  // Priority 2: Bank Category
  if (bankCategory) {
    const normalizedCategory = bankCategory.toLowerCase().trim();
    for (const [category, emoji] of Object.entries(BANK_CATEGORY_EMOJI_MAP)) {
      if (normalizedCategory.includes(category)) {
        console.log('Using bank category emoji:', emoji);
        return emoji;
      }
    }
  }
  
  // Priority 3: Description Analysis
  if (description) {
    for (const { pattern, emoji } of MERCHANT_EMOJI_PATTERNS) {
      if (pattern.test(description)) {
        console.log('Using description pattern emoji:', emoji);
        return emoji;
      }
    }
  }
  
  // Default fallback
  console.log('Using default emoji: 💳');
  return '💳';
}
