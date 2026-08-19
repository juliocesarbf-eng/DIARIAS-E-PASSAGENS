export interface TravelRequest {
  id: string;
  // Identificação do Processo
  portaria: string;
  sei: string;
  formulario: string;
  
  // Dados do Passageiro
  nome: string;
  cargo: string;
  lotacao: string;
  ferias: 'Sim' | 'Não';

  // Detalhes do Evento
  evento: string;
  tipoEvento:
    | 'ASSESSORAR MINISTRO/MAGISTRADO'
    | 'COMPLEMENTAR DIARIAS'
    | 'CONDUZIR MINISTRO/MAGISTRADO/SERVIDOR'
    | 'CUMPRIR MANDADO DE CITACAO'
    | 'DESISTENCIA/CANCELAMENTO DO EVENTO'
    | 'DESLOCAMENTO EM RAZAO DE NOMEACAO'
    | 'MINISTRAR CURSO OU PALESTRA'
    | 'PARTICIPAR DE EVENTO DE CAPACITACAO'
    | 'PARTICIPAR DE EVENTO DE CAPACITACAO - INSTITUCIONAL'
    | 'PARTICIPAR DE SOLENIDADE'
    | 'PARTICIPAR/CONDUZIR REUNIAO'
    | 'REALIZAR/PARTICIPAR DE AUDITORIA'
    | 'REALIZAR/PARTICIPAR DE CORREICAO'
    | 'REALIZAR/PARTICIPAR DE INSPECAO CARCERARIA'
    | 'REALIZAR/PARTICIPAR DE PERICIA MEDICA'
    | 'REALIZAR/PARTICIPAR DE VISITA INSTITUCIONAL'
    | 'REALIZAR/PARTICIPAR DE VISITA TECNICA'
    | 'Reunião Técnica'
    | 'Congresso'
    | 'Capacitação'
    | 'Inspeção'
    | 'Outros';

  // Itinerário
  origemDestinoIda: string;
  dataIda: string;
  destinoRetornoVolta: string;
  dataVolta: string;

  // Financeiro e Diárias
  cota: string;
  internacionais: 'Sim' | 'Não';
  qtdeDiarias: number;
  valorRs: number;

  // Observações Adicionais
  observacaoJustificativa: string;
  observacaoApoioLogistico: string;

  // Metadados do Sistema
  status: 'Rascunho' | 'Pendente' | 'Aprovado' | 'Rejeitado';
  dataCriacao: string;
}

export interface UserProfile {
  nome: string;
  cargo: string;
  lotacao: string;
  feriasPadrao: 'Sim' | 'Não';
  seiPadrao: string;
  cotaPadrao: string;
}

export interface DashboardStats {
  totalSolicitacoes: number;
  aprovadas: number;
  pendentes: number;
  rascunhos: number;
  investimentoTotal: number;
  diariasTotais: number;
}

