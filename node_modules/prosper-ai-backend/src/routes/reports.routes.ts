/**
 * Reports API routes - Monthly summaries, expense breakdown
 */

import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getMonthlySummary, getByUserId } from '../models/transaction.model';
import { AppError } from '../middleware/error.middleware';

export const reportsRouter = Router();

/**
 * GET /api/reports/monthly?year=2024&month=3 - Monthly financial summary
 */
reportsRouter.get('/monthly', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);

    if (!year || !month || month < 1 || month > 12) {
      throw new AppError(400, 'Valid year and month required');
    }

    const summary = await getMonthlySummary(userId, year, month);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/summary - Quick overview (current month)
 */
reportsRouter.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const summary = await getMonthlySummary(userId, now.getFullYear(), now.getMonth() + 1);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/reports/transactions - Paginated transactions (optional filters)
 */
reportsRouter.get('/transactions', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;
    const transactions = await getByUserId(
      userId,
      startDate as string,
      endDate as string
    );
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});
