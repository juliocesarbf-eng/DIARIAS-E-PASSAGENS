import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pkg;

// Create connection pool from DATABASE_URL (Supabase) or standard SQL_* parameters
export const isDbAvailable = !!(
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.trim() !== "" &&
  !process.env.DATABASE_URL.includes("postgres.xxxxx") &&
  !process.env.DATABASE_URL.includes("YOUR_")
);

let dbHealthy = true;

export const isDbHealthy = () => {
  return isDbAvailable && dbHealthy;
};

export const setDbUnhealthy = () => {
  dbHealthy = false;
};

export const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    console.log('Database: Using connection string (from DATABASE_URL)');
    return new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }, // Crucial for cloud databases like Supabase
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
