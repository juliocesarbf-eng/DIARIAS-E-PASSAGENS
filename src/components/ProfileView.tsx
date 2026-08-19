import React, { useState } from 'react';
import { UserProfile, LOTACAO_OPTIONS, COTA_OPTIONS } from '../types';
import { User, ShieldCheck, Bookmark, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function ProfileView({ profile, onUpdateProfile }: ProfileViewProps) {
  const [nome, setNome] = useState(profile.nome);
  const [cargo, setCargo] = useState(profile.cargo);
  const [lotacao, setLotacao] = useState(profile.lotacao);
  const [feriasPadrao, setFeriasPadrao] = useState<'Sim' | 'Não'>(profile.feriasPadrao || 'Não');
  const [seiPadrao, setSeiPadrao] = useState(profile.seiPadrao || '');
  const [cotaPadrao, setCotaPadrao] = useState(profile.cotaPadrao || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      nome,
      cargo,
      lotacao,
      feriasPadrao,
      seiPadrao,
      cotaPadrao
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="profile-view-container" className="max-w-xl mx-auto space-y-6">
      <div className="border-b border-card-border pb-4">
        <h2 className="text-xl font-bold text-primary">Perfil do Usuário</h2>
        <p className="text-xs text-secondary mt-0.5">Configure seus dados padrão para preenchimento ágil de viagens futuras.</p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded p-4 flex gap-3 items-center animate-fade-in">
          <CheckCircle2 className="text-emerald-600" size={18} />
          <span className="text-xs font-bold">Perfil atualizado com sucesso! Novos rascunhos utilizarão estas preferências.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-card-border rounded p-6 space-y-5 shadow-xs">
        {/* User identification badge */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded border border-card-border">
          <div className="bg-primary text-white h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg font-mono">
            {nome.split(' ').map(n=>n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <span className="text-primary font-bold text-sm block">{nome || 'Não definido'}</span>
            <span className="text-xs text-secondary block">{cargo || 'Cargo não especificado'}</span>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="pref-nome" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Nome Completo *</label>
            <input
              id="pref-nome"
              type="text"
              required
              className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none text-primary font-medium"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="pref-cargo" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Cargo Efetivo / Comissão</label>
              <select
                id="pref-cargo"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none text-primary cursor-pointer"
                value={cargo}
                onChange={e => setCargo(e.target.value)}
              >
                <option value="">Selecione o cargo...</option>
                <option value="MINISTRO DO SUPERIOR TRIBUNAL MILITAR">MINISTRO DO SUPERIOR TRIBUNAL MILITAR</option>
                <option value="MINISTRA DO SUPERIOR TRIBUNAL MILITAR">MINISTRA DO SUPERIOR TRIBUNAL MILITAR</option>
                <option value="JUIZ FEDERAL DA JUSTICA MILITAR DA UNIAO">JUIZ FEDERAL DA JUSTICA MILITAR DA UNIAO</option>
                <option value="JUIZA FEDERAL DA JUSTICA MILITAR DA UNIAO">JUIZA FEDERAL DA JUSTICA MILITAR DA UNIAO</option>
                <option value="JUIZ FEDERAL SUBSTITUTO DA JUSTICA MILITAR DA UNIAO">JUIZ FEDERAL SUBSTITUTO DA JUSTICA MILITAR DA UNIAO</option>
                <option value="JUIZA FEDERAL SUBSTITUTA DA JUSTICA MILITAR DA UNIAO">JUIZA FEDERAL SUBSTITUTA DA JUSTICA MILITAR DA UNIAO</option>
                <option value="JUIZA CORREGEDORA AUXILIAR">JUIZA CORREGEDORA AUXILIAR</option>
                <option value="JUIZ AUXILIAR">JUIZ AUXILIAR</option>
                <option value="JUIZA AUXILIAR">JUIZA AUXILIAR</option>
                <option value="CARGO EM COMISSAO">CARGO EM COMISSAO</option>
                <option value="ANALISTA JUDICIARIO">ANALISTA JUDICIARIO</option>
                <option value="ANALISTA JUDICIARIA">ANALISTA JUDICIARIA</option>
                <option value="OFICIAL SUPERIOR">OFICIAL SUPERIOR</option>
                <option value="TECNICO JUDICIARIO">TECNICO JUDICIARIO</option>
                <option value="TECNICA JUDICIARIA">TECNICA JUDICIARIA</option>
                <option value="MILITAR">MILITAR</option>
                <option value="COLABORADOR">COLABORADOR</option>
                <option value="COLABORADOR EVENTUAL">COLABORADOR EVENTUAL</option>
                <option value="COLABORADORA">COLABORADORA</option>
                <option value="COLABORADORA EVENTUAL">COLABORADORA EVENTUAL</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pref-lotacao" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Lotação Escalar</label>
              <select
                id="pref-lotacao"
                className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none text-primary cursor-pointer"
                value={lotacao}
                onChange={e => setLotacao(e.target.value)}
              >
                <option value="">Selecione a lotação...</option>
                {LOTACAO_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-card-border pt-4 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark size={15} className="text-primary" />
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Preferências Padrão de Viagem</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="pref-sei" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">SEI Regular (Processo Geral)</label>
                <input
                  id="pref-sei"
                  type="text"
                  placeholder="Ex: 000223/26-06.110"
                  className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none text-primary font-mono"
                  value={seiPadrao}
                  onChange={e => setSeiPadrao(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="pref-cota" className="block text-[11px] font-bold text-secondary uppercase tracking-wider">Cota de Cobertura Padrão</label>
                  <select
                    id="pref-cota"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none text-primary cursor-pointer"
                    value={cotaPadrao}
                    onChange={e => setCotaPadrao(e.target.value)}
                  >
                    <option value="">Selecione a cota...</option>
                    {COTA_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="pref-ferias" className="block text-[11px] font-bold text-secondary uppercase tracking-wider font-sans">Viaja Normal em Férias?</label>
                  <select
                    id="pref-ferias"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-outline-gray rounded focus:border-2 focus:border-primary outline-none text-primary cursor-pointer"
                    value={feriasPadrao}
                    onChange={e => setFeriasPadrao(e.target.value as 'Sim' | 'Não')}
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile submit button */}
        <div className="pt-4">
          <button
            id="btn-save-profile"
            type="submit"
            className="w-full bg-[#041627] hover:bg-slate-900 text-white font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-colors cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </form>

      {/* Safety Compliance notes */}
      <div className="bg-slate-100 border border-card-border rounded p-4 flex gap-3 items-start">
        <ShieldCheck className="text-primary shrink-0 mt-0.5" size={18} />
        <div className="text-[11px] text-secondary">
          <span className="font-bold text-primary block mb-0.5">Segurança dos Dados do Usuário</span>
          Todas as configurações e registros de viagens são mantidos localmente no navegador deste dispositivo, garantindo estrita privacidade em conformidade com a LGPD e regras de auditoria interna.
        </div>
      </div>
    </div>
  );
}
