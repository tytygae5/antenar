import React, { useState } from 'react';
import { Copy, Check, Download, Clock, FileText, Sparkles } from 'lucide-react';

interface Props {
  script: string;
  name: string;
}

export const ScriptViewer: React.FC<Props> = ({ script, name }) => {
  const [copied, setCopied] = useState(false);

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  // Estimated reading time (~150 WPM)
  const estMinutes = (wordCount / 150).toFixed(1);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMd = () => {
    const blob = new Blob([script], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roteiro_${name.toLowerCase().replace(/\s+/g, '_')}_7min.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>~{estMinutes} min ({wordCount} palavras)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/60">
            <Sparkles className="w-4 h-4" />
            <span>Estrutura Duração Alvo: 7:00 ±30s</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copiar Roteiro</span>
              </>
            )}
          </button>

          <button
            onClick={downloadMd}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Baixar .MD</span>
          </button>
        </div>
      </div>

      {/* Script Text Container with Formatting Highlights */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-sm leading-relaxed text-slate-200 overflow-y-auto max-h-[600px] whitespace-pre-wrap shadow-inner space-y-2">
        {script.split('\n').map((line, idx) => {
          if (line.startsWith('[0:') || line.startsWith('#')) {
            return (
              <div key={idx} className="text-amber-400 font-bold text-base mt-4 mb-1 border-b border-slate-800/80 pb-1">
                {line}
              </div>
            );
          }
          if (line.includes('[B-ROLL')) {
            return (
              <div key={idx} className="text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded border border-cyan-800/40 text-xs italic my-1">
                📹 {line}
              </div>
            );
          }
          if (line.includes('[pausa') || line.includes('[ênfase]')) {
            return (
              <div key={idx} className="text-purple-300 font-semibold my-1">
                {line}
              </div>
            );
          }
          return <div key={idx}>{line}</div>;
        })}
      </div>
    </div>
  );
};
