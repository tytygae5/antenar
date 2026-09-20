import React from 'react';
import { TrendingUp, Users, Clock, ThumbsUp, MessageSquare, Play, Lightbulb } from 'lucide-react';

interface AnalyticsBlockProps {
  days: number;
  videoId?: string | null;
  videoTitle?: string;
  data: {
    views: number;
    estimatedMinutesWatched: number;
    averageViewDuration: number;
    averageViewPercentage: number;
    subscribersGained: number;
    likes: number;
    comments: number;
    shares: number;
    topVideos?: Array<{
      id: string;
      title: string;
      views: number;
      ctr: number;
    }>;
  };
  onCreateSimilar?: () => void;
}

export default function AnalyticsBlock({
  days,
  videoId,
  videoTitle,
  data,
  onCreateSimilar
}: AnalyticsBlockProps) {
  // Converte minutos para horas
  const hoursWatched = (data.estimatedMinutesWatched / 60).toFixed(0);
  
  // Formatador de número
  const formatNum = (val: number) => {
    return new Intl.NumberFormat('pt-BR').format(val);
  };

  // Se for um vídeo específico, mostramos o gráfico de retenção em blocos ASCII conforme especificado
  const showRetentionGraph = Boolean(videoId);

  return (
    <div id="analytics-block" className="my-6 p-6 bg-white border border-neutral-200 rounded-xl max-w-2xl mx-auto shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">
            {videoId ? `Análise — "${videoTitle || 'Vídeo Específico'}"` : `Analytics — Últimos ${days} dias`}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Métricas oficiais extraídas em tempo real do YouTube Studio
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
          Oficial API
        </span>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <TrendingUp className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium">Views Totais</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{formatNum(data.views)}</span>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium">Tempo Assistido</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{hoursWatched}h</span>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium">Inscritos Ganhos</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">+{data.subscribersGained}</span>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <ThumbsUp className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium">Likes</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{formatNum(data.likes)}</span>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <MessageSquare className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium">Comentários</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{formatNum(data.comments)}</span>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <TrendingUp className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-medium">Retenção Média</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">{data.averageViewPercentage}%</span>
        </div>
      </div>

      {/* Gráfico de Retenção (se for de vídeo específico) */}
      {showRetentionGraph && (
        <div className="mb-6 p-4 bg-neutral-50 border border-neutral-150 rounded-lg">
          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
            📈 Gráfico de Retenção Estimado
          </h4>
          <div className="font-mono text-xs text-neutral-600 overflow-x-auto whitespace-pre">
            {`100% ┤████████████████
 75% ┤████████████████████████████
 50% ┤████████████████████████████████████
 25% ┤████████████████████████████████████████████
  0% ┤████████████████████████████████████████████████
     └─0──1──2──3──4──5──6──7min`}
          </div>
          <div className="mt-3 flex flex-col gap-1 text-xs text-neutral-500">
            <span className="text-red-500 font-semibold">⚠️ Queda significativa em 2:15 — reveja esse trecho.</span>
            <span className="text-emerald-600 font-semibold">✅ Gancho forte nos primeiros 30s (90% retenção).</span>
          </div>
        </div>
      )}

      {/* Top 3 Vídeos (se for consolidação de canal) */}
      {!videoId && data.topVideos && data.topVideos.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
            🏆 Vídeos em Destaque no Período
          </h4>
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                  <th className="p-3">Título do Vídeo</th>
                  <th className="p-3 text-right">Views</th>
                  <th className="p-3 text-right">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {data.topVideos.map((v, i) => (
                  <tr key={v.id || i} className="hover:bg-neutral-50">
                    <td className="p-3 font-medium flex items-center gap-2">
                      <span className="text-neutral-400 font-bold">{i + 1}.</span>
                      <span className="line-clamp-1">{v.title}</span>
                    </td>
                    <td className="p-3 text-right font-mono">{formatNum(v.views)}</td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-semibold">{v.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights e Aprendizado */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-900">🧠 Insight do Assistente</h4>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            {videoId
              ? "Nos próximos vídeos, corte o bloco 2 (intro longa) e vá direto ao demo. O vídeo anterior que fez isso teve retenção 67%."
              : "O vídeo do Gamma App performou 34% acima da média. Motivo provável: título com número + thumbnail com rosto. Vou aplicar esse padrão nos próximos 5 vídeos."}
          </p>
        </div>
      </div>

      {/* Ações */}
      {onCreateSimilar && (
        <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-100">
          <button
            onClick={onCreateSimilar}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Criar Vídeo Similar
          </button>
        </div>
      )}
    </div>
  );
}
