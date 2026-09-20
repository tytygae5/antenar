import React from 'react';
import { Globe, Check, Volume2, Languages } from 'lucide-react';

interface TranslationBlockProps {
  id?: string;
  languages?: Array<{ code: string; label: string; flag: string; status: string }>;
}

export const TranslationBlock: React.FC<TranslationBlockProps> = ({
  id = 'translation-1',
  languages = [
    { code: 'es', label: 'Espanhol', flag: '🇪🇸', status: 'Ativo' },
    { code: 'en', label: 'Inglês', flag: '🇺🇸', status: 'Ativo' },
    { code: 'fr', label: 'Francês', flag: '🇫🇷', status: 'Pendente' }
  ]
}) => {
  return (
    <div className="my-4 p-5 bg-[#161920] border border-[#232733] rounded-2xl shadow-xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 font-sans">
      <div className="flex items-center gap-2.5 border-b border-[#232733] pb-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-100">Faixas de Áudio & Dublagens</h4>
          <p className="text-[10px] text-slate-400 font-mono">Gerenciador de Áudio Multi-Idioma do YouTube</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {languages.map((lang, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0 select-none">{lang.flag}</span>
              <div>
                <h5 className="font-semibold text-xs text-slate-100">{lang.label}</h5>
                <p className="text-[9px] text-slate-500 font-mono">Título, descrição e áudio TTS sincronizados</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider ${
                lang.status === 'Ativo' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
              }`}>
                {lang.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-400 font-mono border-t border-[#232733] pt-3 flex items-center gap-1.5 justify-center">
        <Languages className="w-4.5 h-4.5 text-slate-500" />
        <span>Dobrando o alcance internacional do canal via Smart Translation API.</span>
      </div>
    </div>
  );
};
