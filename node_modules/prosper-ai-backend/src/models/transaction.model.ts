/**
 * Transaction model - database operations for financial transactions
 */

import { query } from '../config/database';

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  raw_category: string;
  type: string;
  created_at: Date;
}

export interface TransactionCreate {
  user_id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
  raw_category?: string;
  type?: string;
}

export async function createTransaction(data: TransactionCreate): Promise<Transaction> {
  const rows = await query<Transaction>(
    `INSERT INTO transactions (user_id, date, description, amount, category, raw_category, type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, date, description, amount) DO NOTHING
     RETURNING *`,
    [
      data.user_id,
      data.date,
      data.description,
      data.amount,
      data.category || null,
      data.raw_category || null,
      data.type || 'expense',
    ]
  );
  return rows[0];
}

export async function createManyTransactions(transactions: TransactionCreate[]): Promise<number> {
  if (transactions.length === 0) return 0;
  let inserted = 0;
  for (const t of transactions) {
    const rows = await query<{ id: string }>(
      `INSERT INTO transactions (user_id, date, description, amount, category, raw_category, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, date, description, amount) DO NOTHING
       RETURNING id`,
      [t.user_id, t.date, t.description, t.amount, t.category || null, t.raw_category || null, t.type || 'expense']
    );
    if (rows.length > 0) inserted++;
  }
  return inserted;
}

export async function getByUserId(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> {
  if (startDate && endDate) {
    return query<Transaction>(
      `SELECT * FROM transactions 
       WHERE user_id = $1 AND date >= $2 AND date <= $3 
       ORDER BY date DESC`,
      [userId, startDate, endDate]
    );
  }
  return query<Transaction>(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );
}

export async function getMonthlySummary(userId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const totals = await query<{ total_expenses: string; total_income: string; count: string }>(
    `SELECT 
       COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)::text as total_expenses,
       COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::text as total_income,
       COUNT(*)::text as count
     FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3`,
    [userId, startDate, endDate]
  );

  const byCategory = await query<{ category: string; total: string }>(
    `SELECT category, SUM(ABS(amount)) as total
     FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3 AND amount < 0
     GROUP BY category
     ORDER BY total DESC`,
    [userId, startDate, endDate]
  );

  return {
    totalExpenses: parseFloat(totals[0]?.total_expenses || '0'),
    totalIncome: parseFloat(totals[0]?.total_income || '0'),
    transactionCount: parseInt(totals[0]?.count || '0', 10),
    byCategory: byCategory.map(r => ({ category: r.category || 'Uncategorized', total: parseFloat(r.total) })),
  };
}