export const LOTACAO_OPTIONS = [
  "1a AUD 11a CJM",
  "1a AUD 1a CJM",
  "1a AUD 2a CJM",
  "1a AUD 3a CJM",
  "2a AUD 11a CJM",
  "2a AUD 1a CJM",
  "2a AUD 2a CJM",
  "2a AUD 3a CJM",
  "3a AUD 1a CJM",
  "3a AUD 3a CJM",
  "4a AUD 1a CJM",
  "ACONT - ASSESSORIA DE CONTABILIDADE",
  "ASAAM - ASSESSORIA DE ASSUNTOS ADMINISTRATIVOS E MILITARES",
  "ASCEM - ASSESSORIA DE CERIMONIAL E MEDALHISTICA",
  "ASCOI - ASSESSORIA DE CONTROLE INTERNO",
  "ASCOM - ASSESSORIA DE COMUNICACAO SOCIAL",
  "ASJUR - ASSESSORIA JURIDICA DO DIRETOR-GERAL",
  "ASLIC - ASSESSORIA DE LICITACOES E CONTRATOS",
  "ASPAR - ASSESSORIA DE ASSUNTOS PARLAMENTARES",
  "ASPRE(ADM) - ASSESSORIA JURIDICO-ADMINISTRATIVA DO PRESIDENTE",
  "ASPRE(JUR) - ASSESSORIA JURIDICA DO PRESIDENTE",
  "ASSEG - ASSESSORIA DE SEGURANCA INSTITUCIONAL",
  "ASSESSORIA ESPECIAL DA VICE-PRESIDENCIA",
  "AUDITORIA DA 10a CJM",
  "AUDITORIA DA 12a CJM",
  "AUDITORIA DA 4a CJM",
  "AUDITORIA DA 5a CJM",
  "AUDITORIA DA 6a CJM",
  "AUDITORIA DA 7a CJM",
  "AUDITORIA DA 8a CJM",
  "AUDITORIA DA 9a CJM",
  "COMPREV",
  "DIDOC - DIRETORIA DE DOCUMENTACAO E GESTAO DO CONHECIMENTO",
  "DILEO - DIRETORIA DE LICITACOES E EXECUCAO ORCAMENTARIA",
  "DIPES - DIRETORIA DE PESSOAL",
  "DIRAD - DIRETORIA DE ADMINISTRACAO",
  "DISAU - DIRETORIA DE SERVICOS DE SAUDE",
  "DITIN - DIRETORIA DE TECNOLOGIA DA INFORMACAO",
  "DORFI - DIRETORIA DE ORCAMENTO E FINANCAS",
  "ENAJUM - ESCOLA NACIONAL DE FORMACAO E APERFEICOAMENTO DE MAGISTRADOS DA JUSTICA MILITAR",
  "GAB MIN ANISIO DAVID DE OLIVEIRA JUNIOR",
  "GAB MIN ARTUR VIDIGAL DE OLIVEIRA",
  "GAB MIN CARLOS AUGUSTO AMARAL OLIVEIRA",
  "GAB MIN CARLOS VUYK DE AQUINO",
  "GAB MIN CELSO LUIZ NAZARETH",
  "GAB MIN CLAUDIO PORTUGAL DE VIVEIROS",
  "GAB MIN FLAVIO MARCUS LANCIA BARBOSA",
  "GAB MIN FRANCISCO JOSELI PARENTE CAMELO",
  "GAB MIN GUIDO AMIN NAVES",
  "GAB MIN JOSE BARROSO FILHO",
  "GAB MIN JOSE COELHO FERREIRA",
  "GAB MIN LEONARDO PUNTEL",
  "GAB MIN LOURIVAL CARVALHO SILVA",
  "GAB MIN LUCIO MARIO DE BARROS GOES",
  "GAB MIN MARCO ANTONIO DE FARIAS",
  "GAB MIN MARIA ELIZABETH GUIMARAES TEIXEIRA ROCHA",
  "GAB MIN ODILSON SAMPAIO BENZI",
  "GAB MIN PERICLES AURELIO LIMA DE QUEIROZ",
  "GAB MIN SAFIRA MARIA DE FIGUEREDO",
  "GAB MIN VERONICA ABDALLA STERMAN",
  "GABINETE DA PRESIDENCIA",
  "GABINETE DO MINISTRO-CORREGEDOR",
  "GADIR - GABINETE DO DIRETOR-GERAL",
  "NA DIRETOR FORO 11a CJM",
  "NA DIRETOR FORO 1a CJM",
  "NA DIRETOR FORO 2a CJM",
  "OUVIDORIA",
  "PRESIDENCIA DO STM",
  "SEAUD - SECRETARIA DE AUDITORIA INTERNA",
  "SECSTM - SECRETARIA DO SUPERIOR TRIBUNAL MILITAR",
  "SEJUD - SECRETARIA JUDICIARIA",
  "SEPLE - SECRETARIA DO TRIBUNAL PLENO",
  "SEPRE - SECRETARIA-GERAL DA PRESIDENCIA",
  "SGEST - SECRETARIA DE GESTAO ESTRATEGICA E INOVACAO",
  "VICE-PRESIDENCIA DO STM"
];

