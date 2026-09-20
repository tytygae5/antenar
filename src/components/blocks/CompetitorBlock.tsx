import React from 'react';
import { ShieldAlert, RefreshCw, Eye, EyeOff, Radio } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  url: string;
  checkedAt: number;
  videosCount: number;
  viewsAvg: number;
  recentVideo?: {
    title: string;
    views: number;
    publishedAt: string;
    duration: string;
    thumbnailUrl?: string;
  };
}

interface CompetitorBlockProps {
  competitors?: Competitor[];
}

export const CompetitorBlock: React.FC<CompetitorBlockProps> = ({
  competitors = [
    {
      id: 'canal-1',
      name: '@LucasAIEngenharia',
      url: 'https://youtube.com/@lucasai',
      checkedAt: Date.now(),
      videosCount: 34,
      viewsAvg: 42000,
      recentVideo: {
        title: "Testei o Cursor por 30 dias (Meu novo editor)",
        views: 124000,
        publishedAt: '2 horas atrás',
        duration: '8:42',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=170'
      }
    },
    {
      id: 'canal-2',
      name: '@TechReviewsBr',
      url: 'https://youtube.com/@techreviews',
      checkedAt: Date.now(),
      videosCount: 112,
      viewsAvg: 89000,
      recentVideo: {
        title: "A nova IA de vídeo que superou o Sora!",
        views: 89000,
        publishedAt: '2 dias atrás',
        duration: '11:15',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=170'
      }
    }
  ]
}) => {
  return (
    <div className="my-4 p-5 bg-[#161920] border border-[#232733] rounded-2xl shadow-xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-[#232733] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">Monitoramento Ativo de Concorrentes</h4>
            <p className="text-[10px] text-slate-400 font-mono">Último scan: Hoje • {competitors.length} Canais</p>
          </div>
        </div>
        <button className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {competitors.map((comp) => (
          <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2.5">
              <span className="font-bold text-xs text-indigo-400 font-mono">{comp.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">Média: {(comp.viewsAvg / 1000).toFixed(0)}k views</span>
            </div>

            {comp.recentVideo && (
              <div className="flex gap-3">
                <div className="relative aspect-video w-24 shrink-0 rounded bg-slate-950 overflow-hidden border border-slate-800">
                  <img src={comp.recentVideo.thumbnailUrl} alt={comp.recentVideo.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/80 px-1 py-0.5 rounded font-mono text-slate-300">
                    {comp.recentVideo.duration}
                  </span>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h5 className="font-semibold text-[11px] text-slate-200 line-clamp-2 leading-snug">{comp.recentVideo.title}</h5>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">{comp.recentVideo.publishedAt} • {comp.recentVideo.views.toLocaleString()} views</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
