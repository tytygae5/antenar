import React from 'react';
import { BarChart3, Award, Sparkles, TrendingUp } from 'lucide-react';

interface ThumbnailOption {
  id: number;
  label: string;
  ctr: number;
  style: string;
  isWinner?: boolean;
  imageUrl?: string;
}

interface ABTestBlockProps {
  videoId?: string;
  videoTitle?: string;
  duration?: string;
  thumbnails?: ThumbnailOption[];
}

export const ABTestBlock: React.FC<ABTestBlockProps> = ({
  videoId = 'video-15',
  videoTitle = 'Humata AI Review',
  duration = '24 Horas',
  thumbnails = [
    { id: 2, label: 'Close-up Surpreso (Thumbnail 2)', ctr: 8.4, style: 'Rostos em close + Texto em CAPS', isWinner: true, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=170' },
    { id: 1, label: 'Layout Lado-a-Lado (Thumbnail 1)', ctr: 6.2, style: 'Interface dividida', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=170' },
    { id: 3, label: 'Pergunta Misteriosa (Thumbnail 3)', ctr: 5.8, style: 'Texto misterioso', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=170' }
  ]
}) => {
  return (
    <div className="my-4 p-5 bg-[#161920] border border-[#232733] rounded-2xl shadow-xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-[#232733] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">Resultado do Teste A/B de Thumbnails</h4>
            <p className="text-[10px] text-slate-400 font-mono">Duração do Teste: {duration} • Vídeo: {videoTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        {thumbnails.map((thumb) => (
          <div 
            key={thumb.id} 
            className={`bg-slate-900 border rounded-xl overflow-hidden p-2.5 flex flex-col justify-between ${
              thumb.isWinner 
                ? 'border-emerald-500/50 shadow-emerald-950/20 shadow-md ring-1 ring-emerald-500/30' 
                : 'border-slate-800'
            }`}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-2">
              <img src={thumb.imageUrl} alt={thumb.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {thumb.isWinner && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-bold uppercase tracking-wider font-mono">
                  <Award className="w-3.5 h-3.5" />
                  <span>Vencedora</span>
                </div>
              )}
            </div>
            
            <div>
              <p className="font-bold text-xs text-slate-100 font-mono flex items-baseline gap-1">
                <span className="text-sm text-emerald-400">{thumb.ctr}%</span> CTR
              </p>
              <h5 className="font-semibold text-[10px] text-slate-300 line-clamp-1 mt-1">{thumb.label}</h5>
              <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{thumb.style}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 flex gap-2.5 items-start">
        <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-emerald-300 leading-normal">
          <p className="font-semibold mb-0.5">Aprendizado adicionado ao canal-memory:</p>
          <span>Thumbnails com close de rosto expressivo e texto super intrigante em CAPS geram em média <strong>+35% de conversão</strong>. Aplicaremos essa diretriz nos próximos 5 roteiros/thumbnails.</span>
        </div>
      </div>
    </div>
  );
};
