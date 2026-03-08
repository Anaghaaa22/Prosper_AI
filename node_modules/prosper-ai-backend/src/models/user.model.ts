/**
 * User model - database operations for users
 */

import { query } from '../config/database';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreate {
  email: string;
  password_hash: string;
  full_name: string;
}

export async function createUser(data: UserCreate): Promise<User> {
  const rows = await query<User>(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, created_at, updated_at`,
    [data.email, data.password_hash, data.full_name]
  );
  return rows[0];
}

export async function findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const rows = await query<User & { password_hash: string }>(
    'SELECT id, email, full_name, password_hash, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

export async function findById(id: string): Promise<User | null> {
  const rows = await query<User>(
    'SELECT id, email, full_name, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}
