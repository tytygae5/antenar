import React from 'react';

export interface ReviewReportProps {
  content: any;
}

export const ReviewReport: React.FC<ReviewReportProps> = ({ content }) => {
  // Se for string, tenta parsear
  let data = content;
  if (typeof content === 'string') {
    try {
      data = JSON.parse(content);
    } catch (e) {
      // Fallback
    }
  }

  if (!data) return null;

  return (
    <div className="review-report bg-[#161920] border border-[#10a37f]/40 rounded-2xl p-5 text-xs text-slate-200 space-y-5 shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-lg">📊</span>
        <h3 className="text-sm font-bold text-white">Relatório de Análise de Vídeo</h3>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {data.duration && (
          <div className="bg-[#0e1117] border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">⏱️ Duração</span>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-base font-bold text-white">{data.duration.actual}</span>
              <span className="text-[10px] text-slate-500">/ planejado: {data.duration.planned}</span>
            </div>
            {data.duration.delta && (
              <span className={`text-[10px] mt-1 font-semibold ${data.duration.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                Desvio: {data.duration.delta}
              </span>
            )}
          </div>
        )}

        {data.pace && (
          <div className="bg-[#0e1117] border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">🗣️ Ritmo</span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-base font-bold text-white">{data.pace.wpm}</span>
              <span className="text-[10px] text-slate-500">ppm</span>
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${data.pace.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>
              Status: {data.pace.status === 'good' ? 'Ideal (150-170 ppm)' : 'Fora da faixa ideal'}
            </span>
          </div>
        )}

        {data.hook && (
          <div className="bg-[#0e1117] border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">🎯 Gancho Inicial (15s)</span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-base font-bold text-emerald-400">{data.hook.score || 0}</span>
              <span className="text-[10px] text-slate-500">/ 10</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate mt-1" title={data.hook.comment}>
              {data.hook.comment || 'Gancho avaliado'}
            </span>
          </div>
        )}

        {data.fillers && (
          <div className="bg-[#0e1117] border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">🔁 Muletas Linguísticas</span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-base font-bold text-white">{data.fillers.count || 0}</span>
              <span className="text-[10px] text-slate-500">ocorrências</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate mt-1">
              Top: {Array.isArray(data.fillers.top) ? data.fillers.top.join(', ') : 'nenhuma'}
            </span>
          </div>
        )}

        {/* 🔴 Omitido se não houver roteiro (FIX 5) */}
        {data.fidelity && typeof data.fidelity.percent !== 'undefined' && (
          <div className="bg-[#0e1117] border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">📖 Fidelidade ao Roteiro</span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-base font-bold text-white">{data.fidelity.percent}%</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate mt-1">
              Omissões: {Array.isArray(data.fidelity.missing) ? data.fidelity.missing.join(', ') : 'Nenhuma'}
            </span>
          </div>
        )}
      </div>

      {/* Silêncios Longos */}
      {Array.isArray(data.long_silences) && data.long_silences.length > 0 && (
        <div className="bg-[#0e1117] border border-slate-800 rounded-xl p-3.5 space-y-2">
          <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
            <span>🔇 Silêncios Detectados ({data.long_silences.length})</span>
          </h4>
          <div className="space-y-1.5">
            {data.long_silences.map((s: any, idx: number) => (
              <div key={idx} className="flex justify-between text-[11px] bg-black/20 px-2 py-1.5 rounded-lg border border-slate-800/50">
                <span className="font-semibold text-slate-300">Trecho: {s.start} - {s.end}</span>
                <span className="text-slate-400">{s.suggestion || 'Recomendado cortar'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA & Promessas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.cta && (
          <div className="bg-[#0e1117] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-white">📣 Chamadas para Ação (CTA)</h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CTA Inicial (primeiros 45s):</span>
                <span className={`font-semibold ${data.cta.early ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {data.cta.early ? 'Encontrado' : 'Ausente'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CTA Final (últimos 45s):</span>
                <span className={`font-semibold ${data.cta.final ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {data.cta.final ? 'Encontrado' : 'Ausente'}
                </span>
              </div>
            </div>
          </div>
        )}

        {Array.isArray(data.promises_kept) && (
          <div className="bg-[#0e1117] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold text-white">🤝 Promessas Cumpridas</h4>
            <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
              {data.promises_kept.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 truncate max-w-[80%]">{p.promise}</span>
                  <span className={`font-semibold ${p.kept ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.kept ? 'Cumprido' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ações Prioritárias */}
      {Array.isArray(data.priority_actions) && data.priority_actions.length > 0 && (
        <div className="bg-[#0e1117] border border-slate-800 rounded-xl p-4 space-y-3">
          <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
            <span className="text-rose-400">🔴</span> Ações Prioritárias de Edição
          </h4>
          <div className="space-y-2">
            {data.priority_actions.map((act: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-black/15 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-white text-[11px]">{act.action}</div>
                  <div className="text-[10px] text-slate-400">{act.reason}</div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-center ${
                  act.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {act.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
