/**
 * Authentication routes - Login & Signup
 */

import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { createUser, findByEmail } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';

export const authRouter = Router();

const JWT_EXPIRES = '7d';

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

/**
 * POST /api/auth/signup - Register new user
 */
authRouter.post('/signup', signupValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, errors.array()[0].msg);
    }

    const { email, password, fullName } = req.body;
    const existing = await findByEmail(email);
    if (existing) {
      throw new AppError(400, 'Email already registered');
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await createUser({ email, password_hash, full_name: fullName });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login - Authenticate user
 */
authRouter.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(400, errors.array()[0].msg);
    }

    const { email, password } = req.body;
    const user = await findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name },
    });
  } catch (err) {
    next(err);
  }
});
