import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pkg;

// Helper to determine active database connection string for Supabase or standard PostgreSQL
export const getConnectionString = (): string | null => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (url && url.trim() !== "") {
    const trimmed = url.trim();
    if (
      (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) &&
      !trimmed.includes("postgres.xxxxx") &&
      !trimmed.includes("YOUR_")
    ) {
      return trimmed;
    }
  }
  return null;
};

// Create connection pool from DATABASE_URL (Supabase) or standard SQL_* parameters
export const isDbAvailable = !!(
  getConnectionString() ||
  (process.env.SQL_HOST && process.env.SQL_PASSWORD)
);

let dbHealthy = true;

export const isDbHealthy = () => {
  return isDbAvailable && dbHealthy;
};

export const setDbUnhealthy = () => {
  dbHealthy = false;
};

export const createPool = () => {
  const connectionString = getConnectionString();
  
  if (connectionString) {
    console.log('Database: Initializing Drizzle connection pool with Supabase/PostgreSQL URL');
    return new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }, // Essential for Supabase cloud PostgreSQL
      connectionTimeoutMillis: 15000,
    });
  }

  console.log('Database: Using specific credentials (from SQL_* variables)');
  return new Pool({
    host: process.env.SQL_HOST || 'localhost',
    user: process.env.SQL_USER || 'postgres',
    password: process.env.SQL_PASSWORD || '',
    database: process.env.SQL_DB_NAME || 'postgres',
    port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
    connectionTimeoutMillis: 15000,
  });
};

export const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });

