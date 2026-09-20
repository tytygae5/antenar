import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Video,
  ListChecks,
  Image as ImageIcon,
  FileCode,
  Mic,
  Archive,
} from 'lucide-react';
import JSZip from 'jszip';
import { VideoPackage, VideoAnalysisReport } from '../../types';
import { ReviewReport } from './ReviewReport';

function renderSEO(seo: any) {
  if (!seo) return <em>SEO não gerado</em>;
  if (typeof seo === 'string') return <pre>{seo}</pre>;
  
  return (
    <div className="seo-block">
      {seo.titles && (
        <section className="mb-3">
          <h3 className="font-bold text-amber-300 mb-1">📌 Títulos ({seo.titles.length})</h3>
          <ol className="list-decimal list-inside space-y-1">
            {seo.titles.map((t: any, i: number) => <li key={i}>{String(t)}</li>)}
          </ol>
        </section>
      )}
      {seo.description && (
        <section className="mb-3">
          <h3 className="font-bold text-blue-300 mb-1">📝 Descrição</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }} className="bg-slate-900/50 p-3 rounded-lg text-slate-300">{String(seo.description)}</pre>
        </section>
      )}
      {seo.tags && (
        <section>
          <h3 className="font-bold text-emerald-300 mb-1">🏷️ Tags ({Array.isArray(seo.tags) ? seo.tags.length : 0})</h3>
          <p className="text-slate-400">{Array.isArray(seo.tags) ? seo.tags.join(', ') : String(seo.tags)}</p>
        </section>
      )}
    </div>
  );
}

function renderThumbnails(thumbs: any) {
  if (!thumbs) return <em>Thumbnails não geradas</em>;
  if (typeof thumbs === 'string') return <pre>{thumbs}</pre>;
  if (!Array.isArray(thumbs)) return <pre>{JSON.stringify(thumbs, null, 2)}</pre>;
  
  return (
    <div className="space-y-3">
      {thumbs.map((t: any, i: number) => (
        <div key={i} className="thumb-card p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <h4 className="font-bold text-amber-400 mb-1">#{i + 1} — {String(t.text || t.title || '')}</h4>
          <p className="text-slate-300 mb-1">{String(t.visual || t.description || '')}</p>
          {t.mjPrompt && <code className="block text-[11px] bg-black/40 p-2 rounded text-blue-300 font-mono mb-1">{String(t.mjPrompt)}</code>}
          {t.bgColor && <span className="inline-block text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Cor: {String(t.bgColor)}</span>}
        </div>
      ))}
    </div>
  );
}

function renderSRT(srt: any) {
  if (!srt) return <em>Legendas não geradas</em>;
  const text = typeof srt === 'string' ? srt : (srt.content || srt.text || JSON.stringify(srt, null, 2));
  return <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }} className="font-mono text-xs text-slate-300">{text}</pre>;
}

function renderTTS(tts: any) {
  if (!tts) return <em>TTS não gerado</em>;
  const text = typeof tts === 'string' ? tts : (tts.text || tts.content || JSON.stringify(tts, null, 2));
  return <pre style={{ whiteSpace: 'pre-wrap' }} className="font-sans text-xs text-slate-300">{text}</pre>;
}

function renderChecklist(check: any) {
  if (!check) return <em>Checklist não gerado</em>;
  if (Array.isArray(check)) {
    return <ul className="list-disc list-inside space-y-1">{check.map((item: any, i: number) => <li key={i}>{String(item)}</li>)}</ul>;
  }
  const text = typeof check === 'string' ? check : (check.text || JSON.stringify(check));
  return <pre style={{ whiteSpace: 'pre-wrap' }} className="font-sans text-xs text-slate-300">{text}</pre>;
}

function renderScript(script: any) {
  if (!script) return <em>Roteiro não gerado</em>;
  const text = typeof script === 'string' ? script : (script.text || script.content || JSON.stringify(script));
  return <div style={{ whiteSpace: 'pre-wrap' }} className="font-sans text-xs text-slate-200 leading-relaxed">{text}</div>;
}

export interface ArtifactBlockProps {
  kind?: string;
  pkgData?: VideoPackage;
  reportData?: VideoAnalysisReport;
  onDiscutir?: (prompt: string) => void;
  onRefazer?: () => void;
}

