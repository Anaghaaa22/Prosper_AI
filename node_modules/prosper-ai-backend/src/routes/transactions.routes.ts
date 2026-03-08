/**
 * Transactions API routes - CRUD + CSV upload
 */

import { Router } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth.middleware';
import { getByUserId, createManyTransactions } from '../models/transaction.model';
import { parseBankStatementCSV } from '../services/csv-parser.service';
import { AppError } from '../middleware/error.middleware';

export const transactionsRouter = Router();

// Multer config for CSV upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const allowed = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files allowed'));
    }
  },
});

/**
 * GET /api/transactions - List user transactions (optional date range)
 */
transactionsRouter.get('/', async (req: AuthRequest, res, next) => {
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

/**
 * POST /api/transactions/upload - Upload bank statement CSV
 */
transactionsRouter.post(
  '/upload',
  upload.single('file'),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId!;
      const file = req.file;
      if (!file) {
        throw new AppError(400, 'No file uploaded');
      }

      const parsed = parseBankStatementCSV(file.buffer);
      if (parsed.length === 0) {
        throw new AppError(400, 'No valid transactions found in CSV');
      }

      const toInsert = parsed.map(t => ({
        user_id: userId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category,
        raw_category: t.category,
        type: t.type,
      }));

      const inserted = await createManyTransactions(toInsert);
      res.status(201).json({
        message: 'Upload successful',
        total: parsed.length,
        inserted,
      });
    } catch (err) {
      next(err);
    }
  }
);
