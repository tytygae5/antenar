import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, VolumeX, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { StepProgressBlock, StepItem } from './blocks/StepProgressBlock';
import { ArtifactBlock } from './blocks/ArtifactBlock';
import UploadProgressBlock from './blocks/UploadProgressBlock';
import AnalyticsBlock from './blocks/AnalyticsBlock';
import CommentsBlock from './blocks/CommentsBlock';
import { DiscoveryBlock } from './blocks/DiscoveryBlock';
import { AvatarVideoBlock } from './blocks/AvatarVideoBlock';
import { ShortsBlock } from './blocks/ShortsBlock';
import { ABTestBlock } from './blocks/ABTestBlock';
import { TranslationBlock } from './blocks/TranslationBlock';
import { CompetitorBlock } from './blocks/CompetitorBlock';
import { RevenueBlock } from './blocks/RevenueBlock';
import { AutoBatchBlock } from './blocks/AutoBatchBlock';
import { VideoPackage, VideoAnalysisReport } from '../types';

export function sanitizeModelBadge(model?: string) {
  if (!model) return 'gemini-2.5-flash';
  const map: Record<string, string> = {
    'gemini-3.5-flash': 'gemini-2.5-flash',
    'gemini-3.1-flash': 'gemini-2.5-flash',
    'gemini-3.8-flash': 'gemini-2.5-flash',
    'gemini-3.1-flash-lite': 'gemini-2.5-flash',
    'gemini-3.1-pro': 'gemini-2.5-pro',
    'gemini-flash-latest': 'gemini-2.5-flash',
    'gemini-pro-latest': 'gemini-2.5-pro',
  };
  return map[model] || model;
}

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
  provider?: string;
  model?: string;
  isStreaming?: boolean;
  error?: boolean;
  showDebugLogs?: boolean;
  inlineBlock?: any;
  steps?: StepItem[];
  artifact?: {
    kind: 'video_package' | 'video_review' | 'upload_progress' | 'youtube_analytics' | 'youtube_comments' | 'discovery-list' | 'discovery_list' | 'avatar_video' | 'shorts_block' | 'ab_test_block' | 'translation_block' | 'competitor_block' | 'revenue_block' | 'auto-batch';
    package?: VideoPackage;
    report?: VideoAnalysisReport;
    progress?: any;
    days?: number;
    videoId?: string;
    videoTitle?: string;
    data?: any;
    comments?: any[];
    content?: any[];
    languages?: any[];
    competitors?: any[];
    revenue?: any;
  };
  fallbackTrace?: Array<{
    tier: string;
    provider: string;
    model: string;
    status: string;
    latencyMs?: number;
  }>;
  onCancelInlineBlock?: () => void;
  onDiscutirArtifact?: (prompt: string) => void;
  onRefazerArtifact?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  image,
  provider,
  model,
  isStreaming = false,
  error = false,
  showDebugLogs = false,
  inlineBlock,
  steps = [],
  artifact,
  fallbackTrace = [],
  onCancelInlineBlock,
  onDiscutirArtifact,
  onRefazerArtifact,
}) => {
  const isUser = role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  // Filter unsolicited scraping hallucination code blocks
  const displayContent = React.useMemo(() => {
    if (!content || isUser) return content;
    let cleaned = content;
    cleaned = cleaned.replace(/```(?:python|javascript|js)?[\s\S]*?(?:import requests|from bs4|BeautifulSoup|webdriver|playwright)[\s\S]*?```/gi, '');
    cleaned = cleaned.replace(/(?:import requests|from bs4 import BeautifulSoup)[\s\S]*?(?:results\s*=\s*\[|print\(|return results)/gi, '');
    return cleaned;
  }, [content, isUser]);

  const handleCopy = () => {
    if (!displayContent) return;
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(displayContent);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="message-wrapper">
      {/* Bolha principal estilo WhatsApp / ChatGPT puro */}
      <div
        className={`message ${isUser ? 'user' : 'assistant'} group ${
          error ? '!bg-[#2a1215] !text-[#fca5a5] !border-red-900/50' : ''
        }`}
        id={`bubble-${role}`}
      >
        {/* Mídia Anexada (Imagem ou Vídeo) */}
        {image && (
          <div className="mb-2 overflow-hidden rounded-lg max-h-72 max-w-md">
            {image.startsWith('data:video/') || /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(image) ? (
              <video
                src={image}
                controls
                className="w-full h-auto max-h-64 rounded-lg bg-black/40 border border-[#232733]"
              />
            ) : (
              <img
                src={image}
                alt="Anexo"
                className="object-cover w-full h-auto rounded-lg"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        )}

        {/* Conteúdo da mensagem */}
        {displayContent ? (
          <div className="content select-text">
            {isUser ? (
              <p className="whitespace-pre-wrap">{displayContent}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-[#e5e7eb] leading-relaxed">
                <ReactMarkdown
                  components={{
                    a: ({ href, children, ...props }) => {
                      if (href?.startsWith('sandbox://') || href?.startsWith('https://sandbox://')) {
                        let cleanHref = href;
                        if (href.startsWith('https://sandbox://')) {
                          cleanHref = href.substring(8); // remove https://
                        }
                        try {
                          const urlObj = new URL(cleanHref);
                          const name = urlObj.searchParams.get('name') || '';
                          const urlVal = urlObj.searchParams.get('url') || '';
                          const desc = urlObj.searchParams.get('desc') || '';
                          const presetText = `/video-preset name="${name}" url="${urlVal}" desc="${desc}"`;
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (onDiscutirArtifact) {
                                  onDiscutirArtifact(presetText);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1.5 bg-[#10a37f]/20 hover:bg-[#10a37f]/35 text-[#10a37f] hover:text-[#10a37f]/90 text-[11px] font-bold border border-[#10a37f]/30 rounded-lg cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                            >
                              🎬 Criar Vídeo para {name}
                            </button>
                          );
                        } catch (err) {
                          console.error('Failed to parse sandbox URL:', cleanHref);
                        }
                      }
                      return (
                        <a href={href} target="_blank" rel="noreferrer" {...props}>
                          {children}
                        </a>
                      );
                    }
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
                {isStreaming && <span className="streaming-cursor">▋</span>}
              </div>
            )}
          </div>
        ) : isStreaming && steps.length === 0 ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="streaming-cursor">▋</span>
          </div>
        ) : null}

        {/* Etapas de Progresso Inline */}
        {steps.length > 0 && (
          <StepProgressBlock
            title={
              steps[0]?.pipeline === 'discover'
                ? '🔎 Busca Profunda de IAs'
                : steps[0]?.pipeline === 'review'
                ? '🔍 Analisando Vídeo'
                : steps[0]?.pipeline === 'publish'
                ? '📤 Publicando no YouTube'
                : steps[0]?.pipeline === 'video'
                ? '🎬 Gerando Pacote do Vídeo'
                : artifact?.kind === 'video_review'
                ? '🔍 Analisando vídeo...'
                : artifact?.kind === 'upload_progress'
                ? '📤 Enviando vídeo...'
                : '🎬 Gerando pacote do vídeo...'
            }
            steps={steps}
          />
        )}

        {/* Artefato Completo */}
        {artifact && (
          artifact.kind === 'upload_progress' ? (
            <UploadProgressBlock
              step={artifact.progress?.step || '1/5'}
              percent={artifact.progress?.percent || 0}
              message={artifact.progress?.message || 'Processando upload...'}
              sent={artifact.progress?.sent}
              total={artifact.progress?.total}
              error={artifact.progress?.error}
              videoId={artifact.progress?.videoId}
              url={artifact.progress?.url}
              metadata={artifact.progress?.metadata}
            />
          ) : artifact.kind === 'youtube_analytics' ? (
            <AnalyticsBlock
              days={artifact.days || 7}
              videoId={artifact.videoId}
              videoTitle={artifact.videoTitle}
              data={artifact.data}
            />
          ) : artifact.kind === 'youtube_comments' ? (
            <CommentsBlock comments={artifact.comments || []} />
          ) : artifact.kind === 'avatar_video' ? (
            <AvatarVideoBlock
              name={artifact.videoTitle || artifact.package?.name}
              avatarId={artifact.data?.avatarId}
              format={artifact.data?.format}
              voiceId={artifact.data?.voiceId}
              duration={artifact.data?.duration}
              downloadUrl={artifact.data?.downloadUrl}
              previewUrl={artifact.data?.previewUrl}
            />
          ) : artifact.kind === 'shorts_block' ? (
            <ShortsBlock
              shorts={artifact.content}
            />
          ) : artifact.kind === 'ab_test_block' ? (
            <ABTestBlock
              videoTitle={artifact.videoTitle}
              thumbnails={artifact.content}
            />
          ) : artifact.kind === 'translation_block' ? (
            <TranslationBlock
              languages={artifact.languages}
            />
          ) : artifact.kind === 'competitor_block' ? (
            <CompetitorBlock
              competitors={artifact.competitors}
            />
          ) : artifact.kind === 'revenue_block' ? (
            <RevenueBlock
              adsense={artifact.revenue?.adsense}
              membros={artifact.revenue?.membros}
              superchats={artifact.revenue?.superchats}
              total={artifact.revenue?.total}
              trend={artifact.revenue?.trend}
              history={artifact.revenue?.history}
            />
          ) : artifact.kind === 'auto-batch' ? (
            <AutoBatchBlock
              content={artifact.content || []}
              onAction={onDiscutirArtifact}
            />
          ) : artifact.kind === 'discovery-list' || artifact.kind === 'discovery_list' ? (
            <DiscoveryBlock
              items={artifact.content || []}
              onMakeVideo={(name, url, desc) => {
                if (onDiscutirArtifact) {
                  const lines = [`/video`, `Nome: ${name}`, `Site: ${url}`];
                  if (desc && desc !== 'undefined' && desc !== 'não sei') {
                    lines.push(`Descrição: ${desc}`);
                  }
                  onDiscutirArtifact(lines.join('\n'));
                }
              }}
            />
          ) : (
            <ArtifactBlock
              kind={artifact.kind as any}
              pkgData={artifact.package || (artifact.content as any)}
              reportData={artifact.report || (artifact.content as any)}
              onDiscutir={onDiscutirArtifact}
              onRefazer={onRefazerArtifact}
            />
          )
        )}
      </div>

      {/* Botões Ouvir/Copiar (Aparecem no hover da bolha do assistente) */}
      {!isUser && !error && content && !isStreaming && (
        <div className="message-actions">
          <button
            type="button"
            onClick={handleSpeak}
            className="action-btn"
            title={isPlaying ? 'Parar áudio' : 'Ouvir resposta'}
            id="btn-speak-message"
          >
            {isPlaying ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="action-btn"
            title="Copiar texto"
            id="btn-copy-message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10a37f]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {(model || provider) && (
            <div className="flex items-center gap-1.5 ml-1.5 text-[10px] text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded-md border border-slate-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-mono">{sanitizeModelBadge(model || provider)}</span>
              {showDebugLogs && fallbackTrace.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTrace(!showTrace)}
                  className="action-btn !p-0.5 ml-1 text-slate-400 hover:text-white"
                  title="Ver trace"
                >
                  {showTrace ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Debug trace expandido se ativado */}
      {showDebugLogs && showTrace && fallbackTrace.length > 0 && (
        <div className="mt-1 mb-2 p-2 bg-[#0f1115] border border-slate-800 rounded-lg text-[11px] text-slate-400 max-w-[75%] space-y-1">
          <div className="font-semibold text-[#10a37f]">Trace de Execução:</div>
          {fallbackTrace.map((t, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span>{t.tier}: {t.provider} ({sanitizeModelBadge(t.model)})</span>
              <span className={`font-mono ${t.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                {t.status} {t.latencyMs ? `(${t.latencyMs}ms)` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
