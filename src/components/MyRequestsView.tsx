import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TravelRequest } from '../types';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Edit, 
  Copy, 
  Trash2, 
  ExternalLink,
  Download,
  Filter,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';

interface MyRequestsViewProps {
  requests: TravelRequest[];
  onViewDetails: (request: TravelRequest) => void;
  onEditDraft: (request: TravelRequest) => void;
  onDuplicate: (request: TravelRequest) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function MyRequestsView({
  requests,
  onViewDetails,
  onEditDraft,
  onDuplicate,
  onDelete,
  onClearAll
}: MyRequestsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'dataIda'>('dataIda');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Dynamically extract available months from the requests for the filter dropdown
  const availableMonths = useMemo(() => {
    const list: { key: string; label: string; yearNum: number; monthNum: number }[] = [];
    const seen = new Set<string>();

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    requests.forEach(req => {
      if (!req.dataIda) return;
      // Handle YYYY-MM-DD or other dash separated dates
      const dateParts = req.dataIda.split('-');
      if (dateParts.length >= 2) {
        const year = dateParts[0];
        const month = dateParts[1];
        const key = `${year}-${month}`;
        if (!seen.has(key)) {
          seen.add(key);
          const monthIdx = parseInt(month) - 1;
          const monthName = monthNames[monthIdx] || month;
          list.push({
            key,
            label: `${monthName}/${year}`,
            yearNum: parseInt(year),
            monthNum: parseInt(month)
          });
        }
      }
    });

    // Sort chronologically descending
    list.sort((a, b) => {
      if (a.yearNum !== b.yearNum) {
        return b.yearNum - a.yearNum;
      }
      return b.monthNum - a.monthNum;
    });

    return list;
  }, [requests]);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Filter by search text
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => {
        const tipo = r.internacionais === 'Sim' ? 'internacional' : 'nacional';
        return (
          (r.sei || '').toLowerCase().includes(term) ||
          (r.formulario || '').toLowerCase().includes(term) ||
          (r.nome || '').toLowerCase().includes(term) ||
          (r.lotacao || '').toLowerCase().includes(term) ||
          (r.cota || '').toLowerCase().includes(term) ||
          tipo.includes(term)
        );
      });
    }

    // Filter by selected month (e.g. "2026-06")
    if (selectedMonth !== 'all') {
      result = result.filter(r => {
        if (!r.dataIda) return false;
        return r.dataIda.startsWith(selectedMonth);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dataIda') {
        const valA = a.dataIda || '';
        const valB = b.dataIda || '';
        if (!valA && !valB) return 0;
        if (!valA) return 1; // Coloca itens sem dataIda no final da lista
        if (!valB) return -1; // Coloca itens sem dataIda no final da lista
        return valA.localeCompare(valB);
      } else {
        // ID / chronological creation descending default
        return b.id.localeCompare(a.id);
      }
    });

    return result;
  }, [requests, searchTerm, sortBy, selectedMonth]);

  // Export to Excel .xlsx download using fully filtered data
  const handleExportData = () => {
    // Map requests into readable spreadsheet columns
    const wsData = filteredRequests.map(req => ({
      "Portaria": req.portaria || '',
      "Processo SEI": req.sei || '',
      "Formulário": req.formulario || '',
      "Férias": req.ferias || 'Não',
      "Nome": req.nome || '',
      "Cargo": req.cargo || '',
      "Lotação": req.lotacao || '',
      "Evento": req.evento || '',
      "Tipo de Evento": req.tipoEvento || '',
      "Trecho Ida": req.origemDestinoIda || '',
      "Data Ida": req.dataIda ? new Date(req.dataIda).toLocaleDateString('pt-BR') : '',
      "Trecho Volta": req.destinoRetornoVolta || '',
      "Data Volta": req.dataVolta ? new Date(req.dataVolta).toLocaleDateString('pt-BR') : '',
      "Cota": req.cota || '',
      "Tipo": req.internacionais === 'Sim' ? 'INTERNACIONAL' : 'NACIONAL',
      "Quantidade de Diárias": req.qtdeDiarias || 0,
      "Valor (R$)": req.valorRs || 0,
      "Observação": req.observacaoJustificativa || '',
      "Observação_2": req.observacaoApoioLogistico || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitações ");
    
    // Write and trigger browser download
    XLSX.writeFile(workbook, "Controle de Diarias.xlsx");
  };

  // Export to PDF using jsPDF and jspdf-autotable with fully filtered data
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Title & Metadata
    doc.setFontSize(14);
    doc.text("Relatório de Diárias", 14, 15);
    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 21);
    
    // Define table columns
    const columns = [
      { header: 'Portaria', dataKey: 'portaria' },
      { header: 'Nome', dataKey: 'nome' },
      { header: 'Cargo', dataKey: 'cargo' },
      { header: 'Evento', dataKey: 'evento' },
      { header: 'Trecho Ida', dataKey: 'origemDestinoIda' },
      { header: 'Trecho Volta', dataKey: 'destinoRetornoVolta' },
      { header: 'Data Ida', dataKey: 'dataIda' },
      { header: 'Data Volta', dataKey: 'dataVolta' },
      { header: 'Tipo', dataKey: 'internacionais' },
      { header: 'Valor', dataKey: 'valor' },
    ];

    const rows = filteredRequests.map(req => ({
      portaria: req.portaria || '-',
      nome: req.nome || '-',
      cargo: req.cargo || '-',
      evento: req.evento || '-',
      origemDestinoIda: req.origemDestinoIda || '-',
      destinoRetornoVolta: req.destinoRetornoVolta || '-',
      dataIda: req.dataIda ? new Date(req.dataIda).toLocaleDateString('pt-BR') : '-',
      dataVolta: req.dataVolta ? new Date(req.dataVolta).toLocaleDateString('pt-BR') : '-',
      internacionais: req.internacionais === 'Sim' ? 'INTERNACIONAL' : 'NACIONAL',
      valor: (req.valorRs || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    }));

    autoTable(doc, {
      startY: 26,
      columns,
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [4, 22, 39], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save("Controle de Diarias.pdf");
  };

  return (
    <div id="my-requests-container" className="space-y-6">
      
      {/* Search and export header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-primary">Diárias Cadastradas</h2>
          <p className="text-xs text-secondary mt-0.5">
            Gestão unificada de processos e diárias autorizadas.
            {filteredRequests.length !== requests.length ? (
              <span className="ml-1 text-primary font-semibold">
                (Filtrado: exibindo {filteredRequests.length} de {requests.length})
              </span>
            ) : (
              <span className="ml-1 text-slate-400 font-medium">
                (Total: {requests.length} solicitações)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            id="btn-export-reports"
            onClick={handleExportData}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-primary border border-card-border px-3.5 py-2 rounded text-xs font-bold transition-colors cursor-pointer"
          >
            <Download size={14} />
            Exportar Dados (.xlsx)
          </button>
          
          <button
            id="btn-export-pdf"
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-[#9f1239] border border-rose-200 px-3.5 py-2 rounded text-xs font-bold transition-colors cursor-pointer"
          >
            <FileText size={14} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Search and sorting bar with Month Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-4 border border-card-border rounded shadow-xs">
        {/* Search input */}
        <div className="lg:col-span-6 relative">
          <span className="absolute left-3 top-3 text-secondary">
            <Search size={15} />
          </span>
          <input
            id="search-requests-input"
            type="text"
            placeholder="Buscar por Processo SEI, Formulário, Nome, Lotação, Cota, Tipo..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-card-border rounded focus:bg-white focus:border-primary outline-none transition-all text-primary font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Month Filter */}
        <div className="lg:col-span-3 flex gap-2 items-center">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider shrink-0">Mês:</span>
          <select
            id="month-filter-select"
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-card-border rounded focus:bg-white outline-none text-primary cursor-pointer font-medium"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="all">Todos os meses</option>
            {availableMonths.map(month => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="lg:col-span-3 flex gap-2 items-center">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider shrink-0">Ordenar:</span>
          <select
            id="sort-requests-select"
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-card-border rounded focus:bg-white outline-none text-primary cursor-pointer font-medium"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="dataIda">Data Crescente</option>
          </select>
        </div>
      </div>

      {/* Requests output container */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-card-border rounded p-12 text-center text-slate-500">
          <AlertCircle className="mx-auto text-secondary mb-3" size={32} />
          <h3 className="font-bold text-sm text-primary">Nenhum processo cadastrado</h3>
          <p className="text-xs text-secondary mt-1">Experimente alterar os filtros de busca acima.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-neutral-300 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[11px] border-collapse border border-neutral-300 table-fixed min-w-[1550px]">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-800 font-bold text-[10.5px]">
                    <th className="p-2 w-[75px] border border-neutral-300 whitespace-normal break-all align-middle text-center">Portaria</th>
                    <th className="p-2 w-[100px] border border-neutral-300 whitespace-normal break-all align-middle text-center">Processo SEI</th>
                    <th className="p-2 w-[85px] border border-neutral-300 whitespace-normal break-all align-middle text-center">Formulário</th>
                    <th className="p-2 w-[55px] border border-neutral-300 whitespace-normal align-middle text-center">Férias</th>
                    <th className="p-2 w-[110px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Nome</th>
                    <th className="p-2 w-[90px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Cargo</th>
                    <th className="p-2 w-[85px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Lotação</th>
                    <th className="p-2 w-[160px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Evento</th>
                    <th className="p-2 w-[90px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Tipo de Evento</th>
                    <th className="p-2 w-[100px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Trecho Ida</th>
                    <th className="p-2 w-[100px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Trecho Volta</th>
                    <th className="p-2 w-[80px] border border-neutral-300 whitespace-normal align-middle text-center">Data Ida</th>
                    <th className="p-2 w-[80px] border border-neutral-300 whitespace-normal align-middle text-center">Data Volta</th>
                    <th className="p-2 w-[95px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Cota</th>
                    <th className="p-2 w-[105px] border border-neutral-300 whitespace-normal align-middle text-center">Tipo</th>
                    <th className="p-2 w-[75px] border border-neutral-300 whitespace-normal align-middle text-center">Quantidade de Diárias</th>
                    <th className="p-2 w-[65px] border border-neutral-300 whitespace-normal align-middle text-center">Valor (R$)</th>
                    <th className="p-2 w-[60px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Observação</th>
                    <th className="p-2 w-[60px] border border-neutral-300 whitespace-normal break-words align-middle text-center">Observação_2</th>
                    <th className="p-2 w-[110px] border border-neutral-300 text-center sticky right-0 bg-neutral-50 shadow-[-4px_0_12px_rgba(0,0,0,0.08)] align-middle">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] font-normal whitespace-normal break-all align-middle text-center">{req.portaria || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] font-normal whitespace-normal break-all align-middle text-center">{req.sei || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-all align-middle text-center">{req.formulario || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal align-middle text-center">{req.ferias || 'Não'}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] font-normal whitespace-normal break-words align-middle text-center">{req.nome || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">{req.cargo || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">{req.lotacao || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">{req.evento || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">{req.tipoEvento || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">{req.origemDestinoIda || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">{req.destinoRetornoVolta || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] align-middle text-center">
                        {req.dataIda ? new Date(req.dataIda).toLocaleDateString('pt-BR') : ''}
                      </td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] align-middle text-center">
                        {req.dataVolta ? new Date(req.dataVolta).toLocaleDateString('pt-BR') : ''}
                      </td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">{req.cota || ''}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] align-middle text-center uppercase font-normal">
                        {req.internacionais === 'Sim' ? 'INTERNACIONAL' : 'NACIONAL'}
                      </td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] text-center font-normal">{req.qtdeDiarias || 0}</td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] text-center font-normal">
                        {(req.valorRs || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">
                        {req.observacaoJustificativa || ''}
                      </td>
                      <td className="p-2 border border-neutral-300 text-neutral-800 text-[11px] whitespace-normal break-words align-middle text-center">
                        {req.observacaoApoioLogistico || ''}
                      </td>
                      <td className="p-2 border border-neutral-300 text-center sticky right-0 bg-white hover:bg-slate-50 shadow-[-4px_0_12px_rgba(0,0,0,0.08)] align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View process detail (always visible) */}
                          <button
                            onClick={() => onViewDetails(req)}
                            title="Visualizar Detalhes"
                            className="p-1.5 text-primary hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <ExternalLink size={14} />
                          </button>

                          {/* Edit (only if Pendente or Rascunho) */}
                          {req.status === 'Pendente' || req.status === 'Rascunho' ? (
                            <button
                              onClick={() => onEditDraft(req)}
                              title="Editar Processo"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          ) : (
                            <div className="w-7"></div> // fixed spacing
                          )}

                          {/* Duplicate (highly useful!) */}
                          <button
                            onClick={() => onDuplicate(req)}
                            title="Duplicar Processo"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                          >
                            <Copy size={14} />
                          </button>

                          {/* Delete draft or request */}
                          {deletingId === req.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded border border-red-200">
                              <span className="text-[9px] font-bold text-red-800">Apagar?</span>
                              <button
                                onClick={() => {
                                  onDelete(req.id);
                                  setDeletingId(null);
                                }}
                                className="text-[10px] font-extrabold text-white bg-red-600 hover:bg-red-700 px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(req.id)}
                              title="Apagar solicitação"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Reflow Cards (styled as per Guidelines) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredRequests.map(req => (
              <div 
                key={req.id} 
                className="bg-white border border-card-border rounded p-4 space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-bold font-mono text-primary">{req.sei || 'Sem SEI'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Portaria:</div>
                    <div className="text-primary font-medium">{req.portaria || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Formulário:</div>
                    <div className="text-primary font-medium">{req.formulario || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Férias:</div>
                    <div className="text-primary font-medium">{req.ferias || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Passageiro:</div>
                    <div className="text-primary font-semibold">{req.nome || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Cargo / Lotação:</div>
                    <div className="text-secondary">{req.cargo || '-'} • {req.lotacao || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Evento / Tipo:</div>
                    <div className="text-primary font-medium">{req.evento} ({req.tipoEvento})</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Trecho Ida:</div>
                    <div className="text-primary">{req.origemDestinoIda}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Trecho Volta:</div>
                    <div className="text-primary">{req.destinoRetornoVolta}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Data Ida:</div>
                    <div className="text-primary font-mono">{req.dataIda ? new Date(req.dataIda).toLocaleDateString('pt-BR') : '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Data Volta:</div>
                    <div className="text-primary font-mono">{req.dataVolta ? new Date(req.dataVolta).toLocaleDateString('pt-BR') : '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Cota:</div>
                    <div className="text-secondary">{req.cota || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Tipo:</div>
                    <div className="text-primary mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold inline-block border ${
                        req.internacionais === 'Sim'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {req.internacionais === 'Sim' ? 'INTERNACIONAL' : 'NACIONAL'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Qtde Diárias:</div>
                    <div className="text-[#005fb8] font-bold">{req.qtdeDiarias}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Valor:</div>
                    <div className="text-primary font-bold">
                      {req.valorRs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-2">
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Observação:</div>
                    <div className="text-secondary text-[11px] leading-relaxed">{req.observacaoJustificativa}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-wider">Observação_2:</div>
                    <div className="text-secondary text-[11px] leading-relaxed">{req.observacaoApoioLogistico || '-'}</div>
                  </div>
                </div>

                {/* Mobile Action triggers */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onViewDetails(req)}
                    className="flex-1 flex justify-center items-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-card-border hover:bg-slate-100 rounded text-primary transition-colors cursor-pointer"
                  >
                    <ExternalLink size={12} />
                    Ver Detalhes
                  </button>

                  {(req.status === 'Pendente' || req.status === 'Rascunho') && (
                    <button
                      onClick={() => onEditDraft(req)}
                      className="flex-1 flex justify-center items-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded text-blue-700 transition-colors cursor-pointer"
                    >
                      <Edit size={12} />
                      Editar
                    </button>
                  )}

                  <button
                    onClick={() => onDuplicate(req)}
                    className="flex-1 flex justify-center items-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded text-emerald-700 transition-colors cursor-pointer"
                    title="Duplicar"
                  >
                    <Copy size={12} />
                    Duplicar
                  </button>

                  {deletingId === req.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded border border-red-200">
                      <span className="text-[10px] font-bold text-red-800">Apagar?</span>
                      <button
                        onClick={() => {
                          onDelete(req.id);
                          setDeletingId(null);
                        }}
                        className="text-[10px] font-extrabold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded cursor-pointer transition-colors"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-1 rounded cursor-pointer transition-colors"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(req.id)}
                      className="p-2 text-red-600 bg-red-50 border border-red-100 rounded hover:bg-red-100 cursor-pointer"
                      title="Apagar solicitação"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
