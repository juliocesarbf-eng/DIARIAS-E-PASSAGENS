CREATE TABLE "travel_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"portaria" text NOT NULL,
	"sei" text NOT NULL,
	"formulario" text NOT NULL,
	"nome" text NOT NULL,
	"cargo" text NOT NULL,
	"lotacao" text NOT NULL,
	"ferias" text DEFAULT 'Não' NOT NULL,
	"evento" text NOT NULL,
	"tipo_evento" text NOT NULL,
	"origem_destino_ida" text NOT NULL,
	"data_ida" text NOT NULL,
	"destino_retorno_volta" text NOT NULL,
	"data_volta" text NOT NULL,
	"cota" text NOT NULL,
	"internacionais" text DEFAULT 'Não' NOT NULL,
	"qtde_diarias" double precision DEFAULT 0 NOT NULL,
	"valor_rs" double precision DEFAULT 0 NOT NULL,
	"observacao_justificativa" text NOT NULL,
	"observacao_apoio_logistico" text NOT NULL,
	"status" text DEFAULT 'Pendente' NOT NULL,
	"data_criacao" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text DEFAULT '' NOT NULL,
	"cargo" text DEFAULT '' NOT NULL,
	"lotacao" text DEFAULT '' NOT NULL,
	"ferias_padrao" text DEFAULT 'Não' NOT NULL,
	"sei_padrao" text DEFAULT '' NOT NULL,
	"cota_padrao" text DEFAULT '' NOT NULL
);
