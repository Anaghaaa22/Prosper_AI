/**
 * Dashboard routes - summaries, categories, trends
 */

import { Router } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { pool } from "../config/database";

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/summary
 * Overall income, expenses, net, transaction count
 */
dashboardRouter.get("/summary", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const result = await pool.query(
      `SELECT amount, type, category, date 
       FROM transactions 
       WHERE user_id = $1`,
      [userId]
    );

    const transactions = result.rows;

    let income = 0;
    let expenses = 0;

    const categoryTotals: any = {};

    const monthlyTotals: any = {};

    transactions.forEach((t) => {
      const amount = Number(t.amount);

      // Income vs Expense
      if (t.type === "credit") {
        income += amount;
      } else if (t.type === "debit") {
        expenses += amount;

        // Category breakdown
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + amount;
      }

      // Monthly trends
      const month = new Date(t.date).toLocaleString("default", {
        month: "short",
      });

      monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
    });

    const net = income - expenses;

    const categoryData = Object.entries(categoryTotals).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    const monthlyTrends = Object.entries(monthlyTotals).map(
      ([month, value]) => ({
        month,
        value,
      })
    );

    res.json({
      income,
      expenses,
      net,
      transactions: transactions.length,
      categories: categoryData,
      trends: monthlyTrends,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/categories
 * Grouped spending by category
 */
dashboardRouter.get("/categories", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const result = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'debit'
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    res.json({ categories: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/trends
 * Monthly spending trends for charts
 */
dashboardRouter.get("/trends", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const result = await pool.query(
      `SELECT DATE_TRUNC('month', date) as month,
       SUM(amount) as total
       FROM transactions
       WHERE user_id = $1
       GROUP BY month
       ORDER BY month`,
      [userId]
    );

    res.json({ trends: result.rows });
  } catch (err) {
    next(err);
  }
});