import React, { useState } from 'react';
import { Play, Calendar, Download, Film, CheckCircle2 } from 'lucide-react';

interface ShortItem {
  id: number;
  title: string;
  duration: string;
  type: string;
  description: string;
  downloadUrl?: string;
  viewsSimulated?: number;
  ctrSimulated?: string;
}

interface ShortsBlockProps {
  shorts?: ShortItem[];
  onSchedule?: (shortId: number) => void;
}

export const ShortsBlock: React.FC<ShortsBlockProps> = ({
  shorts = [
    { id: 1, title: 'A IA que lê tudo em segundos', duration: '0:15', type: 'Melhor gancho', description: 'Abertura impactante para fisgar audiência fria.', viewsSimulated: 1840, ctrSimulated: '8.1%' },
    { id: 2, title: 'Como usar na prática (Passo a Passo)', duration: '1:02', type: 'Melhor dica prática', description: 'Demonstração acelerada do principal recurso.', viewsSimulated: 2450, ctrSimulated: '9.3%' },
    { id: 3, title: 'Vale a pena de verdade? O veredito', duration: '0:28', type: 'Melhor punchline', description: 'Análise sincera com nota realista.', viewsSimulated: 950, ctrSimulated: '6.5%' }
  ],
  onSchedule
}) => {
  const [scheduledId, setScheduledId] = useState<number | null>(null);

  const handleScheduleClick = (id: number) => {
    setScheduledId(id);
    if (onSchedule) onSchedule(id);
  };

  return (
    <div className="my-4 p-5 bg-[#161920] border border-[#232733] rounded-2xl shadow-xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2.5 border-b border-[#232733] pb-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
          <Film className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-100">3 Shorts Gerados Automaticamente</h4>
          <p className="text-[10px] text-slate-400 font-mono">Formatados em 9:16 (1080x1920) com legenda embutida</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        {shorts.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-3 relative group">
            <div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold font-mono tracking-wide mb-2 inline-block">
                {item.type}
              </span>
              <h5 className="font-semibold text-xs text-slate-100 line-clamp-2 leading-tight mb-1">{item.title}</h5>
              <p className="text-[9px] text-slate-400 mb-2 font-mono">Duração: {item.duration}</p>
            </div>

            <div className="aspect-[9/16] w-full rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden mb-3">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition duration-300" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&h=356')` }} />
              <button className="z-10 w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-md active:scale-90 transition">
                <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
              </button>
            </div>

            <div className="flex gap-1.5 text-[10px]">
              <a
                href={item.downloadUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                download
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono"
              >
                <Download className="w-3 h-3" />
                <span>Baixar</span>
              </a>
              <button
                onClick={() => handleScheduleClick(item.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-mono transition ${
                  scheduledId === item.id 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-[#232733] hover:bg-slate-700 text-slate-300'
                }`}
              >
                {scheduledId === item.id ? <CheckCircle2 className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                <span>{scheduledId === item.id ? 'Agendado' : 'Agendar'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
