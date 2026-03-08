/**
 * PostgreSQL database connection configuration
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool, PoolClient } from "pg";

/**
 * Read database URL from environment
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Decide whether SSL should be used
 */
function shouldUseSsl(cs: string): boolean {
  try {
    const url = new URL(cs);
    const hostname = url.hostname?.toLowerCase();
    const sslmode = url.searchParams.get("sslmode")?.toLowerCase();

    if (sslmode === "disable") return false;
    if (sslmode === "require") return true;

    // Default to SSL for hosted DBs like Supabase
    return hostname !== "localhost" && hostname !== "127.0.0.1";
  } catch {
    // fallback for Supabase URLs
    return cs.includes("supabase.co");
  }
}

/**
 * Create connection pool
 */
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
/**
 * Execute a query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows;
}

/**
 * Get client for transactions
 */
export function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Test database connection
 */
export async function connectDB(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

export default pool;
export { pool };