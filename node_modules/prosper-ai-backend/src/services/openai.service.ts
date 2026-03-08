/**
 * OpenAI integration - Financial advice, savings tips, budget suggestions
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface FinancialContext {
  totalExpenses: number;
  totalIncome: number;
  byCategory: { category: string; total: number }[];
  transactionCount: number;
}

/**
 * Generate personalized financial advice using GPT
 */
export async function getFinancialAdvice(context: FinancialContext): Promise<string> {
  const prompt = `You are a friendly financial advisor. Based on this user's monthly financial summary, provide 2-3 concise, actionable pieces of advice. Be specific and practical.

Monthly Summary:
- Total Income: $${context.totalIncome.toFixed(2)}
- Total Expenses: $${context.totalExpenses.toFixed(2)}
- Net: $${(context.totalIncome - context.totalExpenses).toFixed(2)}
- Transaction Count: ${context.transactionCount}

Top expense categories:
${context.byCategory.slice(0, 6).map(c => `- ${c.category}: $${c.total.toFixed(2)}`).join('\n')}

Respond in a friendly tone with bullet points. Keep it under 200 words.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content?.trim() || 'Unable to generate advice.';
}

/**
 * Generate savings recommendations
 */
export async function getSavingsRecommendations(context: FinancialContext): Promise<string> {
  const prompt = `You are a savings expert. Based on this user's spending:

Monthly Expenses: $${context.totalExpenses.toFixed(2)}
Monthly Income: $${context.totalIncome.toFixed(2)}

Top categories:
${context.byCategory.slice(0, 6).map(c => `- ${c.category}: $${c.total.toFixed(2)}`).join('\n')}

Give 2-3 specific, actionable savings recommendations. Focus on realistic cuts and habits. Keep under 150 words.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 350,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content?.trim() || 'Unable to generate recommendations.';
}

/**
 * Generate budget suggestions
 */
export async function getBudgetSuggestions(context: FinancialContext): Promise<string> {
  const prompt = `You are a budgeting coach. User's monthly income: $${context.totalIncome.toFixed(2)}, expenses: $${context.totalExpenses.toFixed(2)}.

Spending by category:
${context.byCategory.slice(0, 8).map(c => `- ${c.category}: $${c.total.toFixed(2)} (${((c.total / context.totalExpenses) * 100).toFixed(1)}%)`).join('\n')}

Suggest a simple 50/30/20 or customized budget allocation. Provide specific dollar amounts per category. Keep under 180 words.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content?.trim() || 'Unable to generate budget suggestions.';
}
