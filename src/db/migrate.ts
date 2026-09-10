import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool, getConnectionString } from './index.ts';

async function run() {
  const connStr = getConnectionString();
  if (!connStr) {
    console.error("❌ ERRO: Nenhuma connection string (DATABASE_URL) encontrada no ambiente.");
    console.error("Para sincronizar com o Supabase, adicione no arquivo .env a variável DATABASE_URL com a string de conexão PostgreSQL do seu projeto Supabase:");
    console.error('DATABASE_URL="postgresql://postgres.[seu-projeto]:[sua-senha]@aws-0-[regiao].pooler.supabase.com:6543/postgres?sslmode=require"');
    process.exit(1);
  }

  console.log("🚀 Iniciando migração e sincronização do Drizzle com o Supabase...");
  
  const client = await pool.connect();
  try {
    console.log("1. Garantindo estrutura completa e colunas da tabela 'DIARIAS E PASSAGENS'...");
    
    // Create or update table "DIARIAS E PASSAGENS"
    await client.query(`
      CREATE TABLE IF NOT EXISTS "DIARIAS E PASSAGENS" (
        id TEXT PRIMARY KEY,
        portaria TEXT NOT NULL DEFAULT '',
        sei TEXT NOT NULL DEFAULT '',
        formulario TEXT NOT NULL DEFAULT '',
        nome TEXT NOT NULL DEFAULT '',
        cargo TEXT NOT NULL DEFAULT '',
        lotacao TEXT NOT NULL DEFAULT '',
        ferias TEXT NOT NULL DEFAULT 'Não',
        evento TEXT NOT NULL DEFAULT '',
        tipo_evento TEXT NOT NULL DEFAULT 'Outros',
        origem_destino_ida TEXT NOT NULL DEFAULT '',
        data_ida TEXT NOT NULL DEFAULT '',
        destino_retorno_volta TEXT NOT NULL DEFAULT '',
        data_volta TEXT NOT NULL DEFAULT '',
        cota TEXT NOT NULL DEFAULT '',
        internacionais TEXT NOT NULL DEFAULT 'Não',
        qtde_diarias DOUBLE PRECISION NOT NULL DEFAULT 0,
        valor_rs DOUBLE PRECISION NOT NULL DEFAULT 0,
        observacao_justificativa TEXT NOT NULL DEFAULT '',
        observacao_apoio_logistico TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'Pendente',
        data_criacao TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // In case the table already existed with only 2 columns in Supabase (e.g. id and created_at)
    console.log("2. Adicionando todas as colunas necessárias caso a tabela já exista...");
    await client.query(`
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE "DIARIAS E PASSAGENS" ALTER COLUMN id TYPE TEXT;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
      END $$;

      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS portaria TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS sei TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS formulario TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS cargo TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS lotacao TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS ferias TEXT NOT NULL DEFAULT 'Não';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS evento TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS tipo_evento TEXT NOT NULL DEFAULT 'Outros';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS origem_destino_ida TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS data_ida TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS destino_retorno_volta TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS data_volta TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS cota TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS internacionais TEXT NOT NULL DEFAULT 'Não';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS qtde_diarias DOUBLE PRECISION NOT NULL DEFAULT 0;
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS valor_rs DOUBLE PRECISION NOT NULL DEFAULT 0;
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS observacao_justificativa TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS observacao_apoio_logistico TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Pendente';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS data_criacao TEXT NOT NULL DEFAULT '';
      ALTER TABLE "DIARIAS E PASSAGENS" ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    `);

    // Ensure user_profiles table also exists
    console.log("3. Garantindo tabela de perfis de usuário...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL DEFAULT '',
        cargo TEXT NOT NULL DEFAULT '',
        lotacao TEXT NOT NULL DEFAULT '',
        ferias_padrao TEXT NOT NULL DEFAULT 'Não',
        sei_padrao TEXT NOT NULL DEFAULT '',
        cota_padrao TEXT NOT NULL DEFAULT ''
      );
    `);

    console.log("✅ Migração Drizzle executada com sucesso! O banco de dados do Supabase agora possui todas as colunas.");
  } catch (err: any) {
    console.error("Erro durante a migração:", err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
