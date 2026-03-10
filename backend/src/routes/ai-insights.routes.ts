/**
 * AI Insights route - combined insights based on full transaction history
 */

import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDashboardSummary, getCategoryBreakdown } from '../models/transaction.model';
import { generateAiInsights } from '../services/openai.service';
import { AppError } from '../middleware/error.middleware';

export const aiInsightsRouter = Router();

/**
 * POST /api/ai-insights
 */
aiInsightsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError(503, 'AI features not configured');
    }

    const userId = req.userId!;

    const [summary, categories] = await Promise.all([
      getDashboardSummary(userId),
      getCategoryBreakdown(userId),
    ]);

    const insights = await generateAiInsights({
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netBalance: summary.netBalance,
      transactionCount: summary.transactionCount,
      categories,
    });

    console.log('[ai] insights generated', {
      userId,
      txCount: summary.transactionCount,
      catCount: categories.length,
    });

    res.json(insights);
  } catch (err) {
    next(err);
  }
});

