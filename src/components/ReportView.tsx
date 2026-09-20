import React from 'react';
import { VideoAnalysisReport } from '../types';
import { Clock, Activity, FileText, AlertTriangle, CheckCircle, Sparkles, Download, Scissors, MessageSquare } from 'lucide-react';

interface Props {
  report: VideoAnalysisReport;
  onDownloadReport: () => void;
  onGenerateCorrections: () => void;
  onPedirAjudaChat?: (promptText: string) => void;
  isGeneratingCorrections?: boolean;
  correctionsText?: string;
}

export const ReportView: React.FC<Props> = ({
  report,
  onDownloadReport,
  onGenerateCorrections,
  onPedirAjudaChat,
  isGeneratingCorrections = false,
  correctionsText = '',
}) => {
  const handlePedirAjudaClick = () => {
    if (!report || !onPedirAjudaChat) return;
    const actionsList =
      report.priority_actions && report.priority_actions.length > 0
        ? report.priority_actions.map((a) => `- [${a.priority.toUpperCase()}] ${a.action}: ${a.reason}`).join('\n')
        : 'Problemas de ritmo ou retenção observados no vídeo.';
    const promptText = `Meu vídeo teve estes problemas:\n${actionsList}\n\nMe ajude a corrigir cada um.`;
    onPedirAjudaChat(promptText);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Duração */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Duração Real</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {report.duration?.actual || '7:15'}
          </div>
          <div className="text-xs font-medium flex items-center gap-1.5 text-amber-400">
            <span>Planejado: {report.duration?.planned || '7:00'} ({report.duration?.delta || '+15s'})</span>
          </div>
        </div>

        {/* Card 2: Ritmo (WPM) */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Ritmo de Fala</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {report.pace?.wpm || 158} <span className="text-xs text-slate-400 font-normal">WPM</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium">
            Ideal: 150-170 WPM (Ritmo fluido)
          </div>
        </div>

        {/* Card 3: Fidelidade ao Roteiro */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Fidelidade Roteiro</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {report.fidelity?.percent || 92}%
          </div>
          <div className="text-xs text-slate-400">
            Alinhamento com estrutura de 7min
          </div>
        </div>

        {/* Card 4: Muletas Linguísticas */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Muletas / Vícios</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {report.fillers?.count || 0} <span className="text-xs text-slate-400 font-normal">ocorrências</span>
          </div>
          <div className="text-xs text-rose-300">
            Top: {report.fillers?.top?.join(', ') || 'nenhuma'}
          </div>
        </div>
      </div>

      {/* Priority Actions Card */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-lg">Ações Prioritárias Recomendadas</h3>
          </div>

          {/* BOTÃO INTEGRADO: PEDIR AJUDA AO CHAT */}
          {onPedirAjudaChat && (
            <button
              type="button"
              onClick={handlePedirAjudaClick}
              className="px-3.5 py-1.5 bg-[#10a37f] hover:bg-[#0e8e6e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Discutir os problemas do vídeo com o assistente no Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 Pedir ajuda ao Chat</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {report.priority_actions && report.priority_actions.length > 0 ? (
            report.priority_actions.map((act, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3 text-sm"
              >
                {act.priority === 'high' && <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">🔴 ALTA</span>}
                {act.priority === 'medium' && <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">🟡 MÉDIA</span>}
                {act.priority === 'low' && <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">🟢 SUGESTÃO</span>}

                <div className="flex-1 space-y-0.5">
                  <div className="font-semibold text-slate-200">{act.action}</div>
                  <div className="text-xs text-slate-400">{act.reason}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 italic">Nenhuma ação prioritária pendente identificada.</div>
          )}
        </div>
      </div>

      {/* Silences & Hook Score Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hook & CTA */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Desempenho do Gancho & CTA</span>
          </h4>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nota do Gancho (primeiros 15s):</span>
              <span className="font-bold text-amber-400">{report.hook?.score || 8}/10</span>
            </div>
            <p className="text-slate-300 italic">{report.hook?.comment || 'Gancho forte focado nos benefícios.'}</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-300">
              <span>CTA nos primeiros 45s:</span>
              <span className={report.cta?.early ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {report.cta?.early ? 'Detectado ✓' : 'Faltando ✗'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>CTA no final do vídeo:</span>
              <span className={report.cta?.final ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {report.cta?.final ? 'Detectado ✓' : 'Faltando ✗'}
              </span>
            </div>
          </div>
        </div>

        {/* Silêncios Longos */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Scissors className="w-4 h-4 text-rose-400" />
            <span>Silêncios e Hesitações (&gt;3s)</span>
          </h4>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2 max-h-40 overflow-y-auto">
            {report.long_silences && report.long_silences.length > 0 ? (
              report.long_silences.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300 border-b border-slate-800/60 pb-1.5 last:border-none">
                  <span className="font-mono text-amber-400">{s.start} - {s.end}</span>
                  <span className="text-slate-400">{s.suggestion}</span>
                </div>
              ))
            ) : (
              <div className="text-emerald-400 font-medium">Nenhum silêncio longo prejudicial foi detectado.</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          onClick={onDownloadReport}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Baixar Relatório em .MD</span>
        </button>

        <button
          onClick={onGenerateCorrections}
          disabled={isGeneratingCorrections}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingCorrections ? 'Gerando Correções...' : '🎬 Gerar Correções'}</span>
        </button>
      </div>

      {/* Render Corrections if generated */}
      {correctionsText && (
        <div className="bg-slate-900 p-6 rounded-xl border border-amber-500/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
            <Sparkles className="w-5 h-5" />
            <span>Roteiro de Correções e Regravação</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-80 overflow-y-auto">
            {correctionsText}
          </div>
        </div>
      )}
    </div>
  );
};
