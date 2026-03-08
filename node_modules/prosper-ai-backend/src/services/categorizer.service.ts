/**
 * Expense categorization - Rule-based + extensible for ML
 * Matches transaction descriptions to predefined categories
 */

// Rule-based category mapping (description keywords -> category)
const CATEGORY_RULES: { pattern: RegExp; category: string }[] = [
  { pattern: /\b(amazon|shopify|ebay|walmart|target)\b/i, category: 'Shopping' },
  { pattern: /\b(uber|lyft|doordash|grubhub|postmates)\b/i, category: 'Transport & Food Delivery' },
  { pattern: /\b(starbucks|mcdonald|burger|pizza|restaurant|cafe|coffee)\b/i, category: 'Food & Dining' },
  { pattern: /\b(grocery|supermarket|trader joe|whole foods|safeway)\b/i, category: 'Groceries' },
  { pattern: /\b(netflix|spotify|hulu|disney|hbo|youtube premium)\b/i, category: 'Subscriptions' },
  { pattern: /\b(electric|gas|water|utility|internet|phone)\b/i, category: 'Utilities' },
  { pattern: /\b(rent|mortgage|landlord)\b/i, category: 'Housing' },
  { pattern: /\b(insurance|geico|progressive|state farm)\b/i, category: 'Insurance' },
  { pattern: /\b(hospital|doctor|pharmacy|medical)\b/i, category: 'Healthcare' },
  { pattern: /\b(gym|fitness)\b/i, category: 'Health & Fitness' },
  { pattern: /\b(salary|payroll|direct dep)\b/i, category: 'Income' },
  { pattern: /\b(transfer|venmo|paypal|zelle)\b/i, category: 'Transfer' },
  { pattern: /\b(atm|withdrawal)\b/i, category: 'Cash' },
  { pattern: /\b(gas|fuel|shell|chevron|exxon)\b/i, category: 'Gas & Fuel' },
  { pattern: /\b(travel|airline|hotel|booking)\b/i, category: 'Travel' },
  { pattern: /\b(education|tuition|course|udemy)\b/i, category: 'Education' },
];

export function categorizeTransaction(description: string, amount: number): string {
  // Income detection (positive amounts)
  if (amount > 0) {
    for (const { pattern, category } of CATEGORY_RULES) {
      if (category === 'Income' && pattern.test(description)) return category;
    }
    return 'Income';
  }

  // Expense categorization
  const desc = (description || '').toLowerCase();
  for (const { pattern, category } of CATEGORY_RULES) {
    if (category !== 'Income' && pattern.test(desc)) return category;
  }

  return 'Uncategorized';
}
