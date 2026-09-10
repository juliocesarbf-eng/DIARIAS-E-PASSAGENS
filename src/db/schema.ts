import { pgTable, text, doublePrecision, serial, timestamp } from 'drizzle-orm/pg-core';

// Main Supabase table for STM Diárias e Passagens
export const diariasEPassagens = pgTable('DIARIAS E PASSAGENS', {
  id: text('id').primaryKey(),
  portaria: text('portaria').notNull().default(''),
  sei: text('sei').notNull().default(''),
  formulario: text('formulario').notNull().default(''),
  
  // Dados do Passageiro
  nome: text('nome').notNull().default(''),
  cargo: text('cargo').notNull().default(''),
  lotacao: text('lotacao').notNull().default(''),
  ferias: text('ferias').$type<'Sim' | 'Não'>().notNull().default('Não'),

  // Detalhes do Evento
  evento: text('evento').notNull().default(''),
  tipoEvento: text('tipo_evento').$type<any>().notNull().default('Outros'),

  // Itinerário
  origemDestinoIda: text('origem_destino_ida').notNull().default(''),
  dataIda: text('data_ida').notNull().default(''),
  destinoRetornoVolta: text('destino_retorno_volta').notNull().default(''),
  dataVolta: text('data_volta').notNull().default(''),

  // Financeiro e Diárias
  cota: text('cota').notNull().default(''),
  internacionais: text('internacionais').$type<'Sim' | 'Não'>().notNull().default('Não'),
  qtdeDiarias: doublePrecision('qtde_diarias').notNull().default(0),
  valorRs: doublePrecision('valor_rs').notNull().default(0),

  // Observações Adicionais
  observacaoJustificativa: text('observacao_justificativa').notNull().default(''),
  observacaoApoioLogistico: text('observacao_apoio_logistico').notNull().default(''),

  // Metadados do Sistema
  status: text('status').$type<'Rascunho' | 'Pendente' | 'Aprovado' | 'Rejeitado'>().notNull().default('Pendente'),
  dataCriacao: text('data_criacao').notNull().default(''),
  createdAt: text('created_at'),
});

// Standard snake_case compatibility table
export const travelRequests = pgTable('travel_requests', {
  id: text('id').primaryKey(),
  portaria: text('portaria').notNull().default(''),
  sei: text('sei').notNull().default(''),
  formulario: text('formulario').notNull().default(''),
  nome: text('nome').notNull().default(''),
  cargo: text('cargo').notNull().default(''),
  lotacao: text('lotacao').notNull().default(''),
  ferias: text('ferias').$type<'Sim' | 'Não'>().notNull().default('Não'),
  evento: text('evento').notNull().default(''),
  tipoEvento: text('tipo_evento').$type<any>().notNull().default('Outros'),
  origemDestinoIda: text('origem_destino_ida').notNull().default(''),
  dataIda: text('data_ida').notNull().default(''),
  destinoRetornoVolta: text('destino_retorno_volta').notNull().default(''),
  dataVolta: text('data_volta').notNull().default(''),
  cota: text('cota').notNull().default(''),
  internacionais: text('internacionais').$type<'Sim' | 'Não'>().notNull().default('Não'),
  qtdeDiarias: doublePrecision('qtde_diarias').notNull().default(0),
  valorRs: doublePrecision('valor_rs').notNull().default(0),
  observacaoJustificativa: text('observacao_justificativa').notNull().default(''),
  observacaoApoioLogistico: text('observacao_apoio_logistico').notNull().default(''),
  status: text('status').$type<'Rascunho' | 'Pendente' | 'Aprovado' | 'Rejeitado'>().notNull().default('Pendente'),
  dataCriacao: text('data_criacao').notNull().default(''),
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


