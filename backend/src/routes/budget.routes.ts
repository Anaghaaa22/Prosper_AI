/**
 * Budget suggestions route - analyzes spending and suggests allocations
 */

import { Router } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { getCategoryBreakdown, getDashboardSummary } from '../models/transaction.model';
import { AppError } from '../middleware/error.middleware';
import { getBudgetSuggestions } from '../services/openai.service';

export const budgetRouter = Router();

/**
 * GET /api/budget-suggestions
 */
budgetRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError(503, 'AI features not configured');
    }

    const userId = req.userId!;

    const [summary, categories] = await Promise.all([
      getDashboardSummary(userId),
      getCategoryBreakdown(userId),
    ]);

    const text = await getBudgetSuggestions({
      totalExpenses: summary.totalExpenses,
      totalIncome: summary.totalIncome,
      byCategory: categories.map((c) => ({
        category: c.category,
        total: c.totalAmount,
      })),
      transactionCount: summary.transactionCount,
    });

    console.log('[ai] budget suggestions generated', {
      userId,
      txCount: summary.transactionCount,
      catCount: categories.length,
    });

    res.json({ suggestions: text });
  } catch (err) {
    next(err);
  }
});

