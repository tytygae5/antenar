import React from 'react';
import { DollarSign, Landmark, TrendingUp, Sparkles, Award } from 'lucide-react';

interface RevenueHistory {
  month: string;
  adsense: number;
  membros: number;
  superchats: number;
  total: number;
}

interface RevenueBlockProps {
  currentMonth?: string;
  adsense?: number;
  membros?: number;
  superchats?: number;
  total?: number;
  trend?: string;
  history?: RevenueHistory[];
}

export const RevenueBlock: React.FC<RevenueBlockProps> = ({
  currentMonth = 'Julho',
  adsense = 847.32,
  membros = 230.00,
  superchats = 45.00,
  total = 1122.32,
  trend = '+18% vs. mês anterior',
  history = [
    { month: 'Abril', adsense: 420.50, membros: 80.00, superchats: 15.00, total: 515.50 },
    { month: 'Maio', adsense: 590.20, membros: 110.00, superchats: 20.00, total: 720.20 },
    { month: 'Junho', adsense: 710.00, membros: 140.00, superchats: 35.00, total: 885.00 },
    { month: 'Julho', adsense: 847.32, membros: 230.00, superchats: 45.00, total: 1122.32 }
  ]
}) => {
  return (
    <div className="my-4 p-5 bg-[#161920] border border-[#232733] rounded-2xl shadow-xl w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 font-sans">
      <div className="flex items-center justify-between border-b border-[#232733] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">💰 Receita Estimada (Últimos 30 dias)</h4>
            <p className="text-[10px] text-slate-400 font-mono">Faturamento do Canal • {currentMonth}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">AdSense</p>
          <p className="text-sm font-bold text-slate-100 mt-1">R$ {adsense.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Membros</p>
          <p className="text-sm font-bold text-slate-100 mt-1">R$ {membros.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Super Chat</p>
          <p className="text-sm font-bold text-slate-100 mt-1">R$ {superchats.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Total Acumulado</p>
          <p className="text-xl font-black text-slate-50 font-mono mt-0.5">R$ {total.toFixed(2)}</p>
        </div>
        <div className="text-right font-mono">
          <p className="text-[9px] text-slate-500">Projeção Próximo Mês</p>
          <p className="text-xs font-semibold text-emerald-400 mt-0.5">R$ {(total * 1.15).toFixed(2)} (+15%)</p>
        </div>
      </div>

      <div className="bg-[#1b2a22] border border-emerald-500/10 rounded-xl p-3 flex gap-2.5 items-start">
        <Award className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-emerald-300 font-sans leading-normal">
          <p className="font-semibold mb-0.5">Melhor vídeo do canal:</p>
          <span>"Gamma App Review Completo" rendeu sozinho <strong>R$ 186,00</strong> neste período de 30 dias.</span>
        </div>
      </div>
    </div>
  );
};
