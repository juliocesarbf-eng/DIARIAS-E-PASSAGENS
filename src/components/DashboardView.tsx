import React, { useMemo } from 'react';
import { TravelRequest } from '../types';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileText, 
  PlaneTakeoff, 
  DollarSign, 
  Plus, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';

interface DashboardViewProps {
  requests: TravelRequest[];
  onNavigateToNewRequest: () => void;
  onViewRequest: (request: TravelRequest) => void;
}

export default function DashboardView({ 
  requests, 
  onNavigateToNewRequest, 
  onViewRequest 
}: DashboardViewProps) {
  
  const stats = useMemo(() => {
    const approved = requests.filter(r => r.status === 'Aprovado');
    const pending = requests.filter(r => r.status === 'Pendente');
    const drafts = requests.filter(r => r.status === 'Rascunho');
    
    const investment = approved.reduce((sum, r) => sum + r.valorRs, 0) + 
      pending.reduce((sum, r) => sum + r.valorRs, 0);
      
    const totalDiarias = approved.reduce((sum, r) => sum + r.qtdeDiarias, 0) + 
      pending.reduce((sum, r) => sum + r.qtdeDiarias, 0);

    return {
      total: requests.length,
      approved: approved.length,
      pending: pending.length,
      drafts: drafts.length,
      investment,
      totalDiarias
    };
  }, [requests]);

  // Alert system for upcoming travel compliance checks
  const urgentAlerteCount = useMemo(() => {
    return requests.filter(r => {
      if (r.status !== 'Pendente') return false;
      // Check if start date is less than 15 days from now
      const today = new Date('2026-06-11');
      const travelDate = new Date(r.dataIda);
      const diffTime = travelDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays < 15;
    }).length;
  }, [requests]);

  // Distribution by event type
  const eventTypeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    requests.forEach(r => {
      if (r.tipoEvento) {
        dist[r.tipoEvento] = (dist[r.tipoEvento] || 0) + 1;
      }
    });
    return dist;
  }, [requests]);

  return (
    <div id="dashboard-view-container" className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-card-border rounded shadow-xs">
        <div>
          <span className="text-xs font-semibold text-secondary tracking-widest uppercase">
            Superior Tribunal Militar • Painel de Controle
          </span>
          <h1 className="text-2xl font-bold text-primary tracking-tight mt-1">
            Gestão de Diárias e Passagens
          </h1>
          <p className="text-sm text-secondary mt-1">
            Bem-vindo ao portal institucional. Controle, conformidade e transparência em viagens institucionais.
          </p>
        </div>
        
        <button
          id="btn-quick-new-request"
          onClick={onNavigateToNewRequest}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Novo Registro
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 - Total Investment */}
        <div className="bg-white p-5 border border-card-border rounded flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
              Investimento Total Autorizado
            </span>
            <span id="stat-investment-total" className="text-2xl font-bold text-primary block mt-1">
              {stats.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-secondary mt-1 block">
              Total provido e pendente de empenho
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-full">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Stat 2 - Per Diems */}
        <div className="bg-white p-5 border border-card-border rounded flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
              Total de Diárias Solicitadas
            </span>
            <span id="stat-diarias-count" className="text-2xl font-bold text-primary block mt-1">
              {stats.totalDiarias}
            </span>
            <span className="text-xs text-secondary mt-1 block">
              Média de {stats.total === 0 ? 0 : (stats.totalDiarias / stats.total).toFixed(1)} diárias por trecho
            </span>
          </div>
          <div className="bg-blue-50 text-brand-blue p-3 rounded-full">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Stat 3 - Pending Appr */}
        <div className="bg-white p-5 border border-card-border rounded flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
              Tramitações Pendentes
            </span>
            <span id="stat-pending-count" className="text-2xl font-bold text-amber-600 block mt-1">
              {stats.pending}
            </span>
            <span className="text-xs text-secondary mt-1 block">
              Aguardando parecer de chefia
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-full">
            <Clock size={24} />
          </div>
        </div>

        {/* Stat 4 - Approved Docs */}
        <div className="bg-white p-5 border border-card-border rounded flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
              Solicitações Concluídas
            </span>
            <span id="stat-approved-count" className="text-2xl font-bold text-emerald-600 block mt-1">
              {stats.approved}
            </span>
            <span className="text-xs text-secondary mt-1 block">
              Publicadas no boletim de serviço
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Compliance / System alerts panel */}
      {urgentAlerteCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded p-4 flex gap-3 items-start">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Alerta de Conformidade de Viagem urgente</h4>
            <p className="text-xs text-amber-800 mt-1">
              Existem <strong>{urgentAlerteCount}</strong> solicitações pendentes cuja data de embarque é inferior a 15 dias. Lembre-se: justificativas detalhadas e autorização especial de diretoria são exigidas para emissões com prazo reduzido.
            </p>
          </div>
        </div>
      )}

      {/* Bottom section with charts/tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Travel Itineraries */}
        <div className="lg:col-span-2 bg-white border border-card-border rounded p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-primary">Viagens Institucionais Recentes</h3>
            <span className="text-xs font-medium text-secondary">Acompanhamento de processos</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-bg border-b border-card-border">
                  <th className="p-3 font-semibold text-secondary uppercase tracking-wider">Processo / SEI</th>
                  <th className="p-3 font-semibold text-secondary uppercase tracking-wider">Passageiro / Cargo</th>
                  <th className="p-3 font-semibold text-secondary uppercase tracking-wider">Destino / Período</th>
                  <th className="p-3 font-semibold text-secondary uppercase tracking-wider text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-secondary">
                      Nenhuma solicitação de viagem encontrada no sistema.
                    </td>
                  </tr>
                ) : (
                  requests.slice(0, 5).map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => onViewRequest(req)}
                      className="border-b border-card-border hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-medium text-primary">
                        <div className="font-mono text-xs">{req.sei}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-primary">{req.nome}</div>
                        <div className="text-[10px] text-secondary">{req.cargo}</div>
                      </td>
                      <td className="p-3 text-secondary">
                        <div className="flex items-center gap-1 font-medium text-primary">
                          <MapPin size={10} className="text-pink-600 shrink-0" />
                          <span>{req.origemDestinoIda.split(' - ')[1] || req.origemDestinoIda}</span>
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {new Date(req.dataIda).toLocaleDateString('pt-BR')} a {new Date(req.dataVolta).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold text-primary">
                        {req.valorRs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 col: Distribution graph */}
        <div className="bg-white border border-card-border rounded p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-primary mb-1">Missões por Categoria</h3>
            <p className="text-xs text-secondary mb-4">Mapeamento estrutural de demandas administrativas</p>
            
            <div className="space-y-4">
              {Object.entries(eventTypeDistribution).map(([type, count]) => {
                const countNum = count as number;
                const percentage = requests.length > 0 ? (countNum / requests.length) * 100 : 0;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-primary">{type}</span>
                      <span className="text-secondary font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-card-border pt-4 mt-6">
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded text-[11px] text-secondary">
              <FileText className="text-primary shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold block text-primary mb-0.5">Segurança Jurídica integrada</span>
                Todas as reservas automáticas operam sob conformidade direta da Portaria Corregedora GP e das normas do Conselho de Justiça Militar.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
