import React, { useState, useEffect } from 'react';
import { Play, Download, ExternalLink, Video, CheckCircle2, AlertCircle } from 'lucide-react';

interface AvatarVideoBlockProps {
  id?: string;
  name?: string;
  status?: string;
  avatarId?: string;
  format?: string;
  voiceId?: string;
  duration?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

export const AvatarVideoBlock: React.FC<AvatarVideoBlockProps> = ({
  id = 'avatar-1',
  name = 'Humata AI Review',
  status = 'completed',
  avatarId = 'skyreels-v3',
  format = '16:9',
  voiceId = 'clonada',
  duration = '0:15',
  downloadUrl = 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-smartphone-with-a-green-screen-40149-large.mp4',
  previewUrl = 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-smartphone-with-a-green-screen-40149-large.mp4',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const providerLabel = avatarId === 'skyreels-v3' ? 'SkyReels-V3 (Gratuito)' :
                        avatarId === 'sadtalker-hf' ? 'SadTalker (Hugging Face)' :
                        avatarId === 'vlogme-replicate' ? 'VlogMe (Replicate)' : 'Inteligência Local';

  return (
    <div className="my-4 p-5 bg-[#161920] border border-[#232733] rounded-2xl shadow-xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-[#232733] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">{name}</h4>
            <p className="text-[10px] text-slate-400 font-mono">Provedor: {providerLabel} • Formato: {format}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold font-mono uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{status}</span>
        </div>
      </div>

      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-[#232733] mb-4 group">
        {isPlaying ? (
          <video
            src={downloadUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80')` }}>
            <div className="absolute inset-0 bg-slate-950/65" />
            <button
              onClick={() => setIsPlaying(true)}
              className="relative z-10 w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transform transition active:scale-95 group-hover:scale-105"
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>
            <span className="relative z-10 mt-3 text-[11px] text-slate-300 font-mono bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/50">
              Duração: {duration}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <a
          href={downloadUrl}
          download
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Baixar MP4</span>
        </a>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#232733] hover:bg-[#2c3140] text-slate-300 font-medium transition active:scale-[0.98]"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Abrir Link Externo</span>
        </a>
      </div>
    </div>
  );
};
