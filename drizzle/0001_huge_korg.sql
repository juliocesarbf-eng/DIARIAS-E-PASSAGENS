CREATE TABLE "DIARIAS E PASSAGENS" (
	"id" text PRIMARY KEY NOT NULL,
	"portaria" text DEFAULT '' NOT NULL,
	"sei" text DEFAULT '' NOT NULL,
	"formulario" text DEFAULT '' NOT NULL,
	"nome" text DEFAULT '' NOT NULL,
	"cargo" text DEFAULT '' NOT NULL,
	"lotacao" text DEFAULT '' NOT NULL,
	"ferias" text DEFAULT 'Não' NOT NULL,
	"evento" text DEFAULT '' NOT NULL,
	"tipo_evento" text DEFAULT 'Outros' NOT NULL,
	"origem_destino_ida" text DEFAULT '' NOT NULL,
	"data_ida" text DEFAULT '' NOT NULL,
	"destino_retorno_volta" text DEFAULT '' NOT NULL,
	"data_volta" text DEFAULT '' NOT NULL,
	"cota" text DEFAULT '' NOT NULL,
	"internacionais" text DEFAULT 'Não' NOT NULL,
	"qtde_diarias" double precision DEFAULT 0 NOT NULL,
	"valor_rs" double precision DEFAULT 0 NOT NULL,
	"observacao_justificativa" text DEFAULT '' NOT NULL,
	"observacao_apoio_logistico" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Pendente' NOT NULL,
	"data_criacao" text DEFAULT '' NOT NULL,
	"created_at" text
);
--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "portaria" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "sei" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "formulario" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "nome" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "cargo" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "lotacao" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "evento" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "tipo_evento" SET DEFAULT 'Outros';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "origem_destino_ida" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "data_ida" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "destino_retorno_volta" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "data_volta" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "cota" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "observacao_justificativa" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "observacao_apoio_logistico" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "travel_requests" ALTER COLUMN "data_criacao" SET DEFAULT '';