export const ArtifactBlock: React.FC<ArtifactBlockProps> = ({
  kind = 'video_package',
  pkgData,
  reportData,
  onDiscutir,
  onRefazer,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadFile = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeoPlain = (seo: any) => {
    if (!seo) return '';
    if (typeof seo === 'object') {
      return `### TÍTULOS:\n${(seo.titles || []).join('\n')}\n\n### DESCRIÇÃO:\n${seo.description || ''}\n\n### TAGS:\n${(seo.tags || []).join(', ')}`;
    }
    return String(seo);
  };

  const getThumbsPlain = (thumbs: any) => {
    if (!thumbs) return '';
    if (Array.isArray(thumbs)) {
      return thumbs.map((t: any, i: number) => `Opção ${i+1}: ${t.text} | Visual: ${t.visual}`).join('\n');
    }
    return String(thumbs);
  };

  const downloadZipPackage = async () => {
    if (!pkgData) return;
    try {
      const zip = new JSZip();
      const folderName = `Pacote_Video_${String(pkgData.name || 'video').replace(/\s+/g, '_')}`;

      zip.file(`${folderName}/01_ROTEIRO.txt`, String(pkgData.script || ''));
      zip.file(`${folderName}/02_SEO.txt`, getSeoPlain(pkgData.seo));
      zip.file(`${folderName}/03_THUMBNAILS.txt`, getThumbsPlain(pkgData.thumbnails));
      zip.file(`${folderName}/04_LEGENDAS.srt`, String(pkgData.srt || ''));
      zip.file(`${folderName}/05_TTS.txt`, String(pkgData.ttsText || ''));
      zip.file(`${folderName}/06_CHECKLIST.md`, String(pkgData.checklist || ''));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar zip:', err);
    }
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  try {
    if (kind === 'video_package' || kind === 'video-package') {
      const pkg = pkgData || {};
      const scriptStr = typeof pkg.script === 'string' ? pkg.script : (pkg.script?.content || '');
      if (!pkg || !scriptStr || scriptStr.length < 100) {
        console.warn('[Render] Video package vazio, ignorando');
        return null;
      }
      const wordCount = scriptStr.split(/\s+/).filter(Boolean).length;

      return (
        <div className="artifact-container my-4 text-xs text-slate-200 bg-[#161920] border border-[#10a37f]/50 rounded-2xl shadow-xl overflow-hidden">
          {/* Cabeçalho */}
          <div className="p-4 bg-[#10a37f]/10 border-b border-[#2a2f3a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#10a37f] text-white rounded-xl shadow-md">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🎬 {String(pkg.name || 'Pacote do Vídeo')} <span className="text-emerald-400">✅</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  {String(pkg.url || '')} • {String(pkg.duration || '')} • {String(pkg.tone || '')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadZipPackage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10a37f] hover:bg-[#0e8e6e] text-white rounded-xl font-bold transition-all shadow-md cursor-pointer text-[11px]"
              title="Baixar pacote completo em .ZIP"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>.ZIP Completo</span>
            </button>
          </div>

          {/* Barra de Navegação Sticky */}
          <div className="flex gap-2 p-2 bg-[#0b0f17] border-b border-[#2a2f3a] overflow-x-auto sticky top-0 z-10">
            <button type="button" onClick={() => handleScrollTo('roteiro')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer whitespace-nowrap">📝 Roteiro</button>
            <button type="button" onClick={() => handleScrollTo('seo')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer whitespace-nowrap">📋 SEO</button>
            <button type="button" onClick={() => handleScrollTo('thumbnails')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer whitespace-nowrap">🖼️ Thumbnails</button>
            <button type="button" onClick={() => handleScrollTo('srt')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer whitespace-nowrap">📄 SRT</button>
            <button type="button" onClick={() => handleScrollTo('tts')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer whitespace-nowrap">🎙️ TTS</button>
            <button type="button" onClick={() => handleScrollTo('checklist')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer whitespace-nowrap">✅ Checklist</button>
          </div>

          {/* Conteúdo */}
          <div className="p-5 space-y-8">
            <div id="roteiro" className="scroll-mt-16">
              <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-2 mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Roteiro Completo ({wordCount} palavras)</span>
                </h4>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => copyToClipboard(scriptStr, 'script')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1">
                    {copiedSection === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                  <button type="button" onClick={() => downloadFile(`Roteiro_${pkg.name || 'video'}.txt`, scriptStr)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
              <div className="bg-[#080b12] p-4 rounded-xl border border-slate-800 max-h-[500px] overflow-y-auto">
                {renderScript(pkg.script)}
              </div>
            </div>

            <div id="seo" className="scroll-mt-16">
              <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-2 mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Pacote SEO</span>
                </h4>
                <button type="button" onClick={() => copyToClipboard(getSeoPlain(pkg.seo), 'seo')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1">
                  {copiedSection === 'seo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar</span>
                </button>
              </div>
              <div className="bg-[#080b12] p-4 rounded-xl border border-slate-800 max-h-[400px] overflow-y-auto">
                {renderSEO(pkg.seo)}
              </div>
            </div>

            <div id="thumbnails" className="scroll-mt-16">
              <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-2 mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>Thumbnails</span>
                </h4>
                <button type="button" onClick={() => copyToClipboard(getThumbsPlain(pkg.thumbnails), 'thumbnails')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1">
                  {copiedSection === 'thumbnails' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar</span>
                </button>
              </div>
              <div className="bg-[#080b12] p-4 rounded-xl border border-slate-800 max-h-[400px] overflow-y-auto">
                {renderThumbnails(pkg.thumbnails)}
              </div>
            </div>

            <div id="srt" className="scroll-mt-16">
              <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-2 mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Legendas (.srt)</span>
                </h4>
                <button type="button" onClick={() => downloadFile(`${pkg.name || 'video'}.srt`, String(pkg.srt || ''))} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Baixar .srt</span>
                </button>
              </div>
              <div className="bg-[#080b12] p-4 rounded-xl border border-slate-800 max-h-[400px] overflow-y-auto">
                {renderSRT(pkg.srt)}
              </div>
            </div>

            <div id="tts" className="scroll-mt-16">
              <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-2 mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span>Texto TTS</span>
                </h4>
                <button type="button" onClick={() => copyToClipboard(String(pkg.ttsText || pkg.tts || ''), 'tts')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1">
                  {copiedSection === 'tts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar</span>
                </button>
              </div>
              <div className="bg-[#080b12] p-4 rounded-xl border border-slate-800 max-h-[400px] overflow-y-auto">
                {renderTTS(pkg.ttsText || pkg.tts)}
              </div>
            </div>

            <div id="checklist" className="scroll-mt-16">
              <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-2 mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span>Checklist</span>
                </h4>
                <button type="button" onClick={() => copyToClipboard(String(pkg.checklist || ''), 'checklist')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer flex items-center gap-1">
                  {copiedSection === 'checklist' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar</span>
                </button>
              </div>
              <div className="bg-[#080b12] p-4 rounded-xl border border-slate-800">
                {renderChecklist(pkg.checklist)}
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onDiscutir?.(`Gostei do roteiro do vídeo ${pkg.name}! Pode me ajudar a revisar ou melhorar os ganchos iniciais?`)}
              className="flex items-center gap-2 px-3 py-2 bg-[#10a37f]/20 hover:bg-[#10a37f]/30 text-[#10a37f] border border-[#10a37f]/40 rounded-xl font-bold transition-all cursor-pointer text-[11px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 Discutir com o agente</span>
            </button>

            {onRefazer && (
              <button
                type="button"
                onClick={onRefazer}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all cursor-pointer text-[11px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>🔄 Refazer com outro tom</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    if (kind === 'discovery-list') {
      const list = Array.isArray(pkgData) ? pkgData : [];
      return (
        <div className="space-y-2">
          {list.map((ia: any, i: number) => (
            <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white">{String(ia.name || '')}</h4>
              <p className="text-slate-300">{String(ia.desc || ia.description || '')}</p>
              {ia.url && <a href={`https://${ia.url}`} target="_blank" rel="noreferrer" className="text-emerald-400 underline">🌐 {String(ia.url)}</a>}
            </div>
          ))}
        </div>
      );
    }

    if (kind === 'review-report-rendered' || reportData) {
      return <ReviewReport content={reportData || pkgData} />;
    }

    return <pre>{typeof pkgData === 'string' ? pkgData : JSON.stringify(pkgData, null, 2)}</pre>;

  } catch (err: any) {
    console.error('[ArtifactBlock] Crash ao renderizar:', err);
    return (
      <div style={{ color: 'red', padding: 12, background: '#2a1215', borderRadius: 8 }}>
        ❌ Erro ao renderizar pacote: {err.message}
        <pre className="mt-2 text-[10px]">{JSON.stringify(pkgData || reportData, null, 2)?.slice(0, 500)}</pre>
      </div>
    );
  }
};
