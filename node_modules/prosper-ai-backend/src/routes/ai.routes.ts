/**
 * AI routes - OpenAI-powered financial insights
 */

import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getMonthlySummary } from '../models/transaction.model';
import { getFinancialAdvice, getSavingsRecommendations, getBudgetSuggestions } from '../services/openai.service';
import { AppError } from '../middleware/error.middleware';

export const aiRouter = Router();

/**
 * POST /api/ai/advice - Get personalized financial advice
 * Optional body: { year, month } - defaults to current month
 */
aiRouter.post('/advice', async (req: AuthRequest, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError(503, 'AI features not configured');
    }
    const userId = req.userId!;
    const now = new Date();
    const year = req.body.year ?? now.getFullYear();
    const month = req.body.month ?? now.getMonth() + 1;

    const summary = await getMonthlySummary(userId, year, month);
    const advice = await getFinancialAdvice(summary);
    res.json({ advice });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/savings - Get savings recommendations
 */
aiRouter.post('/savings', async (req: AuthRequest, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError(503, 'AI features not configured');
    }
    const userId = req.userId!;
    const now = new Date();
    const year = req.body.year ?? now.getFullYear();
    const month = req.body.month ?? now.getMonth() + 1;

    const summary = await getMonthlySummary(userId, year, month);
    const recommendations = await getSavingsRecommendations(summary);
    res.json({ recommendations });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/budget - Get budget suggestions
 */
aiRouter.post('/budget', async (req: AuthRequest, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError(503, 'AI features not configured');
    }
    const userId = req.userId!;
    const now = new Date();
    const year = req.body.year ?? now.getFullYear();
    const month = req.body.month ?? now.getMonth() + 1;

    const summary = await getMonthlySummary(userId, year, month);
    const suggestions = await getBudgetSuggestions(summary);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});
