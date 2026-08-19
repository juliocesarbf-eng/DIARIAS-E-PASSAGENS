import React from 'react';
import { TravelRequest } from '../types';
import { 
  X, 
  Printer, 
  MapPin, 
  Calendar, 
  Compass, 
  FileCheck, 
  DollarSign, 
  Award,
  ChevronRight,
  Stamp,
  Trash2
} from 'lucide-react';

interface RequestDetailsModalProps {
  request: TravelRequest;
  onClose: () => void;
  onDuplicate: (request: TravelRequest) => void;
  onEdit: (request: TravelRequest) => void;
  onDelete?: (id: string) => void;
}

export default function RequestDetailsModal({
  request,
  onClose,
  onDuplicate,
  onEdit,
  onDelete
}: RequestDetailsModalProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="modal-backdrop" className="fixed inset-0 bg-[#041627]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        id="modal-content" 
        className="bg-white rounded w-full max-w-2xl border-t-4 border-primary shadow-2xl overflow-hidden print:border-0 print:shadow-none print:my-0"
      >
        {/* Header toolbar (Hidden in print) */}
        <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-card-border print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#005fb8] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded">
              Recibo Eletrônico
            </span>
            <span className="text-xs font-mono font-medium text-secondary">{request.sei}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-primary hover:bg-slate-200 bg-slate-100 border border-card-border px-3 py-1.5 rounded font-bold cursor-pointer transition-colors"
            >
              <Printer size={13} />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-secondary hover:bg-slate-200 rounded cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Content */}
        <div className="p-8 space-y-6 print:p-0">
          
          {/* Institutional Stamp Header */}
          <div className="text-center space-y-1.5 border-b border-card-border pb-5">
            <div className="font-extrabold text-sm text-primary tracking-widest uppercase">
              Conselho de Justiça Militar do Distrito Federal
            </div>
            <div className="font-bold text-xs text-secondary tracking-widest uppercase">
              Superior Tribunal Militar • Ministério da Defesa
            </div>
            <h1 className="text-base font-extrabold text-primary uppercase mt-3 tracking-snug">
              Relatório de Solicitação de Viagem e Empenho de Diárias
            </h1>
          </div>

          {/* Core metadata: ID & Process Status Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded border border-card-border">
            <div className="space-y-1.5">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Processo Registrado:</span>
              <span className="font-mono text-xs font-extrabold text-primary block">{request.sei}</span>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Status de Tramitação:</span>
              <span className={`inline-block px-3.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider border
                ${request.status === 'Aprovado' ? 'bg-success-bg text-success-text border-green-200' : ''}
                ${request.status === 'Pendente' ? 'bg-pending-bg text-pending-text border-amber-200' : ''}
                ${request.status === 'Rascunho' ? 'bg-draft-bg text-draft-text border-gray-300' : ''}
                ${request.status === 'Rejeitado' ? 'bg-error-bg text-error-text border-red-200' : ''}
              `}>
                {request.status}
              </span>
            </div>
          </div>

          {/* Form sections visual hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            
            {/* Passenger Data Card */}
            <div className="space-y-3">
              <h4 className="font-bold text-primary border-b border-card-border pb-1 text-[11px] uppercase tracking-wider">Dados do Passageiro e Cargo</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Nome Completo</span>
                  <span className="text-primary font-bold">{request.nome}</span>
                </div>
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Cargo / Função</span>
                  <span className="text-primary font-medium">{request.cargo || 'Não especificado'}</span>
                </div>
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Lotação Setorial</span>
                  <span className="text-primary font-medium">{request.lotacao || 'Não especificado'}</span>
                </div>
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Afastado por Férias?</span>
                  <span className="text-primary font-medium">{request.ferias}</span>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="space-y-3">
              <h4 className="font-bold text-primary border-b border-card-border pb-1 text-[11px] uppercase tracking-wider">Demarcação da Missão</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Atividade / Missão</span>
                  <span className="text-primary font-bold">{request.evento}</span>
                </div>
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Classificação</span>
                  <span className="text-primary font-medium">{request.tipoEvento}</span>
                </div>
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Cota d'Unidade Gestora</span>
                  <span className="text-primary font-medium font-mono">{request.cota || 'Verba Geral Ordinária'}</span>
                </div>
                <div>
                  <span className="text-secondary font-semibold block uppercase text-[10px]">Data do Registro</span>
                  <span className="text-primary font-medium">{new Date(request.dataCriacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Itinerary Vertical Timeline */}
          <div className="space-y-3 border-t border-card-border pt-4">
            <h4 className="font-bold text-primary text-[11px] uppercase tracking-wider mb-2">Descrição Detalhada do Itinerário</h4>
            
            <div className="relative pl-6 space-y-4">
              {/* timeline vertical rule */}
              <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-slate-200"></div>

              {/* IDA point */}
              <div className="relative">
                <div className="absolute -left-[23px] top-0.5 bg-[#005fb8] text-white rounded-full p-0.5 h-4 w-4 flex items-center justify-center font-extrabold text-[8px]">
                  1
                </div>
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">TRECHO IDA (EMBARQUE)</span>
                  <span className="text-primary font-bold block">{request.origemDestinoIda}</span>
                  <span className="text-xs text-secondary font-medium font-mono block mt-0.5">
                    📅 {new Date(request.dataIda).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* VOLTA point */}
              <div className="relative">
                <div className="absolute -left-[23px] top-0.5 bg-primary text-white rounded-full p-0.5 h-4 w-4 flex items-center justify-center font-extrabold text-[8px]">
                  2
                </div>
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">TRECHO VOLTA (RETORNO / DESEMBARQUE)</span>
                  <span className="text-primary font-bold block">{request.destinoRetornoVolta}</span>
                  <span className="text-xs text-secondary font-medium font-mono block mt-0.5">
                    📅 {new Date(request.dataVolta).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Finance details */}
          <div className="border-t border-card-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 self-center">
              <span className="text-secondary font-bold uppercase text-[10px] tracking-wider block">Cálculo de Diárias da Administração</span>
              <div className="text-xs text-primary font-medium">
                Quantidade de Diárias: <strong className="text-[#005fb8]">{request.qtdeDiarias} diárias</strong>
              </div>
              <div className="text-xs text-secondary mt-0.5">
                Tipo de Viagem: <strong className="text-primary">{request.internacionais === 'Sim' ? 'INTERNACIONAL' : 'NACIONAL'}</strong>
              </div>
            </div>

            <div className="bg-slate-50 border border-card-border p-4 rounded text-right self-center">
              <span className="text-secondary font-bold uppercase text-[10px] tracking-wider block mb-1">Custo Total de Diárias</span>
              <span className="text-[#041627] font-extrabold text-lg block font-mono">
                {request.valorRs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-[#595f64] block mt-1">Lançado sob empenho orçamentário s/ ônus extra</span>
            </div>
          </div>

          {/* Justifications */}
          <div className="border-t border-card-border pt-4 space-y-3 text-xs">
            {request.observacaoJustificativa && (
              <div>
                <span className="text-secondary font-bold uppercase text-[10px] tracking-wider block mb-1">Observação</span>
                <p className="bg-slate-50 p-3 rounded text-slate-800 leading-relaxed italic border-l-4 border-slate-300">
                  "{request.observacaoJustificativa}"
                </p>
              </div>
            )}

            {request.observacaoApoioLogistico && (
              <div className="mt-2">
                <span className="text-secondary font-bold uppercase text-[10px] tracking-wider block mb-1 font-mono">Observação_2</span>
                <p className="text-slate-800 leading-relaxed font-mono text-[11px] bg-slate-50/50 p-2 border border-slate-200 rounded">
                  {request.observacaoApoioLogistico}
                </p>
              </div>
            )}
          </div>

          {/* Formal Stamp (Visible in print/Authorized modes) */}
          {request.status === 'Aprovado' && (
            <div className="flex justify-end pt-4 print:pt-12">
              <div className="border-2 border-emerald-600/40 text-emerald-700 bg-emerald-50/30 font-bold p-3 rounded-sm flex items-center gap-3.5 max-w-sm rotate-[-2deg]">
                <Stamp size={32} className="text-emerald-600 shrink-0 opacity-80" />
                <div className="text-[10px] uppercase font-mono tracking-wider space-y-0.5">
                  <div className="font-extrabold text-emerald-800">DOCUMENTO HOMOLOGADO</div>
                  <div>STM PORTARIA AUTOMÁTICA</div>
                  <div>AUTENTICAÇÃO: <span className="font-extrabold">{request.sei}-SEC-2026</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action footer (Hidden in print) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-card-border flex justify-between gap-3 print:hidden">
          <div className="flex gap-2">
            {(request.status === 'Rascunho' || request.status === 'Pendente') && (
              <button
                onClick={() => {
                  onEdit(request);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-blue-700 hover:bg-blue-100 bg-blue-50 border border-blue-200 px-3 py-2 rounded font-bold cursor-pointer transition-colors"
              >
                Editar Processo
              </button>
            )}

            <button
              onClick={() => {
                onDuplicate(request);
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded font-bold cursor-pointer transition-colors"
            >
              Duplicar Processo
            </button>

            {onDelete && (
              showConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded">
                  <span className="text-xs font-bold text-red-800">Confirmar exclusão?</span>
                  <button
                    onClick={() => {
                      onDelete(request.id);
                      onClose();
                    }}
                    className="text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    Sim, apagar
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  id="btn-modal-delete"
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-1.5 text-xs text-red-700 hover:bg-red-100 bg-red-50 border border-red-200 px-3 py-2 rounded font-bold cursor-pointer transition-colors"
                >
                  <Trash2 size={13} />
                  Apagar Solicitação
                </button>
              )
            )}
          </div>

          <button
            onClick={onClose}
            className="text-xs bg-[#041627] hover:bg-slate-900 text-white px-4 py-2 rounded font-bold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
