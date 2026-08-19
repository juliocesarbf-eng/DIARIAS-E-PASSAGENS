import { pgTable, text, doublePrecision, integer, serial } from 'drizzle-orm/pg-core';

export const travelRequests = pgTable('travel_requests', {
  id: text('id').primaryKey(),
  portaria: text('portaria').notNull(),
  sei: text('sei').notNull(),
  formulario: text('formulario').notNull(),
  
  // Dados do Passageiro
  nome: text('nome').notNull(),
  cargo: text('cargo').notNull(),
  lotacao: text('lotacao').notNull(),
  ferias: text('ferias').$type<'Sim' | 'Não'>().notNull().default('Não'),

  // Detalhes do Evento
  evento: text('evento').notNull(),
  tipoEvento: text('tipo_evento').$type<any>().notNull(),

  // Itinerário
  origemDestinoIda: text('origem_destino_ida').notNull(),
  dataIda: text('data_ida').notNull(),
  destinoRetornoVolta: text('destino_retorno_volta').notNull(),
  dataVolta: text('data_volta').notNull(),

  // Financeiro e Diárias
  cota: text('cota').notNull(),
  internacionais: text('internacionais').$type<'Sim' | 'Não'>().notNull().default('Não'),
  qtdeDiarias: doublePrecision('qtde_diarias').notNull().default(0),
  valorRs: doublePrecision('valor_rs').notNull().default(0),

  // Observações Adicionais
  observacaoJustificativa: text('observacao_justificativa').notNull(),
  observacaoApoioLogistico: text('observacao_apoio_logistico').notNull(),

  // Metadados do Sistema
  status: text('status').$type<'Rascunho' | 'Pendente' | 'Aprovado' | 'Rejeitado'>().notNull().default('Pendente'),
  dataCriacao: text('data_criacao').notNull(),
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull().default(''),
  cargo: text('cargo').notNull().default(''),
  lotacao: text('lotacao').notNull().default(''),
  feriasPadrao: text('ferias_padrao').$type<'Sim' | 'Não'>().notNull().default('Não'),
  seiPadrao: text('sei_padrao').notNull().default(''),
  cotaPadrao: text('cota_padrao').notNull().default(''),
});
