import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { db, isDbAvailable, isDbHealthy, setDbUnhealthy, pool } from "./src/db/index.ts";
import { diariasEPassagens, travelRequests, userProfiles } from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";

// Ensure fallback JSON persistence directory and default files exist
const FALLBACK_DIR = path.join(process.cwd(), "data");
const REQUESTS_FILE = path.join(FALLBACK_DIR, "requests.json");
const PROFILE_FILE = path.join(FALLBACK_DIR, "profile.json");

if (!fs.existsSync(FALLBACK_DIR)) {
  fs.mkdirSync(FALLBACK_DIR, { recursive: true });
}

function readFallbackRequests(): any[] {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      return JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading fallback requests file:", e);
  }
  return [];
}

function writeFallbackRequests(data: any[]) {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing fallback requests file:", e);
  }
}

function readFallbackProfile(): any | null {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILE_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading fallback profile file:", e);
  }
  return null;
}

function writeFallbackProfile(data: any) {
  try {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing fallback profile file:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Probe database connection on boot if config/database is available
  if (isDbAvailable) {
    console.log("Database: Probing connection to PostgreSQL...");
    try {
      const probePromise = pool.query("SELECT 1");
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
      await Promise.race([probePromise, timeoutPromise]);
      console.log("Database: Connection probe succeeded. PostgreSQL database is fully online!");
      
      // Auto-initialize required tables in the cloud database (Supabase) if they do not exist definitions
      console.log("Database: Securing table presence for 'DIARIAS E PASSAGENS' and user_profiles...");
      
      // 1. Create table "DIARIAS E PASSAGENS" if it does not exist
      await pool.query(`
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

      // 2. Add any missing columns to "DIARIAS E PASSAGENS" if the user created it with only 2 columns
      await pool.query(`
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

      // 3. Keep travel_requests compatibility table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS travel_requests (
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
          data_criacao TEXT NOT NULL DEFAULT ''
        );
      `);
      
      await pool.query(`
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
      console.log("Database: All table columns and presence secured successfully in Supabase!");
    } catch (err: any) {
      console.log(`Database Status: Offline (${err.message || err}). Enabling automatic local JSON fallback mode.`);
      setDbUnhealthy();
    }
  } else {
    console.log("Database Status: No connection credentials found. Running in local JSON storage mode.");
  }

  // Body parser
  app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: process.env.DATABASE_URL ? "configured" : "fallback" });
  });

  // Get official Central Bank USD exchange rate (PTAX)
  app.get("/api/cotacao-dolar", async (req, res) => {
    try {
      const today = new Date();
      // Backtrack 12 days to always find at least one business day cotacao, even during long holidays
      const startDate = new Date();
      startDate.setDate(today.getDate() - 12);

      const pad = (n: number) => String(n).padStart(2, "0");
      const formatDate = (d: Date) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${d.getFullYear()}`;

      const dataInicial = formatDate(startDate);
      const dataFinal = formatDate(today);

      const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${dataInicial}'&@dataFinalCotacao='${dataFinal}'&$top=100&$format=json`;

      console.log(`API: Fetching exchange rate from BCB: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`BCB HTTP Status ${response.status}`);
      }
      
      const data: any = await response.json();
      if (data && Array.isArray(data.value) && data.value.length > 0) {
        // Filter elements containing cotacaoCompra
        const quotes = data.value.filter((q: any) => typeof q.cotacaoCompra === "number");
        
        if (quotes.length > 0) {
          // Sort items chronologically by dataHoraCotacao
          quotes.sort((a: any, b: any) => {
            return new Date(a.dataHoraCotacao).getTime() - new Date(b.dataHoraCotacao).getTime();
          });
          
          const latest = quotes[quotes.length - 1];
          console.log(`API: Successfully retrieved purchase rate of ${latest.cotacaoCompra} from BCB dated ${latest.dataHoraCotacao}`);
          
          return res.json({
            compra: latest.cotacaoCompra,
            venda: latest.cotacaoVenda,
            dataHora: latest.dataHoraCotacao,
            source: "BCB"
          });
        }
      }
      
      throw new Error("No quotes returned from Banco Central API");
    } catch (error: any) {
      console.warn("API Note - Failed to fetch exchange rate from BCB, using fallback:", error.message || error);
      // Fallback rate of 5.45 (realistic fallback)
      res.json({
        compra: 5.45,
        venda: 5.46,
        dataHora: new Date().toISOString(),
        source: "fallback"
      });
    }
  });

  // Get all travel requests
  app.get("/api/requests", async (req, res) => {
    if (!isDbHealthy()) {
      return res.json(readFallbackRequests());
    }
    try {
      console.log("API: Fetching travel requests from PostgreSQL ('DIARIAS E PASSAGENS')...");
      const result = await db.select().from(diariasEPassagens).orderBy(desc(diariasEPassagens.dataCriacao));
      res.json(result);
    } catch (error: any) {
      console.log("API Note - Failed to fetch from DIARIAS E PASSAGENS, trying travel_requests:", error.message || error);
      try {
        const result = await db.select().from(travelRequests).orderBy(desc(travelRequests.dataCriacao));
        return res.json(result);
      } catch (e2) {
        setDbUnhealthy();
        res.json(readFallbackRequests());
      }
    }
  });

  // Create or Update a travel request (Upsert)
  app.post("/api/requests", async (req, res) => {
    const data = req.body;
    if (!data.id) {
      return res.status(400).json({ error: "id is required" });
    }

    const payload = {
      id: data.id,
      portaria: data.portaria || "",
      sei: data.sei || "",
      formulario: data.formulario || "",
      nome: data.nome || "",
      cargo: data.cargo || "",
      lotacao: data.lotacao || "",
      ferias: data.ferias || "Não",
      evento: data.evento || "",
      tipoEvento: data.tipoEvento || "Outros",
      origemDestinoIda: data.origemDestinoIda || "",
      dataIda: data.dataIda || "",
      destinoRetornoVolta: data.destinoRetornoVolta || "",
      dataVolta: data.dataVolta || "",
      cota: data.cota || "",
      internacionais: data.internacionais || "Não",
      qtdeDiarias: Number(data.qtdeDiarias || 0),
      valorRs: Number(data.valorRs || 0),
      observacaoJustificativa: data.observacaoJustificativa || "",
      observacaoApoioLogistico: data.observacaoApoioLogistico || "",
      status: data.status || "Pendente",
      dataCriacao: data.dataCriacao || new Date().toISOString(),
    };

    // Save to local JSON fallback immediately
    const localList = readFallbackRequests().filter(r => r.id !== data.id);
    writeFallbackRequests([payload, ...localList]);

    if (!isDbHealthy()) {
      return res.status(201).json(payload);
    }

    try {
      console.log(`API: Saving travel request with ID ${data.id} to PostgreSQL ('DIARIAS E PASSAGENS')...`);
      const result = await db
        .insert(diariasEPassagens)
        .values(payload)
        .onConflictDoUpdate({
          target: diariasEPassagens.id,
          set: payload,
        })
        .returning();

      res.status(201).json(result[0]);
    } catch (error: any) {
      console.log("API Note - Failed to save to DIARIAS E PASSAGENS, attempting fallback to travel_requests:", error.message || error);
      try {
        const result = await db
          .insert(travelRequests)
          .values(payload)
          .onConflictDoUpdate({
            target: travelRequests.id,
            set: payload,
          })
          .returning();
        return res.status(201).json(result[0]);
      } catch (e2) {
        setDbUnhealthy();
        res.status(201).json(payload);
      }
    }
  });

  // Delete a travel request
  app.delete("/api/requests/:id", async (req, res) => {
    const { id } = req.params;
    let fallbackResult: any = null;

    // Delete from local fallback immediately
    const localList = readFallbackRequests();
    const existingIndex = localList.findIndex(r => r.id === id);
    if (existingIndex !== -1) {
      fallbackResult = localList[existingIndex];
      writeFallbackRequests(localList.filter(r => r.id !== id));
    }

    if (!isDbHealthy()) {
      if (!fallbackResult) {
        return res.status(404).json({ error: "Request not found (local)" });
      }
      return res.json({ message: "Successfully deleted (local only)", deleted: fallbackResult });
    }

    try {
      console.log(`API: Deleting travel request ${id} from PostgreSQL ('DIARIAS E PASSAGENS')...`);
      const result = await db
        .delete(diariasEPassagens)
        .where(eq(diariasEPassagens.id, id))
        .returning();

      if (result.length === 0 && !fallbackResult) {
        return res.status(404).json({ error: "Request not found" });
      }

      res.json({ message: "Successfully deleted", deleted: result[0] || fallbackResult });
    } catch (error: any) {
      console.log("API Note - Failed to delete request from PostgreSQL, marking db unhealthy:", error.message || error);
      setDbUnhealthy();
      if (!fallbackResult) {
        return res.status(404).json({ error: "Request not found in local fallback database" });
      }
      res.json({ message: "Successfully deleted (fallback)", deleted: fallbackResult });
    }
  });

  // Get user profile
  app.get("/api/profile", async (req, res) => {
    if (!isDbHealthy()) {
      return res.json(readFallbackProfile());
    }
    try {
      console.log("API: Fetching user profile from PostgreSQL...");
      const result = await db.select().from(userProfiles).limit(1);
      if (result.length === 0) {
        const localProf = readFallbackProfile();
        return res.json(localProf);
      }
      res.json(result[0]);
    } catch (error: any) {
      console.log("API Note - Failed to fetch profile from PostgreSQL, marking db unhealthy:", error.message || error);
      setDbUnhealthy();
      res.json(readFallbackProfile());
    }
  });

  // Save/Update user profile
  app.post("/api/profile", async (req, res) => {
    const data = req.body;
    console.log("API: Saving user profile...", data);
    
    // Since it's a single user app, we can either update or insert a record with id = 1
    const payload = {
      id: 1,
      nome: data.nome || "",
      cargo: data.cargo || "",
      lotacao: data.lotacao || "",
      feriasPadrao: data.feriasPadrao || "Não",
      seiPadrao: data.seiPadrao || "",
      cotaPadrao: data.cotaPadrao || "",
    };

    // Save to local fallback immediately
    writeFallbackProfile(payload);

    if (!isDbHealthy()) {
      return res.json(payload);
    }

    try {
      console.log("API: Saving user profile to PostgreSQL...");
      const result = await db
        .insert(userProfiles)
        .values(payload)
        .onConflictDoUpdate({
          target: userProfiles.id,
          set: payload,
        })
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      console.log("API Note - Failed to save profile to PostgreSQL, marking db unhealthy:", error.message || error);
      setDbUnhealthy();
      res.json(payload);
    }
  });

  // Dev vs. Production static serving & Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Server: Mounting Vite Developer Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Server: Serving compiled dist/ static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully booted and listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical failure during server startup:", error);
});
