
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
  
  // Entertainment
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

// Comprehensive merchant/keyword patterns based on real bank data
export const MERCHANT_EMOJI_PATTERNS: Array<{ pattern: RegExp; emoji: string }> = [
  // Transportation & Gas Stations
  { pattern: /uber|lyft|rideshare/i, emoji: '🚗' },
  { pattern: /shell|chevron|bp|exxon|mobil|texaco|citgo|sunoco|valero|marathon|speedway|wawa|sheetz|arco|phillips 66/i, emoji: '⛽' },
  { pattern: /southwest|delta|american|united|alaska|jetblue|spirit|frontier|airline/i, emoji: '✈️' },
  { pattern: /parking|meter|garage/i, emoji: '🚗' },
  
  // Coffee & Quick Service
  { pattern: /starbucks|dunkin|coffee|cafe|peet|caribou/i, emoji: '☕' },
  
  // Fast Food & Restaurants
  { pattern: /mcdonalds|burger king|taco bell|kfc|subway|chipotle|panera|pizza|dominos|papa johns|wendy|arbys|dairy queen/i, emoji: '🍔' },
  { pattern: /restaurant|dining|bistro|grill|kitchen|tavern|steakhouse|diner|eatery/i, emoji: '🍽️' },
  { pattern: /bar|brewery|pub|lounge|taphouse/i, emoji: '🍻' },
  
  // Grocery & Food Shopping
  { pattern: /safeway|kroger|walmart|target|costco|sams club|whole foods|trader joes|aldi|publix|wegmans|stop shop|giant|harris teeter/i, emoji: '🛒' },
  { pattern: /grocery|supermarket|market|food store/i, emoji: '🛒' },
  
  // Online & General Shopping
  { pattern: /amazon|ebay|etsy|paypal|stripe|square/i, emoji: '📦' },
  { pattern: /home depot|lowes|menards|hardware/i, emoji: '🔨' },
  { pattern: /best buy|apple store|electronics|computer|tech/i, emoji: '📱' },
  { pattern: /macy|nordstrom|kohls|tjmaxx|marshall|clothing|apparel|fashion/i, emoji: '👕' },
  
  // Entertainment & Subscriptions
  { pattern: /netflix|hulu|spotify|apple music|disney|amazon prime|subscription/i, emoji: '🎬' },
  { pattern: /gym|fitness|yoga|sport|planet fitness|la fitness/i, emoji: '💪' },
  { pattern: /movie|cinema|theater|amc|regal/i, emoji: '🎬' },
  
  // Health & Pharmacy
  { pattern: /cvs|walgreens|rite aid|pharmacy|drugstore|prescription/i, emoji: '💊' },
  { pattern: /hospital|medical|doctor|clinic|dentist|healthcare/i, emoji: '🏥' },
  
  // Utilities & Services
  { pattern: /electric|gas company|water|sewer|utility|pge|con ed/i, emoji: '💡' },
  { pattern: /internet|cable|phone|verizon|att|comcast|spectrum|xfinity/i, emoji: '📡' },
  { pattern: /bank|atm|fee|wells fargo|chase|bank of america|citibank|capital one/i, emoji: '🏧' },
  
  // Hotels & Travel
  { pattern: /hotel|motel|marriott|hilton|hyatt|holiday inn|travel|booking/i, emoji: '🏨' },
  
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
