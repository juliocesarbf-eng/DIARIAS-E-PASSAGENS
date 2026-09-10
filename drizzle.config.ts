import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Supabase or standard PostgreSQL Connection URL
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL;

// Fallbacks for specific environment parameters
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

const dbCredentials = databaseUrl 
  ? { url: databaseUrl }
  : {
      host: sqlHost || 'localhost',
      port: 5432,
      user: user || 'postgres',
      password: password || '',
      database: sqlDbName || 'postgres',
      ssl: false,
    };

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials,
  verbose: true,
});
