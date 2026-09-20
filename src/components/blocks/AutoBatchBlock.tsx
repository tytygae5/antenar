import React, { useState } from 'react';
import { Sparkles, Calendar, Film, Check, Edit, Trash2, CheckCircle2, ChevronDown, ChevronUp, Clock, Eye, Sparkle, AlertCircle } from 'lucide-react';

interface AutoBatchBlockProps {
  content?: any[];
  onAction?: (cmd: string) => void;
}

export const AutoBatchBlock: React.FC<AutoBatchBlockProps> = ({
  content = [],
  onAction,
}) => {
  const [items, setItems] = useState<any[]>(() => {
    return content.map((item, idx) => ({
      ...item,
      id: item.ia?.name || `video-${idx}`,
      status: 'pending', // 'approved', 'editing', 'discarded'
      isScriptExpanded: false,
      isShortsExpanded: false,
    }));
  });

  const [globalStatus, setGlobalStatus] = useState<'idle' | 'approved_all'>('idle');

  const handleIndividualApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
  };

  const handleIndividualDiscard = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'discarded' } : item))
    );
  };

  const handleIndividualEdit = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'editing' } : item))
    );
  };

  const handleApproveAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, status: 'approved' })));
    setGlobalStatus('approved_all');
    if (onAction) {
      onAction('/auto-aprovar-todos');
    }
  };

  const toggleScript = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isScriptExpanded: !item.isScriptExpanded } : item
      )
    );
  };

  const toggleShorts = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isShortsExpanded: !item.isShortsExpanded } : item
      )
    );
  };

  if (items.length === 0) {
    return (
      <div className="my-4 p-6 bg-[#161920] border border-[#232733] rounded-2xl text-center">
        <p className="text-slate-400 text-sm">Nenhum vídeo no lote autônomo.</p>
      </div>
    );
  }

  return (
    <div className="my-4 w-full bg-[#0f1115] border border-[#232733] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 duration-300">
      {/* Header do Lote */}
      <div className="p-5 bg-[#161920] border-b border-[#232733] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Lote de Produção Autônoma</h3>
            <p className="text-xs text-slate-400">Modo Autônomo Total • {items.length} vídeos prontos para revisão</p>
          </div>
        </div>
        {globalStatus === 'approved_all' ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>APROVADO E AGENDADO</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold font-mono">
            <Clock className="w-4 h-4" />
            <span>AGUARDANDO REVISÃO</span>
          </div>
        )}
      </div>

      {/* Grid ou Pilha de Vídeos */}
      <div className="divide-y divide-[#232733] bg-[#0f1115]">
        {items.map((item, index) => {
          const { ia, pkg, avatar, shorts, status, isScriptExpanded, isShortsExpanded } = item;
          const isApproved = status === 'approved';
          const isDiscarded = status === 'discarded';
          const isEditing = status === 'editing';

          return (
            <div
              key={item.id}
              className={`p-5 transition-all duration-200 ${
                isApproved ? 'bg-emerald-950/10' : isDiscarded ? 'opacity-40 bg-slate-950/20' : 'hover:bg-slate-900/10'
              }`}
            >
              {/* Top Card: IA Info & Badge Individual */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-base text-slate-200">
                    {index + 1}. {ia?.name || pkg?.name}
                  </h4>
                  <a
                    href={ia?.url || pkg?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline font-mono"
                  >
                    {ia?.url || pkg?.url}
                  </a>
                </div>

                {/* Badge de Status Individual */}
                <div className="flex items-center gap-2">
                  {isApproved && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Aprovado
                    </span>
                  )}
                  {isDiscarded && (
                    <span className="text-[10px] bg-red-500/10 text-red-400 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Descartado
                    </span>
                  )}
                  {isEditing && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Editando
                    </span>
                  )}
                  {!isApproved && !isDiscarded && !isEditing && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Pendente
                    </span>
                  )}
                </div>
              </div>

              {/* Roteiro Compacto */}
              <div className="mb-4 bg-[#161920]/60 border border-[#232733]/60 rounded-xl p-3 text-slate-300 text-xs leading-relaxed">
                <div className="flex items-center justify-between border-b border-[#232733] pb-1.5 mb-1.5">
                  <span className="font-semibold text-slate-200 uppercase tracking-wide text-[10px] font-mono">Roteiro Completo (7 min)</span>
                  <button
                    onClick={() => toggleScript(item.id)}
                    className="text-indigo-400 hover:text-indigo-300 font-mono text-[10px] flex items-center gap-0.5"
                  >
                    {isScriptExpanded ? (
                      <>
                        <span>Recolher</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Expandir</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                <p className={isScriptExpanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}>
                  {pkg?.script || 'Roteiro não disponível.'}
                </p>
              </div>

              {/* Grid de assets gerados para o vídeo (Thumbnails + Avatar + Shorts) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Visual Thumbnail */}
                <div className="bg-[#161920] border border-[#232733] rounded-xl overflow-hidden flex flex-col justify-between">
                  <div className="p-3 border-b border-[#232733] flex items-center justify-between">
                    <span className="font-semibold text-slate-300 text-[10px] font-mono uppercase tracking-wide">Capa (Thumbnail)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Fundo futurista</span>
                  </div>
                  <div
                    className="h-32 bg-cover bg-center flex items-end p-2 relative"
                    style={{ backgroundImage: `url('${pkg?.thumbnailPath || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}')` }}
                  >
                    <div className="absolute inset-0 bg-slate-950/50" />
                    <p className="relative z-10 text-[11px] font-bold text-white line-clamp-2 bg-black/40 p-1.5 rounded w-full backdrop-blur-[2px]">
                      {pkg?.title || `Como usar o ${ia?.name}`}
                    </p>
                  </div>
                </div>

                {/* Avatar Vídeo Fallback */}
                <div className="bg-[#161920] border border-[#232733] rounded-xl overflow-hidden flex flex-col justify-between">
                  <div className="p-3 border-b border-[#232733] flex items-center justify-between">
                    <span className="font-semibold text-slate-300 text-[10px] font-mono uppercase tracking-wide">Avatar Narrador</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {avatar?.success ? avatar.provider?.toUpperCase() : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                    {avatar?.success ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Film className="w-8 h-8 text-indigo-400 mb-1.5" />
                        <span className="text-xs text-slate-200 font-medium">Renderizado com Sucesso</span>
                        <span className="text-[10px] text-slate-400 font-mono">{avatar.videoUrl ? 'Pronto para download' : 'Visualização local'}</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-500 mb-1.5" />
                        <span className="text-xs text-slate-400 font-medium">Avatar não Renderizado</span>
                        <span className="text-[10px] text-slate-500 font-mono">Usará narrador nativo em voz clonada</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shorts cortados */}
              {shorts?.shorts && shorts.shorts.length > 0 && (
                <div className="mb-4 bg-[#161920]/40 border border-[#232733]/40 rounded-xl p-3">
                  <div className="flex items-center justify-between border-b border-[#232733] pb-1.5 mb-2">
                    <span className="font-semibold text-slate-300 text-[10px] font-mono uppercase tracking-wide">
                      📱 Shorts Cortados ({shorts.shorts.length})
                    </span>
                    <button
                      onClick={() => toggleShorts(item.id)}
                      className="text-indigo-400 hover:text-indigo-300 font-mono text-[10px] flex items-center gap-0.5"
                    >
                      {isShortsExpanded ? (
                        <>
                          <span>Ocultar</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Visualizar</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                  {isShortsExpanded && (
                    <div className="space-y-2 mt-1">
                      {shorts.shorts.map((sh: any, shIdx: number) => (
                        <div key={shIdx} className="p-2.5 bg-[#0f1115] border border-[#232733] rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-200">
                              Short #{shIdx + 1}: {sh.title}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              {sh.start} - {sh.end}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">"{sh.script}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ações Individuais (apenas quando não aprovado globalmente) */}
              {globalStatus !== 'approved_all' && (
                <div className="flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => handleIndividualDiscard(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition active:scale-95 ${
                      isDiscarded
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-400'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDiscarded ? 'Descartado' : 'Descartar'}</span>
                  </button>
                  <button
                    onClick={() => handleIndividualEdit(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition active:scale-95 ${
                      isEditing
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Editando...' : 'Editar'}</span>
                  </button>
                  <button
                    onClick={() => handleIndividualApprove(item.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition active:scale-95 ${
                      isApproved
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white font-medium'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isApproved ? 'Aprovado' : 'Aprovar'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Global */}
      <div className="p-5 bg-[#161920] border-t border-[#232733] flex flex-wrap gap-3 items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">
          Deseja agendar todas as produções aprovadas no lote?
        </span>
        <div className="flex items-center gap-2">
          {globalStatus === 'approved_all' ? (
            <div className="text-emerald-400 font-semibold font-mono flex items-center gap-1.5 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
              <Check className="w-4 h-4" />
              <span>LOTE AGENDADO NO YOUTUBE</span>
            </div>
          ) : (
            <button
              onClick={handleApproveAll}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition active:scale-[0.98] shadow-lg shadow-indigo-500/15"
            >
              <Check className="w-4 h-4" />
              <span>Aprovar Lote e Agendar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