export const COTA_OPTIONS = [
  "1a AUD 11a CJM",
  "1a AUD 1a CJM",
  "1a AUD 2a CJM",
  "1a AUD 3a CJM",
  "1AUD1 (Insp. Carcer.)",
  "1AUD1 (Ofic. de Just.)",
  "1AUD11 (Insp. Carcer.)",
  "1AUD11 (Ofic. de Just.)",
  "1AUD2 (Insp. Carcer.)",
  "1AUD2 (Ofic. de Just.)",
  "1AUD3 (Insp. Carcer.)",
  "1AUD3 (Ofic. de Just.)",
  "2a AUD 11a CJM",
  "2a AUD 1a CJM",
  "2a AUD 2a CJM",
  "2a AUD 3a CJM",
  "2AUD1 (Insp. Carcer.)",
  "2AUD1 (Ofic. de Just.)",
  "2AUD11 (Insp. Carcer.)",
  "2AUD11 (Ofic. de Just.)",
  "2AUD2 (Insp. Carcer.)",
  "2AUD2 (Ofic. de Just.)",
  "2AUD3 (Insp. Carcer.)",
  "2AUD3 (Ofic. de Just.)",
  "3a AUD 1a CJM",
  "3a AUD 3a CJM",
  "3AUD1 (Insp. Carcer.)",
  "3AUD1 (Ofic. de Just.)",
  "3AUD3 (Insp. Carcer.)",
  "3AUD3 (Ofic. de Just.)",
  "4a AUD 1a CJM",
  "4AUD1 (Insp. Carcer.)",
  "4AUD1 (Ofic. de Just.)",
  "ACONT",
  "ASAAM",
  "ASCEM",
  "ASCOI",
  "ASCOM",
  "ASJUR",
  "ASLIC",
  "ASPAR",
  "ASPRE - ADM",
  "ASPRE - JUR",
  "ASSEG",
  "AUD10 (Insp. Carcer.)",
  "AUD10 (Ofic. de Just.)",
  "AUD12 (Insp. Carcer.)",
  "AUD12 (Ofic. de Just.)",
  "AUD4 (Insp. Carcer.)",
  "AUD4 (Ofic. de Just.)",
  "AUD5 (Insp. Carcer.)",
  "AUD5 (Ofic. de Just.)",
  "AUD6 (Insp. Carcer.)",
  "AUD6 (Ofic. de Just.)",
  "AUD7 (Insp. Carcer.)",
  "AUD7 (Ofic. de Just.)",
  "AUD8 (Insp. Carcer.)",
  "AUD8 (Ofic. de Just.)",
  "AUD9 (Insp. Carcer.)",
  "AUD9 (Ofic. de Just.)",
  "AUDITORIA DA 10a CJM",
  "AUDITORIA DA 12a CJM",
  "AUDITORIA DA 4a CJM",
  "AUDITORIA DA 5a CJM",
  "AUDITORIA DA 6a CJM",
  "AUDITORIA DA 7a CJM",
  "AUDITORIA DA 8a CJM",
  "AUDITORIA DA 9a CJM",
  "COMISSAO DE ACESSIBILIDADE",
  "COMPREV",
  "CONCURSO PUBLICO",
  "CORREGEDORIA",
  "DIDOC",
  "DILEO",
  "DIPES",
  "DIRAD",
  "DISAU",
  "DITIN",
  "DORFI",
  "DPADI",
  "ENAJUM",
  "ENCONTRO DE SUPERVISORES E DIRETORES",
  "EVENTOS INSTITUCIONAIS",
  "FORO 11a CJM",
  "FORO 1a CJM",
  "FORO 2a CJM",
  "GAB. MIN. AMARAL",
  "GAB. MIN. AMIN",
  "GAB. MIN. AQUINO",
  "GAB. MIN. BARROSO",
  "GAB. MIN. BENZI",
  "GAB. MIN. CARVALHO",
  "GAB. MIN. DAVID",
  "GAB. MIN. ELIZABETH",
  "GAB. MIN. FARIAS",
  "GAB. MIN. JOSELI",
  "GAB. MIN. LANCIA",
  "GAB. MIN. LUCIO",
  "GAB. MIN. NAZARETH",
  "GAB. MIN. PERICLES",
  "GAB. MIN. PUNTEL",
  "GAB. MIN. VERONICA",
  "GAB. MIN. VIDIGAL",
  "GAB. MIN. VIVEIROS",
  "GADIR",
  "GAPRE",
  "NUGEP",
  "OUVIDORIA",
  "PRESIDENCIA",
  "PROJETOS ESTRATEGICOS",
  "SEAUD",
  "SEJUD",
  "SEPLE",
  "SEPRE",
  "SGEST"
];
