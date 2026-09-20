import React from 'react';
import { Loader2 } from 'lucide-react';

export interface StepSubItem {
  label: string;
  status: 'done' | 'running' | 'pending' | 'failed';
}

export interface StepItem {
  index: number;
  total: number;
  label: string;
  status: 'done' | 'running' | 'pending' | 'failed';
  pipeline?: string;
  reason?: string;
  substeps?: StepSubItem[];
}

export interface StepProgressBlockProps {
  title?: string;
  steps: StepItem[];
}

const StatusIndicator: React.FC<{ status: 'done' | 'running' | 'pending' | 'failed'; size?: number }> = ({ status, size = 14 }) => {
  if (status === 'done') {
    return <span className="text-emerald-400 font-bold shrink-0">✓</span>;
  }
  if (status === 'running') {
    return <span className="text-amber-400 font-bold shrink-0 animate-pulse">⏳</span>;
  }
  if (status === 'failed') {
    return <span className="text-rose-500 font-bold shrink-0">✗</span>;
  }
  return <span className="text-slate-600 shrink-0">○</span>;
};

export const StepProgressBlock: React.FC<StepProgressBlockProps> = ({
  title = 'Executando etapas...',
  steps,
}) => {
  // Verificando se há pelo menos um step em execução
  const hasRunning = steps.some(s => s.status === 'running');

  return (
    <div className="my-3 p-4 bg-[#161920] border border-[#232733] rounded-2xl shadow-lg max-w-lg w-full text-xs text-slate-200 animate-in fade-in">
      <div className="font-bold text-slate-100 mb-3 flex items-center gap-2">
        {hasRunning ? (
          <Loader2 className="w-4 h-4 text-[#10a37f] animate-spin" />
        ) : (
          <span className="text-[#10a37f]">🎬</span>
        )}
        <span>{title}</span>
      </div>

      <div className="space-y-3 font-mono">
        {steps.map((s, idx) => {
          let textClass = "text-slate-500";
          let labelSuffix = "";
          if (s.status === 'done') {
            textClass = "text-emerald-400";
          } else if (s.status === 'running') {
            textClass = "text-amber-300 font-semibold";
            labelSuffix = "...";
          } else if (s.status === 'failed') {
            textClass = "text-rose-400";
          }

          const hasValidLabel =
            typeof s.label === 'string' &&
            s.label.trim().length > 0 &&
            s.label !== 'undefined' &&
            s.label !== 'null';

          return (
            <div key={idx} className="space-y-1.5">
              {!hasValidLabel ? null : (
                <div className={`flex items-start gap-2 ${textClass}`}>
                  <div className="mt-0.5">
                    <StatusIndicator status={s.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="break-words">
                      {s.label}{labelSuffix}
                    </span>
                    {s.status === 'failed' && s.reason && (
                      <span className="text-rose-500 text-[10px] block font-sans mt-0.5">Motivo: {s.reason}</span>
                    )}
                  </div>
                </div>
              )}
              {s.substeps && s.substeps.map((sub, sidx) => {
                let subClass = "text-slate-500";
                if (sub.status === 'done') {
                  subClass = "text-emerald-500";
                } else if (sub.status === 'running') {
                  subClass = "text-amber-400 animate-pulse font-medium";
                } else if (sub.status === 'failed') {
                  subClass = "text-rose-500";
                }
                return (
                  <div key={sidx} className={`flex items-center gap-2 pl-6 text-[11px] ${subClass}`}>
                    <StatusIndicator status={sub.status} size={11} />
                    <span>{sub.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
