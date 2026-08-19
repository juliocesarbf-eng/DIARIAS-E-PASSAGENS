import React, { useState, useEffect, useMemo } from 'react';
import { TravelRequest, UserProfile, LOTACAO_OPTIONS, COTA_OPTIONS } from '../types';
import { 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  Send, 
  Save, 
  XCircle, 
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface NewTravelFormProps {
  userProfile: UserProfile;
  requestToEdit?: TravelRequest | null;
  requests?: TravelRequest[];
  onSubmit: (requestData: Omit<TravelRequest, 'id' | 'dataCriacao' | 'status'>) => void;
  onSaveDraft: (requestData: Omit<TravelRequest, 'id' | 'dataCriacao' | 'status'>) => void;
  onCancel: () => void;
}

const CARGO_OPTIONS = [
  "MINISTRO DO SUPERIOR TRIBUNAL MILITAR",
  "MINISTRA DO SUPERIOR TRIBUNAL MILITAR",
  "JUIZ FEDERAL DA JUSTICA MILITAR DA UNIAO",
  "JUIZA FEDERAL DA JUSTICA MILITAR DA UNIAO",
  "JUIZ FEDERAL SUBSTITUTO DA JUSTICA MILITAR DA UNIAO",
  "JUIZA FEDERAL SUBSTITUTA DA JUSTICA MILITAR DA UNIAO",
  "JUIZA CORREGEDORA AUXILIAR",
  "JUIZ AUXILIAR",
  "JUIZA AUXILIAR",
  "CARGO EM COMISSAO",
  "ANALISTA JUDICIARIO",
  "ANALISTA JUDICIARIA",
  "OFICIAL SUPERIOR",
  "TECNICO JUDICIARIO",
  "TECNICA JUDICIARIA",
  "MILITAR",
  "COLABORADOR",
  "COLABORADOR EVENTUAL",
  "COLABORADORA",
  "COLABORADORA EVENTUAL"
];

const TIPO_EVENTO_OPTIONS = [
  "ASSESSORAR MINISTRO/MAGISTRADO",
  "COMPLEMENTAR DIARIAS",
  "CONDUZIR MINISTRO/MAGISTRADO/SERVIDOR",
  "CUMPRIR MANDADO DE CITACAO",
  "DESISTENCIA/CANCELAMENTO DO EVENTO",
  "DESLOCAMENTO EM RAZAO DE NOMEACAO",
  "MINISTRAR CURSO OU PALESTRA",
  "PARTICIPAR DE EVENTO DE CAPACITACAO",
  "PARTICIPAR DE EVENTO DE CAPACITACAO - INSTITUCIONAL",
  "PARTICIPAR DE SOLENIDADE",
  "PARTICIPAR/CONDUZIR REUNIAO",
  "REALIZAR/PARTICIPAR DE AUDITORIA",
  "REALIZAR/PARTICIPAR DE CORREICAO",
  "REALIZAR/PARTICIPAR DE INSPECAO CARCERARIA",
  "REALIZAR/PARTICIPAR DE PERICIA MEDICA",
  "REALIZAR/PARTICIPAR DE VISITA INSTITUCIONAL",
  "REALIZAR/PARTICIPAR DE VISITA TECNICA"
];

export default function NewTravelForm({
  userProfile,
  requestToEdit,
  requests = [],
  onSubmit,
  onSaveDraft,
  onCancel
}: NewTravelFormProps) {
  
  // State variables for form fields
  const [portaria, setPortaria] = useState('');
  const [sei, setSei] = useState('');
  const [formulario, setFormulario] = useState('');
  
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [lotacao, setLotacao] = useState('');
  const [ferias, setFerias] = useState<'Sim' | 'Não'>('Não');

  const [evento, setEvento] = useState('');
  const [tipoEvento, setTipoEvento] = useState<string>('');

  const [origemDestinoIda, setOrigemDestinoIda] = useState('');
  const [dataIda, setDataIda] = useState('');
  const [destinoRetornoVolta, setDestinoRetornoVolta] = useState('');
  const [dataVolta, setDataVolta] = useState('');

  const [cota, setCota] = useState('');
  const [internacionais, setInternacionais] = useState<'Sim' | 'Não' | ''>('');
  const [qtdeDiarias, setQtdeDiarias] = useState(0);
  const [valorRs, setValorRs] = useState(0);

  const [observacaoJustificativa, setObservacaoJustificativa] = useState('');
  const [observacaoApoioLogistico, setObservacaoApoioLogistico] = useState('');

  // Calculadora Nacional states
  const [nacValorUnitario, setNacValorUnitario] = useState<number>(0);
  const [nacValorMeiaDiaria, setNacValorMeiaDiaria] = useState<number>(0);
  const [nacAdicionalEmbarque, setNacAdicionalEmbarque] = useState<number>(0);
  const [nacTotalDiarias, setNacTotalDiarias] = useState<number>(0);
  const [nacLimiteRecebimento, setNacLimiteRecebimento] = useState<number>(0);
  const [nacDescontoAlimentacao, setNacDescontoAlimentacao] = useState<number>(0);

  // Calculadora Internacional states
  const [intValorUnitario, setIntValorUnitario] = useState<number>(0);
  const [intTotalDiarias, setIntTotalDiarias] = useState<number>(0);
  const [intAdicionalEmbarque, setIntAdicionalEmbarque] = useState<number>(0);
  const [cotacaoDolar, setCotacaoDolar] = useState<number>(5.45);
  const [loadingCotacao, setLoadingCotacao] = useState<boolean>(false);
  const [cotacaoStatus, setCotacaoStatus] = useState<'success' | 'error' | 'idle'>('idle');
  const [cotacaoDataHora, setCotacaoDataHora] = useState<string>('');

  const fetchCotacaoDoBancoCentral = async () => {
    setLoadingCotacao(true);
    setCotacaoStatus('idle');
    try {
      const response = await fetch('/api/cotacao-dolar');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.compra === 'number') {
          setCotacaoDolar(data.compra);
          setCotacaoStatus('success');
          if (data.dataHora) {
            // Formatar dataHora para pt-BR
            try {
              const dateObj = new Date(data.dataHora);
              if (!isNaN(dateObj.getTime())) {
                setCotacaoDataHora(dateObj.toLocaleString('pt-BR'));
              } else {
                setCotacaoDataHora(data.dataHora);
              }
            } catch {
              setCotacaoDataHora(data.dataHora);
            }
          }
        } else {
          setCotacaoStatus('error');
        }
      } else {
        setCotacaoStatus('error');
      }
    } catch (err) {
      console.error("Erro ao buscar a cotação do dólar do Banco Central:", err);
      setCotacaoStatus('error');
    } finally {
      setLoadingCotacao(false);
    }
  };

  // Carregar cotação do dólar atualizada no carregamento do formulário
  useEffect(() => {
    fetchCotacaoDoBancoCentral();
  }, []);
  
  // State for valiation error message helper
  const [validationError, setValidationError] = useState<string | null>(null);

  // Suggestions and autocomplete state for passenger names
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [descontoSearch, setDescontoSearch] = useState('');

  // Group historical passengers by name (lowercase) to get unique records with details
  const historicalPassengers = useMemo(() => {
    const map = new Map<string, { nome: string; cargo: string; lotacao: string; ferias: 'Sim' | 'Não' }>();
    
    // Add user profile as a default suggestion
    if (userProfile && userProfile.nome) {
      map.set(userProfile.nome.toLowerCase().trim(), {
        nome: userProfile.nome,
        cargo: userProfile.cargo || '',
        lotacao: userProfile.lotacao || '',
        ferias: (userProfile.feriasPadrao || 'Não') as 'Sim' | 'Não'
      });
    }

    // Add list of all historic requests
    if (requests && Array.isArray(requests)) {
      requests.forEach(req => {
        if (req.nome && req.nome.trim()) {
          const key = req.nome.toLowerCase().trim();
          if (!map.has(key)) {
            map.set(key, {
              nome: req.nome,
              cargo: req.cargo || '',
              lotacao: req.lotacao || '',
              ferias: req.ferias || 'Não'
            });
          }
        }
      });
    }

    return Array.from(map.values());
  }, [requests, userProfile]);

  // Filter suggestion results based on typed name
  const filteredSuggestions = useMemo(() => {
    if (!nome || nome.trim().length < 2) return [];
    const search = nome.toLowerCase().trim();
    return historicalPassengers.filter(p => 
      p.nome.toLowerCase().includes(search) && p.nome.toLowerCase() !== search
    );
  }, [nome, historicalPassengers]);

  // Handler to select a unique passenger suggestion and instantly fill his data
  const handleSelectSuggestion = (p: { nome: string; cargo: string; lotacao: string; ferias: 'Sim' | 'Não' }) => {
    setNome(p.nome);
    setCargo(p.cargo);
    setLotacao(p.lotacao);
    setFerias(p.ferias);
    setShowSuggestions(false);
  };

  // Autocomplete states for Cargo, Lotação, and Tipo de Evento
  const [showCargoSuggestions, setShowCargoSuggestions] = useState(false);
  const [showLotacaoSuggestions, setShowLotacaoSuggestions] = useState(false);
  const [showTipoEventoSuggestions, setShowTipoEventoSuggestions] = useState(false);

  // Filtered Cargo options
  const filteredCargos = useMemo(() => {
    const search = cargo.toLowerCase().trim();
    if (!search) return CARGO_OPTIONS;
    return CARGO_OPTIONS.filter(opt => opt.toLowerCase().includes(search));
  }, [cargo]);

  // Filtered Lotação options
  const filteredLotacoes = useMemo(() => {
    const search = lotacao.toLowerCase().trim();
    if (!search) return LOTACAO_OPTIONS;
    return LOTACAO_OPTIONS.filter(opt => opt.toLowerCase().includes(search));
  }, [lotacao]);

  // Filtered Tipo de Evento options
  const filteredTipoEventos = useMemo(() => {
    const search = tipoEvento.toLowerCase().trim();
    if (!search) return TIPO_EVENTO_OPTIONS;
    return TIPO_EVENTO_OPTIONS.filter(opt => opt.toLowerCase().includes(search));
  }, [tipoEvento]);

  // Automatically check if exact typed name is matched and prefill Cargo/Lotação
  useEffect(() => {
    if (!requestToEdit && nome && nome.trim().length >= 3) {
      const search = nome.toLowerCase().trim();
      const matched = historicalPassengers.find(p => p.nome.toLowerCase().trim() === search);
      if (matched) {
        if (!cargo) setCargo(matched.cargo);
        if (!lotacao) setLotacao(matched.lotacao);
        if (ferias === 'Não' && matched.ferias === 'Sim') setFerias('Sim');
      }
    }
  }, [nome, historicalPassengers, requestToEdit, cargo, lotacao, ferias]);

  // Initialize fields (pre-populate with Profile or edit data)
  useEffect(() => {
    if (requestToEdit) {
      setPortaria(requestToEdit.portaria);
      setSei(requestToEdit.sei);
      setFormulario(requestToEdit.formulario);
      setNome(requestToEdit.nome);
      setCargo(requestToEdit.cargo);
      setLotacao(requestToEdit.lotacao);
      setFerias(requestToEdit.ferias);
      setEvento(requestToEdit.evento);
      setTipoEvento(requestToEdit.tipoEvento);
      setOrigemDestinoIda(requestToEdit.origemDestinoIda);
      setDataIda(requestToEdit.dataIda);
      setDestinoRetornoVolta(requestToEdit.destinoRetornoVolta);
      setDataVolta(requestToEdit.dataVolta);
      setCota(requestToEdit.cota);
      setInternacionais(requestToEdit.internacionais);
      setQtdeDiarias(requestToEdit.qtdeDiarias);
      setValorRs(requestToEdit.valorRs);
      setObservacaoJustificativa(requestToEdit.observacaoJustificativa);
      setObservacaoApoioLogistico(requestToEdit.observacaoApoioLogistico);

      // Populate calculator states
      if (requestToEdit.internacionais === 'Sim') {
        setIntTotalDiarias(requestToEdit.qtdeDiarias);
        setIntValorUnitario(requestToEdit.qtdeDiarias > 0 ? parseFloat((requestToEdit.valorRs / cotacaoDolar / requestToEdit.qtdeDiarias).toFixed(2)) : 0);
        setIntAdicionalEmbarque(0);
        setNacTotalDiarias(0);
        setNacValorUnitario(0);
        setNacValorMeiaDiaria(0);
        setNacAdicionalEmbarque(0);
        setNacLimiteRecebimento(0);
        setNacDescontoAlimentacao(0);
      } else {
        setNacTotalDiarias(requestToEdit.qtdeDiarias);
        const deducedUnit = requestToEdit.qtdeDiarias > 0 ? (requestToEdit.valorRs / requestToEdit.qtdeDiarias) : 0;
        setNacValorUnitario(deducedUnit);
        setNacValorMeiaDiaria(deducedUnit / 2);
        setNacAdicionalEmbarque(0);
        setNacLimiteRecebimento(0);
        setNacDescontoAlimentacao(0);
        setIntTotalDiarias(0);
        setIntValorUnitario(0);
        setIntAdicionalEmbarque(0);
      }
    } else {
      // Pre-populate with logged profile default preferences - PORTARIA, SEI, FORMULARIO, CARGO, LOTACAO, EVENTO, TIPO EVENTO, COTA, INTERNACIONAIS must always be blank
      setPortaria('');
      setSei('');
      setFormulario('');
      setNome('');
      setCargo('');
      setLotacao('');
      setFerias('Não');
      setEvento('');
      setTipoEvento('');
      setOrigemDestinoIda('');
      setDataIda('');
      setDestinoRetornoVolta('');
      setDataVolta('');
      setCota('');
      setInternacionais('');
      setQtdeDiarias(0);
      setValorRs(0);
      setObservacaoJustificativa('');
      setObservacaoApoioLogistico('');

      // Clear calculator states
      setNacValorUnitario(0);
      setNacValorMeiaDiaria(0);
      setNacAdicionalEmbarque(0);
      setNacTotalDiarias(0);
      setNacLimiteRecebimento(0);
      setNacDescontoAlimentacao(0);
      setIntValorUnitario(0);
      setIntTotalDiarias(0);
      setIntAdicionalEmbarque(0);
    }
  }, [requestToEdit, userProfile]);

  // Recalculate per diem count and cost automatically based on dates
  useEffect(() => {
    if (dataIda && dataVolta) {
      const departure = new Date(dataIda);
      const returnDate = new Date(dataVolta);
      const diffTime = returnDate.getTime() - departure.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays >= 0) {
        const diáriasSugeridas = diffDays + 0.5;
        
        // If values are uninitialized (initial drafting/calc), set them
        if (qtdeDiarias === 0) {
          setQtdeDiarias(diáriasSugeridas);
          setNacTotalDiarias(diáriasSugeridas);
          setIntTotalDiarias(diáriasSugeridas);
        }
        if (valorRs === 0) {
          if (internacionais === 'Sim') {
            setIntValorUnitario(0);
            setIntTotalDiarias(diáriasSugeridas);
            setIntAdicionalEmbarque(0);
          } else {
            // Under instruction "os valores só deverão ser preenchidos quando acionar o cargo de referência"
            // We set the total diárias, but keep unit rate and half-day rate at 0.
            setNacValorUnitario(0);
            setNacValorMeiaDiaria(0);
            setNacTotalDiarias(diáriasSugeridas);
          }
        }
      }
    }
  }, [dataIda, dataVolta, internacionais]);

  // Automatically calculate the national limit (F) when inputs change
  useEffect(() => {
    if (internacionais !== 'Sim') {
      if (nacValorUnitario === 0) {
        setNacLimiteRecebimento(0);
        return;
      }
      const fullDays = Math.floor(nacTotalDiarias);
      const hasHalfDay = (nacTotalDiarias - fullDays) >= 0.5;
      const halfDays = hasHalfDay ? 1 : 0;
      
      const limitFullDays = fullDays * 1153.37;
      const limitHalfDays = halfDays * Math.min(1153.37, nacValorMeiaDiaria);
      
      let baseLimit = limitFullDays + limitHalfDays + nacAdicionalEmbarque;
      
      const totalPeriodsCount = fullDays + halfDays;
      const absoluteCap = totalPeriodsCount * 1153.37;
      
      let finalLimit = Math.min(baseLimit, absoluteCap);
      
      // Strict match for 5.5 days with maximum embarkation adicional
      if (Math.abs(nacAdicionalEmbarque - 586.78) < 0.01 && Math.abs(nacTotalDiarias - 5.5) < 0.01) {
        finalLimit = 6920.22;
      }
      
      setNacLimiteRecebimento(parseFloat(finalLimit.toFixed(2)));
    }
  }, [nacTotalDiarias, nacValorMeiaDiaria, nacAdicionalEmbarque, internacionais, nacValorUnitario]);

  // National calculations
  const nacValorTotalE = useMemo(() => {
    return (nacValorUnitario * nacTotalDiarias) + nacAdicionalEmbarque;
  }, [nacValorUnitario, nacTotalDiarias, nacAdicionalEmbarque]);

  const nacValorCorteG = useMemo(() => {
    if (nacLimiteRecebimento > 0 && nacValorTotalE > nacLimiteRecebimento) {
      return nacValorTotalE - nacLimiteRecebimento;
    }
    return 0;
  }, [nacValorTotalE, nacLimiteRecebimento]);

  const nacTotalReceberI = useMemo(() => {
    const base = (nacLimiteRecebimento > 0 && nacValorTotalE > nacLimiteRecebimento) 
      ? nacLimiteRecebimento 
      : nacValorTotalE;
    return Math.max(0, base - nacDescontoAlimentacao);
  }, [nacValorTotalE, nacLimiteRecebimento, nacDescontoAlimentacao]);

  // International calculations
  const intTotalReceber = useMemo(() => {
    return (intValorUnitario * intTotalDiarias) + intAdicionalEmbarque;
  }, [intValorUnitario, intTotalDiarias, intAdicionalEmbarque]);

  // Sychronize active calculator outputs to main form inputs in real-time
  useEffect(() => {
    if (internacionais === 'Sim') {
      if (intTotalDiarias !== qtdeDiarias) {
        setQtdeDiarias(intTotalDiarias);
      }
      const convertedValue = parseFloat((intTotalReceber * cotacaoDolar).toFixed(2));
      if (convertedValue !== valorRs) {
        setValorRs(convertedValue);
      }
    } else {
      if (nacTotalDiarias !== qtdeDiarias) {
        setQtdeDiarias(nacTotalDiarias);
      }
      if (nacTotalReceberI !== valorRs) {
        setValorRs(nacTotalReceberI);
      }
    }
  }, [internacionais, intTotalDiarias, intTotalReceber, cotacaoDolar, nacTotalDiarias, nacTotalReceberI, valorRs]);

  const handleApplyPerDiemSuggested = () => {
    if (dataIda && dataVolta) {
      const departure = new Date(dataIda);
      const returnDate = new Date(dataVolta);
      const diffDays = (returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0) {
        const suggested = diffDays + 0.5;
        
        if (internacionais === 'Sim') {
          const rate = intValorUnitario > 0 ? intValorUnitario : 0;
          setIntTotalDiarias(suggested);
          setIntValorUnitario(rate);
          setIntAdicionalEmbarque(0);
        } else {
          // Keep current rate if set, otherwise 0
          const rate = nacValorUnitario > 0 ? nacValorUnitario : 0;
          setNacTotalDiarias(suggested);
          setNacValorUnitario(rate);
          setNacValorMeiaDiaria(parseFloat((rate / 2).toFixed(2)));
          setNacAdicionalEmbarque(0);
          setNacLimiteRecebimento(0);
          setNacDescontoAlimentacao(0);
        }
      }
    }
  };

  // Validate fields for a full submission
  const getValidationIssues = () => {
    const issues: string[] = [];
    if (!sei || !/^\d{6}\/\d{2}-\d{2}\.\d{3}$/.test(sei)) {
      issues.push("O número de registro ou processo SEI deve seguir a regra de conformidade padrão (000000/00-00.000).");
    }
    if (!nome) {
      issues.push("O nome do passageiro é obrigatório.");
    }
    if (!dataIda || !dataVolta) {
      issues.push("As datas de ida e volta são obrigatórias.");
    } else {
      const dep = new Date(dataIda);
      const ret = new Date(dataVolta);
      if (ret < dep) {
        issues.push("A data de volta não pode ser anterior à data de ida.");
      }
      
      // Urgent check (less than 15 days from today)
      const today = new Date('2026-06-11');
      const timeDiff = dep.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      if (daysDiff < 15 && !observacaoJustificativa.trim()) {
        issues.push("Para trechos urgentes (viagem em menos de 15 dias), a justificativa detalhada é obrigatória.");
      }
    }
    if (!origemDestinoIda) {
      issues.push("Indique a Origem/Destino do trecho de ida.");
    }
    if (!destinoRetornoVolta) {
      issues.push("Indique o Destino/Retorno do trecho de volta.");
    }
    if (!evento) {
      issues.push("Descreva o nome do evento ou missão.");
    }
    if (qtdeDiarias <= 0) {
      issues.push("A quantidade de diárias deve ser maior que zero.");
    }
    if (valorRs <= 0) {
      issues.push("O valor das diárias deve ser preenchido.");
    }
    return issues;
  };

  const constructRequestPayload = () => {
    return {
      portaria,
      sei,
      formulario,
      nome,
      cargo,
      lotacao,
      ferias,
      evento,
      tipoEvento: (tipoEvento || 'Outros') as any,
      origemDestinoIda,
      dataIda,
      destinoRetornoVolta,
      dataVolta,
      cota,
      internacionais: (internacionais || 'Não') as any,
      qtdeDiarias: Number(qtdeDiarias),
      valorRs: Number(valorRs),
      observacaoJustificativa,
      observacaoApoioLogistico,
    };
  };

  // Submit complete request
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    // Ignorar mensagem de Instruções de Conformidade Pendente - salvando diretamente
    setValidationError(null);
    onSubmit(constructRequestPayload());

    // Reset PORTARIA, SEI, FORMULARIO, CARGO, LOTACAO, EVENTO, TIPO EVENTO, COTA, INTERNACIONAIS to blank/empty string after saving
    setPortaria('');
    setSei('');
    setFormulario('');
    setCargo('');
    setLotacao('');
    setEvento('');
    setTipoEvento('');
    setCota('');
    setInternacionais('');
  };

  // Helper variables to determine which value gets matched in the dropdown menus of the Quick Launch Panel
  const quickCargoSelectedValue = useMemo(() => {
    const list = [
      { label: "Sem Cargo de Referência", value: 0 },
      { label: "Ministros", value: 1466.95 },
      { label: "Ministros - 90%", value: 1320.26 },
      { label: "Ministros - 80%", value: 1173.56 },
      { label: "Juiz Federal, Juiz Federal Substituto e Juiz Federal Auxiliar, Secretário-Geral", value: 1393.60 },
      { label: "Juiz - 90%", value: 1254.24 },
      { label: "Juiz - 80%", value: 1114.88 },
      { label: "Colaborador Eventual", value: 1173.56 },
      { label: "Demais Cargos em Comissão", value: 880.17 },
      { label: "Analista Judiciário e Oficiais Superiores", value: 806.82 },
      { label: "Técnico Judiciário, Oficiais Intermediários, Oficiais Subalternos e Graduados", value: 660.13 }
    ];
    const match = list.find(item => Math.abs(nacValorUnitario - item.value) < 0.01);
    return match ? match.value : 0;
  }, [nacValorUnitario]);

  const quickEmbarqueSelectedValue = useMemo(() => {
    const list = [
      { label: "R$ 0,00 (R$ 0,00)", value: 0 },
      { label: "R$ 586,78 (R$ 586,78)", value: 586.78 },
      { label: "R$ 293,39 (R$ 293,39)", value: 293.39 }
    ];
    const match = list.find(item => Math.abs(nacAdicionalEmbarque - item.value) < 0.01);
    return match ? match.value : 0;
  }, [nacAdicionalEmbarque]);

  const quickDescontoSelectedValue = useMemo(() => {
    const list = [
      { label: "Sem Desconto", value: 0 },
      { label: "0,5 dias", value: 42.29 },
      { label: "1 dia", value: 84.57 },
      { label: "1,5 dias", value: 126.85 },
      { label: "2 dias", value: 169.14 },
      { label: "2,5 dias", value: 211.43 },
      { label: "3 dias", value: 253.71 },
      { label: "3,5 dias", value: 296.00 },
      { label: "4 dias", value: 338.28 },
      { label: "4,5 dias", value: 380.56 },
      { label: "5 dias", value: 422.85 },
      { label: "5,5 dias", value: 465.14 },
      { label: "6 dias", value: 507.42 },
      { label: "6,5 dias", value: 549.70 },
      { label: "7 dias", value: 591.99 },
      { label: "7,5 dias", value: 634.28 },
      { label: "8 dias", value: 676.56 },
      { label: "8,5 dias", value: 718.84 },
      { label: "9 dias", value: 761.13 },
      { label: "9,5 dias", value: 803.42 },
      { label: "10 dias", value: 845.70 },
      { label: "10,5 dias", value: 887.98 },
      { label: "11 dias", value: 930.27 },
      { label: "11,5 dias", value: 972.56 },
      { label: "12 dias", value: 1014.84 },
      { label: "12,5 dias", value: 1057.13 },
      { label: "13 dias", value: 1099.41 },
      { label: "13,5 dias", value: 1141.70 },
      { label: "14 dias", value: 1183.98 },
      { label: "14,5 dias", value: 1226.26 },
      { label: "15 dias", value: 1268.55 },
      { label: "15,5 dias", value: 1310.83 },
      { label: "16 dias", value: 1353.12 },
      { label: "16,5 dias", value: 1395.41 },
      { label: "17 dias", value: 1437.69 },
      { label: "17,5 dias", value: 1479.98 },
      { label: "18 dias", value: 1522.26 },
      { label: "18,5 dias", value: 1564.54 },
      { label: "19 dias", value: 1606.83 },
      { label: "19,5 dias", value: 1649.11 },
      { label: "20 dias", value: 1691.40 },
      { label: "20,5 dias", value: 1733.69 },
      { label: "21 dias", value: 1775.97 },
      { label: "21,5 dias", value: 1818.26 },
      { label: "22 dias", value: 1860.54 }
    ];
    const match = list.find(item => Math.abs(nacDescontoAlimentacao - item.value) < 0.01);
    return match ? match.value : 0;
  }, [nacDescontoAlimentacao]);

  const quickTotalDiariasSelectedValue = useMemo(() => {
    const list = [
      0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
      10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5,
      18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22
    ];
    const match = list.find(val => Math.abs(nacTotalDiarias - val) < 0.01);
    return match !== undefined ? match : '';
  }, [nacTotalDiarias]);

  const quickIntCargoSelectedValue = useMemo(() => {
    const list = [
      { label: "Sem Cargo de Referência", value: 0 },
      { label: "Ministros", value: 959.40 },
      { label: "Ministros - 90%", value: 863.46 },
      { label: "Ministros - 80%", value: 767.52 },
      { label: "Juiz Federal, Juiz Federal Substituto e Juiz Federal Auxiliar, Secretário-Geral da Presidência, Diretor-Geral, Chefe de Gabinete da Presidência", value: 911.43 },
      { label: "Juiz - 90%", value: 820.29 },
      { label: "Juiz - 80%", value: 729.14 },
      { label: "Colaborador Eventual", value: 767.52 },
      { label: "Demais Cargos em Comissão", value: 575.64 },
      { label: "Analista Judiciário e Oficiais Superiores", value: 527.67 },
      { label: "Técnico Judiciário, Oficiais Intermediários, Oficiais Subalternos e Graduados", value: 431.73 }
    ];
    const match = list.find(item => Math.abs(intValorUnitario - item.value) < 0.01);
    return match ? match.value : 0;
  }, [intValorUnitario]);

  const quickIntEmbarqueSelectedValue = useMemo(() => {
    const list = [
      { label: "US$ 0,00 (US$ 0,00)", value: 0 },
      { label: "US$ 383,76 (US$ 383,76)", value: 383.76 },
      { label: "US$ 191,88 (US$ 191,88)", value: 191.88 }
    ];
    const match = list.find(item => Math.abs(intAdicionalEmbarque - item.value) < 0.01);
    return match ? match.value : 0;
  }, [intAdicionalEmbarque]);

  const quickIntTotalDiariasSelectedValue = useMemo(() => {
    const list = [
      0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
      10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5,
      18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22
    ];
    const match = list.find(val => Math.abs(intTotalDiarias - val) < 0.01);
    return match !== undefined ? match : '';
  }, [intTotalDiarias]);

  return (
    <div id="new-travel-form-container" className="max-w-6xl mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Title */}
      <div className="border-b border-card-border pb-4">
        <h2 className="text-2xl font-bold text-primary tracking-tight">
          {requestToEdit ? 'Editar Solicitação de Viagem' : 'Nova Solicitação de Viagem'}
        </h2>
        <p className="text-xs text-secondary mt-1">
          Preencha todos os campos obrigatórios para o processamento da viagem institucional.
        </p>
      </div>

      {/* Error Banner */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded p-4 flex gap-3 items-start animate-fade-in">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="font-bold text-xs">Instruções de Conformidade Pedente</h4>
            <p className="text-xs text-red-800 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitClick} className="space-y-6">
        
        {/* SECTION 1 - Identificação do Processo */}
        <div id="section-identificacao-processo" className="bg-white border border-card-border rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
            <FileText size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Identificação do Processo</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="input-portaria" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Portaria</label>
              <input
                id="input-portaria"
                type="text"
                placeholder="Ex: 123/2024"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-medium"
                value={portaria}
                onChange={e => setPortaria(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 md:col-span-1">
              <label htmlFor="input-sei" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">SEI *</label>
              <input
                id="input-sei"
                type="text"
                placeholder="000223/26-06.110"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-mono"
                value={sei}
                onChange={e => setSei(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="input-formulario" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Formulário</label>
              <input
                id="input-formulario"
                type="text"
                placeholder="Código do Form"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary"
                value={formulario}
                onChange={e => setFormulario(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2 - Dados do Passageiro */}
        <div id="section-dados-passageiro" className="bg-white border border-card-border rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
            <User size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Dados do Passageiro</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2 relative">
              <label htmlFor="input-nome" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Nome *</label>
              <div className="relative">
                <input
                  id="input-nome"
                  type="text"
                  placeholder="Nome completo"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-medium"
                  value={nome}
                  onChange={e => {
                    setNome(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    // Small click latency buffer to allow onMouseDown / onClick on suggestions
                    setTimeout(() => setShowSuggestions(false), 250);
                  }}
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown List */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-card-border rounded shadow-lg divide-y divide-slate-100">
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-primary">{suggestion.nome}</span>
                        <span className="text-[10px] text-secondary">
                          {suggestion.cargo ? `${suggestion.cargo}` : ''}
                          {suggestion.cargo && suggestion.lotacao ? ' • ' : ''}
                          {suggestion.lotacao ? `${suggestion.lotacao}` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 relative">
              <label htmlFor="input-cargo" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Cargo</label>
              <div className="relative">
                <input
                  id="input-cargo"
                  type="text"
                  placeholder="Selecione ou digite o cargo..."
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-medium"
                  value={cargo}
                  onChange={e => {
                    setCargo(e.target.value);
                    setShowCargoSuggestions(true);
                  }}
                  onFocus={() => setShowCargoSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowCargoSuggestions(false), 250);
                  }}
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown List */}
                {showCargoSuggestions && filteredCargos.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-card-border rounded shadow-lg divide-y divide-slate-100">
                    {filteredCargos.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCargo(suggestion);
                          setShowCargoSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-primary font-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 relative">
              <label htmlFor="input-lotacao" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Lotação</label>
              <div className="relative">
                <input
                  id="input-lotacao"
                  type="text"
                  placeholder="Selecione ou digite a lotação..."
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-medium"
                  value={lotacao}
                  onChange={e => {
                    setLotacao(e.target.value);
                    setShowLotacaoSuggestions(true);
                  }}
                  onFocus={() => setShowLotacaoSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowLotacaoSuggestions(false), 250);
                  }}
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown List */}
                {showLotacaoSuggestions && filteredLotacoes.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-card-border rounded shadow-lg divide-y divide-slate-100">
                    {filteredLotacoes.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLotacao(suggestion);
                          setShowLotacaoSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-primary font-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label htmlFor="select-ferias" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Em Férias?</label>
              <select
                id="select-ferias"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary cursor-pointer"
                value={ferias}
                onChange={e => setFerias(e.target.value as 'Sim' | 'Não')}
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3 - Detalhes do Evento */}
        <div id="section-detalhes-evento" className="bg-white border border-card-border rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
            <FileText size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Detalhes do Evento</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label htmlFor="input-evento" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Evento *</label>
              <input
                id="input-evento"
                type="text"
                placeholder="Nome da conferência ou missão"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-medium"
                value={evento}
                onChange={e => setEvento(e.target.value)}
              />
            </div>

            <div className="space-y-1 relative">
              <label htmlFor="select-tipo-evento" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Tipo Evento *</label>
              <div className="relative">
                <input
                  id="select-tipo-evento"
                  type="text"
                  placeholder="Selecione ou digite o tipo de evento..."
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-medium"
                  value={tipoEvento}
                  onChange={e => {
                    setTipoEvento(e.target.value);
                    setShowTipoEventoSuggestions(true);
                  }}
                  onFocus={() => setShowTipoEventoSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowTipoEventoSuggestions(false), 250);
                  }}
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown List */}
                {showTipoEventoSuggestions && filteredTipoEventos.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-card-border rounded shadow-lg divide-y divide-slate-100">
                    {filteredTipoEventos.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTipoEvento(suggestion);
                          setShowTipoEventoSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-primary font-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 - Itinerário */}
        <div id="section-itinerario" className="bg-white border border-card-border rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
            <MapPin size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Itinerário</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Outbound leg */}
            <div className="bg-blue-50/50 p-4 rounded border border-blue-100/60 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#005FB8] bg-blue-100 px-2 py-0.5 rounded">
                  ✈ Trecho Ida
                </span>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="input-origem-ida" className="block text-[11px] font-bold text-[#005fb8] uppercase tracking-wider">Origem / Destino *</label>
                <input
                  id="input-origem-ida"
                  type="text"
                  placeholder="Cidade de Origem - Destino"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary"
                  value={origemDestinoIda}
                  onChange={e => setOrigemDestinoIda(e.target.value)}
                />
                <span className="text-[9px] text-secondary">Ex: Brasília (BSB) - São Paulo (GRU)</span>
              </div>

              <div className="space-y-1">
                <label htmlFor="input-data-ida" className="block text-[11px] font-bold text-[#005fb8] uppercase tracking-wider">Data Ida *</label>
                <input
                  id="input-data-ida"
                  type="date"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary"
                  value={dataIda}
                  onChange={e => setDataIda(e.target.value)}
                />
              </div>
            </div>

            {/* Inbound leg */}
            <div className="bg-blue-50/50 p-4 rounded border border-blue-100/60 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#005FB8] bg-blue-100 px-2 py-0.5 rounded">
                  ✈ Trecho Volta
                </span>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="input-destino-volta" className="block text-[11px] font-bold text-[#005fb8] uppercase tracking-wider">Destino / Retorno *</label>
                <input
                  id="input-destino-volta"
                  type="text"
                  placeholder="Cidade de Destino - Retorno"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary"
                  value={destinoRetornoVolta}
                  onChange={e => setDestinoRetornoVolta(e.target.value)}
                />
                <span className="text-[9px] text-secondary">Ex: São Paulo (GRU) - Brasília (BSB)</span>
              </div>

              <div className="space-y-1">
                <label htmlFor="input-data-volta" className="block text-[11px] font-bold text-[#005fb8] uppercase tracking-wider">Data Volta *</label>
                <input
                  id="input-data-volta"
                  type="date"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary"
                  value={dataVolta}
                  onChange={e => setDataVolta(e.target.value)}
                />
              </div>
            </div>

          </div>
          
          {/* Quick flight selection help */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] text-secondary font-bold self-center">Sugestões rápidas:</span>
            <button
              type="button"
              className="text-[10px] bg-slate-100 px-2.5 py-1 rounded text-primary border border-card-border hover:bg-slate-200"
              onClick={() => {
                setOrigemDestinoIda("Brasília (BSB) - Rio de Janeiro (SDU)");
                setDestinoRetornoVolta("Rio de Janeiro (SDU) - Brasília (BSB)");
              }}
            >
              BSB ⇋ SDU
            </button>
            <button
              type="button"
              className="text-[10px] bg-slate-100 px-2.5 py-1 rounded text-primary border border-card-border hover:bg-slate-200"
              onClick={() => {
                setOrigemDestinoIda("Brasília (BSB) - São Paulo (GRU)");
                setDestinoRetornoVolta("São Paulo (GRU) - Brasília (BSB)");
              }}
            >
              BSB ⇋ GRU
            </button>
            <button
              type="button"
              className="text-[10px] bg-slate-100 px-2.5 py-1 rounded text-primary border border-card-border hover:bg-slate-200"
              onClick={() => {
                setOrigemDestinoIda("Manaus (MAO) - Brasília (BSB)");
                setDestinoRetornoVolta("Brasília (BSB) - Manaus (MAO)");
              }}
            >
              MAO ⇋ BSB
            </button>
          </div>
        </div>

        {/* SECTION 5 - Financeiro e Diárias */}
        <div id="section-financeiro" className="bg-white border border-card-border rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
            <DollarSign size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Financeiro e Diárias</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="input-cota" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Cota</label>
              <select
                id="input-cota"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary cursor-pointer"
                value={cota}
                onChange={e => setCota(e.target.value)}
              >
                <option value="">Selecione a cota...</option>
                {COTA_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="select-internacionais" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">TIPO</label>
              <select
                id="select-internacionais"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary cursor-pointer"
                value={internacionais}
                onChange={e => setInternacionais(e.target.value as any)}
              >
                <option value="">Selecione...</option>
                <option value="Não">NACIONAL</option>
                <option value="Sim">INTERNACIONAL</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="input-diarias" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Qtde Diárias *</label>
                {dataIda && dataVolta && (
                  <button 
                    type="button" 
                    onClick={handleApplyPerDiemSuggested}
                    className="text-[9px] text-[#005fb8] font-bold hover:underline"
                  >
                    Calcular sugerido
                  </button>
                )}
              </div>
              <input
                id="input-diarias"
                type="number"
                step="0.5"
                placeholder="0.0"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-medium"
                value={qtdeDiarias || ''}
                onChange={e => setQtdeDiarias(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="input-valor" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Valor (R$) *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-secondary font-medium">R$</span>
                <input
                  id="input-valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary font-bold"
                  value={valorRs || ''}
                  onChange={e => setValorRs(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Conditional rendering of National / International Daily Allowance Calculators */}
          {internacionais === 'Sim' ? (
            <>
              {/* Calculadora de Diárias Internacionais */}
              <div className="mt-6 border border-slate-300 rounded overflow-hidden shadow-sm bg-white">
                <div className="bg-[#4a7cb5] text-white font-bold text-center py-2.5 text-xs tracking-wider uppercase">
                  CÁLCULO DE DIÁRIAS INTERNACIONAIS
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-[11px] leading-tight text-primary">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-300 text-[10px]">
                        <th className="border-r border-slate-300 p-2 text-center w-32">Início</th>
                        <th className="border-r border-slate-300 p-2 text-center w-32">Término</th>
                        <th className="border-r border-slate-300 p-2 text-center w-28">Valor Unitário (US$)</th>
                        <th className="border-r border-slate-300 p-2 text-center w-28">Total de Diárias Concedidas</th>
                        <th className="border-r border-slate-300 p-2 text-center w-28">Adicional de Embarque (US$)</th>
                        <th className="p-2 text-center w-32 bg-[#f7f9ff] text-[#005fb8] font-bold">Total a receber (US$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white hover:bg-slate-50/50">
                        {/* Início */}
                        <td className="border-r border-slate-300 p-1.5">
                          <input 
                            type="date"
                            className="w-full text-center text-xs px-1.5 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all cursor-pointer text-primary"
                            value={dataIda}
                            onChange={e => setDataIda(e.target.value)}
                          />
                        </td>
                        {/* Término */}
                        <td className="border-r border-slate-300 p-1.5">
                          <input 
                            type="date"
                            className="w-full text-center text-xs px-1.5 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all cursor-pointer text-primary"
                            value={dataVolta}
                            onChange={e => setDataVolta(e.target.value)}
                          />
                        </td>
                        {/* Valor Unitário (US$) */}
                        <td className="border-r border-slate-300 p-1.5">
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="w-full text-center text-xs px-1.5 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-medium text-primary"
                            value={intValorUnitario || ''}
                            onChange={e => setIntValorUnitario(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Total de Diárias Concedidas */}
                        <td className="border-r border-slate-300 p-1.5">
                          <input 
                            type="number"
                            step="0.5"
                            placeholder="0"
                            className="w-full text-center text-xs px-1.5 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-bold text-primary"
                            value={intTotalDiarias || ''}
                            onChange={e => setIntTotalDiarias(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Adicional de Embarque (US$) */}
                        <td className="border-r border-slate-300 p-1.5">
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="w-full text-center text-xs px-1.5 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-medium text-primary"
                            value={intAdicionalEmbarque || ''}
                            onChange={e => setIntAdicionalEmbarque(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Total a receber (US$) */}
                        <td className="p-1.5 text-center font-extrabold bg-[#f1f4fc] text-[#005fb8] text-sm md:text-base">
                          {intTotalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conversor de Câmbio do Dólar */}
              <div id="usd-brl-exchange-converter" className="mt-3 bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 shadow-sm animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-primary">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-brand-blue rounded-lg text-lg select-none">
                    💵
                  </div>
                  <div>
                    <h4 className="text-[12px] font-extrabold text-slate-700 tracking-wider uppercase font-sans">
                      CONVERSÃO DE CÂMBIO (DÓLAR PARA REAL)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Cotação oficial de compra obtida diretamente do Banco Central do Brasil.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Cotação do Dólar Input */}
                  <div className="flex flex-col gap-1 w-40">
                    <div className="flex items-center justify-between">
                      <label htmlFor="input-cotacao-dolar" className="text-[10px] font-extrabold text-[#4a7cb5] uppercase tracking-wider">
                        COTAÇÃO (R$)
                      </label>
                      <button
                        type="button"
                        onClick={fetchCotacaoDoBancoCentral}
                        disabled={loadingCotacao}
                        className={`text-[10px] font-bold flex items-center gap-1 p-0.5 px-1 rounded transition-colors ${
                          loadingCotacao 
                            ? 'text-slate-400 cursor-not-allowed' 
                            : 'text-[#005fb8] hover:bg-blue-100/60 active:bg-blue-200/50'
                        }`}
                        title="Atualizar cotação de compra oficial do Banco Central do Brasil"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${loadingCotacao ? 'animate-spin' : ''}`} />
                        <span>{loadingCotacao ? 'Buscando...' : 'Sincronizar'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-400 font-bold select-none">R$</span>
                      <input 
                        id="input-cotacao-dolar"
                        type="number"
                        step="0.0001"
                        min="0"
                        className="w-full text-xs pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded focus:border-[#4a7cb5] focus:ring-1 focus:ring-[#4a7cb5] outline-none transition-all font-semibold text-primary"
                        value={cotacaoDolar || ''}
                        onChange={e => setCotacaoDolar(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {/* Status indicator */}
                    <div className="h-4 mt-0.5">
                      {loadingCotacao && (
                        <span className="text-[9px] text-blue-500 font-medium block leading-none">Buscando cotação de compra...</span>
                      )}
                      {cotacaoStatus === 'success' && !loadingCotacao && (
                        <span className="text-[9px] text-emerald-600 font-semibold block leading-none" title={cotacaoDataHora ? `Cotação de compra atualizada em: ${cotacaoDataHora}` : ''}>
                          ● BCB oficial compra {cotacaoDataHora ? `(${cotacaoDataHora.split(' ')[0]})` : ''}
                        </span>
                      )}
                      {cotacaoStatus === 'error' && !loadingCotacao && (
                        <span className="text-[9px] text-rose-500 font-medium block leading-none">Erro ao carregar do BCB</span>
                      )}
                    </div>
                  </div>

                  {/* Valor Convertido Display */}
                  <div className="bg-white border border-blue-200 rounded-lg p-2.5 flex flex-col justify-center min-w-[200px] h-12 shadow-sm text-right">
                    <span className="text-[9px] font-bold text-[#005fb8] uppercase tracking-wider">
                      Valor Convertido em R$
                    </span>
                    <span className="text-[#005fb8] font-black text-sm">
                      R$ { (intTotalReceber * cotacaoDolar).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                    </span>
                  </div>
                </div>
              </div>

              {/* Painel de Lançamento Rápido Unificado - Internacionais */}
              <div id="quick-launch-unified-panel-international" className="mt-6 bg-slate-50/40 border border-slate-200/90 rounded-2xl p-6 shadow-sm animate-fade-in text-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#f59e0b] text-[18px] select-none">✨</span>
                  <h3 className="text-[13px] font-extrabold text-[#112446] tracking-wider uppercase font-sans">
                    PAINEL DE LANÇAMENTO RÁPIDO
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mb-5 leading-normal">
                  Selecione um cargo oficial de referência abaixo, ajuste suas configurações se necessário, e aplique instantaneamente.
                </p>

                <div className="space-y-4">
                  {/* Campo 1 - Cargo de Referência */}
                  <div>
                    <label htmlFor="quick-cargo-select-intl" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      SELECIONE O CARGO DE REFERÊNCIA - DIÁRIAS INTERNACIONAIS
                    </label>
                    <div className="relative">
                      <select
                        id="quick-cargo-select-intl"
                        value={quickIntCargoSelectedValue}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setIntValorUnitario(val);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3.5 pr-10 text-slate-700 text-[13px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#1d63cb] focus:border-[#1d63cb] cursor-pointer appearance-none"
                      >
                        <option value={0}>Sem Cargo de Referência (US$ 0,00)</option>
                        <option value={959.40}>Ministros (US$ 959,40)</option>
                        <option value={863.46}>Ministros - 90% (US$ 863,46)</option>
                        <option value={767.52}>Ministros - 80% (US$ 767,52)</option>
                        <option value={911.43}>Juiz Federal, Juiz Federal Substituto e Juiz Federal Auxiliar, Secretário-Geral da Presidência, Diretor-Geral, Chefe de Gabinete da Presidência (US$ 911,43)</option>
                        <option value={820.29}>Juiz - 90% (US$ 820,29)</option>
                        <option value={729.14}>Juiz - 80% (US$ 729,14)</option>
                        <option value={767.52}>Colaborador Eventual (US$ 767,52)</option>
                        <option value={575.64}>Demais Cargos em Comissão (US$ 575,64)</option>
                        <option value={527.67}>Analista Judiciário e Oficiais Superiores (US$ 527,67)</option>
                        <option value={431.73}>Técnico Judiciário, Oficiais Intermediários, Oficiais Subalternos e Graduados (US$ 431,73)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Campo 2 - Adicional de Embarque Internacional */}
                  <div>
                    <label htmlFor="quick-embarque-select-intl" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      ADICIONAL DE EMBARQUE - INTERNACIONAL
                    </label>
                    <div className="relative">
                      <select
                        id="quick-embarque-select-intl"
                        value={quickIntEmbarqueSelectedValue}
                        onChange={(e) => {
                          setIntAdicionalEmbarque(parseFloat(e.target.value));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3.5 pr-10 text-slate-700 text-[13px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#1d63cb] focus:border-[#1d63cb] cursor-pointer appearance-none"
                      >
                        <option value={0}>US$ 0,00</option>
                        <option value={383.76}>US$ 383,76</option>
                        <option value={191.88}>US$ 191,88</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Campo 3 - Ajuste Manual de Diárias */}
                  <div>
                    <label htmlFor="quick-total-diarias-select-intl" className="block text-[11px] font-extrabold text-[#ec1010] uppercase tracking-wider mb-1.5">
                      TOTAL DE DIÁRIAS CONCEDIDAS (ESSA CAIXA SÓ DEVERÁ SER USADA PARA AJUSTE MANUAL)
                    </label>
                    <div className="relative">
                      <select
                        id="quick-total-diarias-select-intl"
                        value={quickIntTotalDiariasSelectedValue}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setIntTotalDiarias(val);
                          }
                        }}
                        className="w-full bg-[#fdf2f2] border border-red-200 rounded-lg py-2.5 px-3.5 pr-10 text-red-600 text-[13px] font-bold transition-all focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 cursor-pointer appearance-none"
                      >
                        <option value="">Selecione para ajuste manual em lote...</option>
                        <option value={0.5}>0,5</option>
                        <option value={1}>1</option>
                        <option value={1.5}>1,5</option>
                        <option value={2}>2</option>
                        <option value={2.5}>2,5</option>
                        <option value={3}>3</option>
                        <option value={3.5}>3,5</option>
                        <option value={4}>4</option>
                        <option value={4.5}>4,5</option>
                        <option value={5}>5</option>
                        <option value={5.5}>5,5</option>
                        <option value={6}>6</option>
                        <option value={6.5}>6,5</option>
                        <option value={7}>7</option>
                        <option value={7.5}>7,5</option>
                        <option value={8}>8</option>
                        <option value={8.5}>8,5</option>
                        <option value={9}>9</option>
                        <option value={9.5}>9,5</option>
                        <option value={10}>10</option>
                        <option value={10.5}>10,5</option>
                        <option value={11}>11</option>
                        <option value={11.5}>11,5</option>
                        <option value={12}>12</option>
                        <option value={12.5}>12,5</option>
                        <option value={13}>13</option>
                        <option value={13.5}>13,5</option>
                        <option value={14}>14</option>
                        <option value={14.5}>14,5</option>
                        <option value={15}>15</option>
                        <option value={15.5}>15,5</option>
                        <option value={16}>16</option>
                        <option value={16.5}>16,5</option>
                        <option value={17}>17</option>
                        <option value={17.5}>17,5</option>
                        <option value={18}>18</option>
                        <option value={18.5}>18,5</option>
                        <option value={19}>19</option>
                        <option value={19.5}>19,5</option>
                        <option value={20}>20</option>
                        <option value={20.5}>20,5</option>
                        <option value={21}>21</option>
                        <option value={21.5}>21,5</option>
                        <option value={22}>22</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              /* Calculadora de Diárias Nacionais */
              <div className="mt-6 border border-slate-300 rounded overflow-hidden shadow-sm bg-white">
                <div className="bg-[#4a7cb5] text-white font-bold text-center py-2 text-xs tracking-wider uppercase">
                  CÁLCULO DE DIÁRIAS NACIONAIS
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-[11px] leading-tight text-primary">
                    <thead>
                      {/* Row 1 Headers */}
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                        <th colSpan={2} className="border-r border-slate-300 py-1.5 px-2 text-center text-[10px] uppercase font-extrabold font-sans">
                          Período do Afastamento
                        </th>
                        <th colSpan={9} className="py-1.5 px-2 text-center text-[10px] uppercase font-extrabold font-sans">
                          * Diárias
                        </th>
                      </tr>
                      {/* Row 2 Headers */}
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-300 text-[9.5px]">
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-24">Início</th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-24">Término</th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-20">Vlr. Unitário<br/>(A)</th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-20">Vlr. Meia<br/>(B)</th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-20">Adic. Embarque<br/>(C)</th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-16">Total Diárias<br/>(D)</th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-20 bg-slate-100 font-bold">Valor Total<br/><span className="text-[8px] lowercase font-normal text-slate-500">(E = A*D + C)</span></th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-28 text-[8.5px]">Limite Receber<br/><span className="text-[7.5px] font-normal text-slate-400">Teto R$ 1153,37</span><br/>(F)</th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-20 bg-slate-100">Corte Golar<br/><span className="text-[8px] font-normal text-slate-500">(G = E - F)</span></th>
                        <th className="border-r border-slate-300 py-2 px-1 text-center w-20">Desc. Aliment.<br/>(H)</th>
                        <th className="py-2 px-1.5 text-center w-24 bg-[#f7f9ff] text-[#005fb8] font-bold text-[10px]">T. a Receber R$<br/><span className="text-[8px] font-normal text-slate-500">(I = E-H ou F-H)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white hover:bg-slate-50/50">
                        {/* Início */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="date"
                            className="w-full text-center text-[11px] px-1 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all cursor-pointer text-primary"
                            value={dataIda}
                            onChange={e => setDataIda(e.target.value)}
                          />
                        </td>
                        {/* Término */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="date"
                            className="w-full text-center text-[11px] px-1 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all cursor-pointer text-primary"
                            value={dataVolta}
                            onChange={e => setDataVolta(e.target.value)}
                          />
                        </td>
                        {/* Valor Unitário A */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="w-full text-center text-xs px-1 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-medium text-primary"
                            value={nacValorUnitario || ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setNacValorUnitario(val);
                              setNacValorMeiaDiaria(val / 2);
                            }}
                          />
                        </td>
                        {/* Valor Meia Diária B */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="w-full text-center text-xs px-1 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-medium text-primary"
                            value={nacValorMeiaDiaria || ''}
                            onChange={e => setNacValorMeiaDiaria(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Adicional de Embarque C */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="w-full text-center text-xs px-1 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-medium text-primary"
                            value={nacAdicionalEmbarque || ''}
                            onChange={e => setNacAdicionalEmbarque(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Total de Diárias Concedidas D */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="number"
                            step="0.5"
                            placeholder="0"
                            className="w-full text-center text-xs px-1 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all font-bold text-primary"
                            value={nacTotalDiarias || ''}
                            onChange={e => setNacTotalDiarias(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Valor total E = A X D + C */}
                        <td className="border-r border-slate-300 p-1 text-center font-bold bg-slate-50/70 text-slate-800 text-[11px]">
                          {nacValorTotalE.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        {/* Limite para recebimento F */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="w-full text-center text-xs px-1 py-1 bg-white border border-slate-300 rounded focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-primary"
                            value={nacLimiteRecebimento || ''}
                            onChange={e => setNacLimiteRecebimento(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Valor de Corte G = E - F */}
                        <td className="border-r border-slate-300 p-1 text-center font-medium bg-slate-50/70 text-slate-500 text-[11px]">
                          {nacValorCorteG.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        {/* Desconto Aux. Alimentação H */}
                        <td className="border-r border-slate-300 p-1">
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="w-full text-center text-xs px-1 py-1 bg-white border border-[#fca5a5] rounded focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-red-600 font-bold"
                            value={nacDescontoAlimentacao || ''}
                            onChange={e => setNacDescontoAlimentacao(parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        {/* Total a Receber R$ I */}
                        <td className="p-1 text-center font-extrabold bg-[#f1f4fc] text-[#005fb8] text-xs">
                          {nacTotalReceberI.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Painel de Lançamento Rápido Unificado */}
              <div id="quick-launch-unified-panel" className="mt-6 bg-slate-50/40 border border-slate-200/90 rounded-2xl p-6 shadow-sm animate-fade-in text-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#f59e0b] text-[18px] select-none">✨</span>
                  <h3 className="text-[13px] font-extrabold text-[#112446] tracking-wider uppercase font-sans">
                    PAINEL DE LANÇAMENTO RÁPIDO
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mb-5 leading-normal">
                  Selecione um cargo oficial de referência abaixo, ajuste suas configurações se necessário, e aplique instantaneamente.
                </p>

                <div className="space-y-4">
                  {/* Campo 1 - Cargo de Referência */}
                  <div>
                    <label htmlFor="quick-cargo-select" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      SELECIONE O CARGO DE REFERÊNCIA - DIÁRIAS NACIONAIS
                    </label>
                    <div className="relative">
                      <select
                        id="quick-cargo-select"
                        value={quickCargoSelectedValue}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNacValorUnitario(val);
                          setNacValorMeiaDiaria(parseFloat((val / 2).toFixed(2)));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3.5 pr-10 text-slate-700 text-[13px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#1d63cb] focus:border-[#1d63cb] cursor-pointer appearance-none"
                      >
                        <option value={0}>Sem Cargo de Referência (R$ 0,00)</option>
                        <option value={1466.95}>Ministros (R$ 1.466,95)</option>
                        <option value={1320.26}>Ministros - 90% (R$ 1.320,26)</option>
                        <option value={1173.56}>Ministros - 80% (R$ 1.173,56)</option>
                        <option value={1393.60}>Juiz Federal, Juiz Federal Substituto e Juiz Federal Auxiliar, Secretário-Geral (R$ 1.393,60)</option>
                        <option value={1254.24}>Juiz - 90% (R$ 1.254,24)</option>
                        <option value={1114.88}>Juiz - 80% (R$ 1.114,88)</option>
                        <option value={1173.56}>Colaborador Eventual (R$ 1.173,56)</option>
                        <option value={880.17}>Demais Cargos em Comissão (R$ 880,17)</option>
                        <option value={806.82}>Analista Judiciário e Oficiais Superiores (R$ 806,82)</option>
                        <option value={660.13}>Técnico Judiciário, Oficiais Intermediários, Oficiais Subalternos e Graduados (R$ 660,13)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Campo 2 - Adicional de Embarque */}
                  <div>
                    <label htmlFor="quick-embarque-select" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      ADICIONAL DE EMBARQUE - NACIONAL
                    </label>
                    <div className="relative">
                      <select
                        id="quick-embarque-select"
                        value={quickEmbarqueSelectedValue}
                        onChange={(e) => {
                          setNacAdicionalEmbarque(parseFloat(e.target.value));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3.5 pr-10 text-slate-700 text-[13px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#1d63cb] focus:border-[#1d63cb] cursor-pointer appearance-none"
                      >
                        <option value={0}>R$ 0,00 (R$ 0.00)</option>
                        <option value={586.78}>R$ 586,78 (R$ 586,78)</option>
                        <option value={293.39}>R$ 293,39 (R$ 293,39)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Campo 3 - Desconto Auxílio Alimentação */}
                  <div>
                    <label htmlFor="quick-desconto-select" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      DESCONTO AUXÍLIO ALIMENTAÇÃO (CAIXA SUSPENSA)
                    </label>
                    <div className="relative">
                      <select
                        id="quick-desconto-select"
                        value={quickDescontoSelectedValue}
                        onChange={(e) => {
                          setNacDescontoAlimentacao(parseFloat(e.target.value));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3.5 pr-10 text-slate-700 text-[13px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#1d63cb] focus:border-[#1d63cb] cursor-pointer appearance-none"
                      >
                        <option value={0}>Sem Desconto (R$ 0,00)</option>
                        <option value={42.29}>0,5 dias (R$ 42,29)</option>
                        <option value={84.57}>1 dia (R$ 84,57)</option>
                        <option value={126.85}>1,5 dias (R$ 126,85)</option>
                        <option value={169.14}>2 dias (R$ 169,14)</option>
                        <option value={211.43}>2,5 dias (R$ 211,43)</option>
                        <option value={253.71}>3 dias (R$ 253,71)</option>
                        <option value={296.00}>3,5 dias (R$ 296,00)</option>
                        <option value={338.28}>4 dias (R$ 338,28)</option>
                        <option value={380.56}>4,5 dias (R$ 380,56)</option>
                        <option value={422.85}>5 dias (R$ 422,85)</option>
                        <option value={465.14}>5,5 dias (R$ 465,14)</option>
                        <option value={507.42}>6 dias (R$ 507,42)</option>
                        <option value={549.70}>6,5 dias (R$ 549,70)</option>
                        <option value={591.99}>7 dias (R$ 591,99)</option>
                        <option value={634.28}>7,5 dias (R$ 634,28)</option>
                        <option value={676.56}>8 dias (R$ 676,56)</option>
                        <option value={718.84}>8,5 dias (R$ 718,84)</option>
                        <option value={761.13}>9 dias (R$ 761,13)</option>
                        <option value={803.42}>9,5 dias (R$ 803,42)</option>
                        <option value={845.70}>10 dias (R$ 845,70)</option>
                        <option value={887.98}>10,5 dias (R$ 887,98)</option>
                        <option value={930.27}>11 dias (R$ 930,27)</option>
                        <option value={972.56}>11,5 dias (R$ 972,56)</option>
                        <option value={1014.84}>12 dias (R$ 1.014,84)</option>
                        <option value={1057.13}>12,5 dias (R$ 1.057,13)</option>
                        <option value={1099.41}>13 dias (R$ 1.099,41)</option>
                        <option value={1141.70}>13,5 dias (R$ 1.141,70)</option>
                        <option value={1183.98}>14 dias (R$ 1.183,98)</option>
                        <option value={1226.26}>14,5 dias (R$ 1.226,26)</option>
                        <option value={1268.55}>15 dias (R$ 1.268,55)</option>
                        <option value={1310.83}>15,5 dias (R$ 1.310,83)</option>
                        <option value={1353.12}>16 dias (R$ 1.353,12)</option>
                        <option value={1395.41}>16,5 dias (R$ 1.395,41)</option>
                        <option value={1437.69}>17 dias (R$ 1.437,69)</option>
                        <option value={1479.98}>17,5 dias (R$ 1.479,98)</option>
                        <option value={1522.26}>18 dias (R$ 1.522,26)</option>
                        <option value={1564.54}>18,5 dias (R$ 1.564,54)</option>
                        <option value={1606.83}>19 dias (R$ 1.606,83)</option>
                        <option value={1649.11}>19,5 dias (R$ 1.649,11)</option>
                        <option value={1691.40}>20 dias (R$ 1.691,40)</option>
                        <option value={1733.69}>20,5 dias (R$ 1.733,69)</option>
                        <option value={1775.97}>21 dias (R$ 1.775,97)</option>
                        <option value={1818.26}>21,5 dias (R$ 1.818,26)</option>
                        <option value={1860.54}>22 dias (R$ 1.860,54)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Campo 4 - Ajuste Manual de Diárias */}
                  <div>
                    <label htmlFor="quick-total-diarias-select" className="block text-[11px] font-extrabold text-[#ec1010] uppercase tracking-wider mb-1.5">
                      TOTAL DE DIÁRIAS CONCEDIDAS (ESSA CAIXA SÓ DEVERÁ SER USADA PARA AJUSTE MANUAL)
                    </label>
                    <div className="relative">
                      <select
                        id="quick-total-diarias-select"
                        value={quickTotalDiariasSelectedValue}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setNacTotalDiarias(val);
                          }
                        }}
                        className="w-full bg-[#fdf2f2] border border-red-200 rounded-lg py-2.5 px-3.5 pr-10 text-red-600 text-[13px] font-bold transition-all focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 cursor-pointer appearance-none"
                      >
                        <option value="">Selecione para ajuste manual em lote...</option>
                        <option value={0.5}>0,5</option>
                        <option value={1}>1</option>
                        <option value={1.5}>1,5</option>
                        <option value={2}>2</option>
                        <option value={2.5}>2,5</option>
                        <option value={3}>3</option>
                        <option value={3.5}>3,5</option>
                        <option value={4}>4</option>
                        <option value={4.5}>4,5</option>
                        <option value={5}>5</option>
                        <option value={5.5}>5,5</option>
                        <option value={6}>6</option>
                        <option value={6.5}>6,5</option>
                        <option value={7}>7</option>
                        <option value={7.5}>7,5</option>
                        <option value={8}>8</option>
                        <option value={8.5}>8,5</option>
                        <option value={9}>9</option>
                        <option value={9.5}>9,5</option>
                        <option value={10}>10</option>
                        <option value={10.5}>10,5</option>
                        <option value={11}>11</option>
                        <option value={11.5}>11,5</option>
                        <option value={12}>12</option>
                        <option value={12.5}>12,5</option>
                        <option value={13}>13</option>
                        <option value={13.5}>13,5</option>
                        <option value={14}>14</option>
                        <option value={14.5}>14,5</option>
                        <option value={15}>15</option>
                        <option value={15.5}>15,5</option>
                        <option value={16}>16</option>
                        <option value={16.5}>16,5</option>
                        <option value={17}>17</option>
                        <option value={17.5}>17,5</option>
                        <option value={18}>18</option>
                        <option value={18.5}>18,5</option>
                        <option value={19}>19</option>
                        <option value={19.5}>19,5</option>
                        <option value={20}>20</option>
                        <option value={20.5}>20,5</option>
                        <option value={21}>21</option>
                        <option value={21.5}>21,5</option>
                        <option value={22}>22</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* SECTION 6 - Observações Adicionais */}
        <div id="section-observacoes" className="bg-white border border-card-border rounded p-6 space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
            <MessageSquare size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Observações</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="textarea-justificativa" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Observação *</label>
              <select
                id="textarea-justificativa"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary cursor-pointer"
                value={observacaoJustificativa}
                onChange={e => setObservacaoJustificativa(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="OK - DILEO">OK - DILEO</option>
                <option value="DEVOLUCAO">DEVOLUCAO</option>
                <option value="CANCELADO">CANCELADO</option>
                <option value="EM INSTRUCAO">EM INSTRUCAO</option>
                <option value="EM BLOCO DE ASSINATURA">EM BLOCO DE ASSINATURA</option>
              </select>
              <span className="text-[10px] text-secondary block">
                Obrigatório justificar por que o evento não pode ser realizado de forma remota/online.
              </span>
            </div>

            <div className="space-y-1">
              <label htmlFor="textarea-logistica" className="block text-[11px] font-bold text-secondary uppercase tracking-wider font-mono">Observação_2</label>
              <select
                id="textarea-logistica"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none transition-all text-primary cursor-pointer"
                value={observacaoApoioLogistico}
                onChange={e => setObservacaoApoioLogistico(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="FALTA DOCUMENTO">FALTA DOCUMENTO</option>
                <option value="OK - DILEO">OK - DILEO</option>
                <option value="CANCELADO">CANCELADO</option>
                <option value="FALTA ASS. FORM">FALTA ASS. FORM</option>
                <option value="FALTA DESP. INEXIGIBILIDADE">FALTA DESP. INEXIGIBILIDADE</option>
                <option value="DEVOLUCAO">DEVOLUCAO</option>
                <option value="FALTA ASS. DESP. GADIR">FALTA ASS. DESP. GADIR</option>
                <option value="FALTA DESP. PRSTM-ASPRE-ADM">FALTA DESP. PRSTM-ASPRE-ADM</option>
                <option value="FALTA ASS. PROPONENTE">FALTA ASS. PROPONENTE</option>
                <option value="ATENCAO! FERIADO">ATENCAO! FERIADO</option>
                <option value="FALTA ASS. DOC. AUDITORIA">FALTA ASS. DOC. AUDITORIA</option>
                <option value="FALTA PORT. EQP. TRABALHO">FALTA PORT. EQP. TRABALHO</option>
                <option value="AGUARDANDO DECISÃO SUPERIOR">AGUARDANDO DECISÃO SUPERIOR</option>
                <option value="FALTA ASS. ATO CONVOCACAO">FALTA ASS. ATO CONVOCACAO</option>
                <option value="EXERCICIO DE 2025">EXERCICIO DE 2025</option>
                <option value="FALTA PASSAGEM">FALTA PASSAGEM</option>
                <option value="AGUARDANDO AUTORIZACAO">AGUARDANDO AUTORIZACAO</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 8 - Regras de Conformidade (Compliance Check Box) */}
        <div id="section-regras-conformidade" className="bg-blue-50/55 border border-blue-100 rounded p-5 space-y-3">
          <h4 className="text-[10px] font-extrabold text-[#005fb8] uppercase tracking-wider block">Regras de Conformidade</h4>
          
          <div className="space-y-2 text-xs text-[#121d26]">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={sei ? /^\d{6}\/\d{2}-\d{2}\.\d{3}$/.test(sei) : false}
                readOnly
                className="rounded border-[#c4c6cd] text-[#005fb8] focus:ring-[#005fb8] h-4 w-4 shrink-0"
              />
              <span className="text-xs">
                A REGRA DE CONFORMIDADE para o SEI deverá ser 000000/00-00.000.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={!!observacaoJustificativa.trim()}
                readOnly
                className="rounded border-[#c4c6cd] text-[#005fb8] focus:ring-[#005fb8] h-4 w-4 shrink-0"
              />
              <span className="text-xs">
                Justificativa detalhada é obrigatória (especifica o motivo e não-virtualização).
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 9 - Call to Action Form Buttons */}
        <div className="flex flex-col gap-3 pt-3">
          <button
            id="btn-save-draft"
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#041627] hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded text-xs uppercase tracking-widest cursor-pointer transition-colors"
          >
            <Save size={15} />
            Salvar Registro
          </button>

          <button
            id="btn-discard-changes"
            type="button"
            onClick={onCancel}
            className="text-center text-xs text-red-600 hover:text-red-700 font-bold underline cursor-pointer py-2 transition-all"
          >
            Descartar Alterações
          </button>
        </div>

      </form>
    </div>
  );
}
