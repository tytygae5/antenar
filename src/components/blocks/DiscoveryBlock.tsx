import React, { useState } from 'react';
import { Sparkles, ExternalLink, Bookmark, Video, Check, RefreshCw } from 'lucide-react';

export interface DiscoveredAI {
  id?: string;
  name: string;
  url: string;
  description: string;
  pricing?: string;
  trending?: string;
}

export interface DiscoveryBlockProps {
  items: DiscoveredAI[];
  onMakeVideo: (aiName: string, aiUrl: string, description: string) => void;
  onRefresh?: () => void;
}

export const DiscoveryBlock: React.FC<DiscoveryBlockProps> = ({
  items = [],
  onMakeVideo,
  onRefresh,
}) => {
  const [savedItems, setSavedItems] = useState<Record<number, boolean>>({});

  const toggleSave = (idx: number) => {
    setSavedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="my-3 p-4 bg-[#161920] border border-[#232733] rounded-2xl shadow-xl w-full max-w-2xl text-xs text-slate-200 animate-in fade-in">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>🔎 IAs Novas Encontradas ({items.length})</span>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Buscar mais</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {items.map((ai, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#0f1115] border border-[#232733] rounded-xl hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                <span>#{idx + 1}</span>
                <span>{ai.name}</span>
              </div>
              {ai.pricing && (
                <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] rounded-full shrink-0">
                  {ai.pricing}
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs mb-2 leading-relaxed">{ai.description || (ai as any).desc}</p>

            {ai.trending && (
              <div className="text-[11px] text-amber-400/90 font-mono mb-2.5">
                🔥 {ai.trending}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  const descVal = ai.description || (ai as any).desc || '';
                  onMakeVideo(ai.name, ai.url, descVal === 'undefined' ? '' : descVal);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#10a37f] hover:bg-[#0e8e6e] text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>🎬 Fazer vídeo sobre esta</span>
              </button>

              <a
                href={ai.url.startsWith('http') ? ai.url : `https://${ai.url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Site oficial</span>
              </a>

              <button
                type="button"
                onClick={() => toggleSave(idx)}
                className={`flex items-center gap-1 px-2 py-1.5 text-[11px] rounded-lg transition-colors cursor-pointer ${
                  savedItems[idx]
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {savedItems[idx] ? <Check className="w-3 h-3 text-amber-300" /> : <Bookmark className="w-3 h-3" />}
                <span>{savedItems[idx] ? 'Salvo' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
