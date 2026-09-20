import React, { useState } from 'react';
import { Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface Props {
  content: string;
}

export const ThumbnailGallery: React.FC<Props> = ({ content }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Parse thumbnail blocks if possible, or display rich formatted text
  const parseThumbnails = (raw: string) => {
    const blocks = raw.split(/Conceito \d+:|Thumbnail #\d+/i).filter((b) => b.trim().length > 10);

    if (blocks.length >= 2) {
      return blocks.map((block, idx) => {
        const textMatch = block.match(/Texto:?\s*([^\n]+)/i) || block.match(/Texto na Thumbnail:?\s*([^\n]+)/i);
        const visualMatch = block.match(/Visual:?\s*([^\n]+)/i) || block.match(/Descrição Visual:?\s*([^\n]+)/i);
        const promptMatch = block.match(/Prompt:?\s*([^\n]+)/i) || block.match(/Prompt MJ:?\s*([^\n]+)/i);
        const hexMatch = block.match(/HEX:?\s*(#[0-9a-fA-F]{3,6})/i) || block.match(/(#[0-9a-fA-F]{6})/);
        const exprMatch = block.match(/Expressão:?\s*([^\n]+)/i);

        return {
          id: idx + 1,
          title: `Opção #${idx + 1}`,
          text: textMatch ? textMatch[1].trim().replace(/^["']|["']$/g, '') : `THUMBNAIL #${idx + 1}`,
          visual: visualMatch ? visualMatch[1].trim() : block.slice(0, 150),
          prompt: promptMatch ? promptMatch[1].trim() : block,
          hex: hexMatch ? hexMatch[1] : '#0f172a',
          expression: exprMatch ? exprMatch[1].trim() : 'Surpreso / Empolgado',
        };
      });
    }

    // Default 5 parsed fallback placeholders if unstructured text
    return [
      { id: 1, title: 'Opção #1 — Oportunidade', text: 'GRÁTIS E MELHOR', visual: 'Rosto surpreso à esquerda, logo da IA à direita', prompt: 'YouTube thumbnail, surprised face left, logo right, dark blue background, bold yellow text GRÁTIS E MELHOR, 4k', hex: '#1e3a8a', expression: 'Surpresa' },
      { id: 2, title: 'Opção #2 — Rival/Inovação', text: 'ADEUS CHATGPT?', visual: 'Comparação visual dividida ao meio com brilho neon', prompt: 'Split screen YouTube thumbnail, ChatGPT left, new AI logo right with neon glow, bold text ADEUS CHATGPT, high contrast', hex: '#312e81', expression: 'Curiosidade' },
      { id: 3, title: 'Opção #3 — Curiosidade', text: 'ISSO É LEGAL?!', visual: 'Fundo escuro dramático com efeito de segredo revelado', prompt: 'Dramatic YouTube thumbnail, secret AI tool interface, dark atmospheric background, bright glowing text ISSO É LEGAL, 4k', hex: '#881337', expression: 'Choque' },
      { id: 4, title: 'Opção #4 — Mágica/Velocidade', text: 'FEITO EM SECONDS', visual: 'Cronômetro 3D e raio de velocidade sobre tela do site', prompt: 'YouTube thumbnail, 3D timer icon, lightning speed effects, bright cyan background, bold text FEITO EM SECONDS', hex: '#0e7490', expression: 'Empolgação' },
      { id: 5, title: 'Opção #5 — Veredito', text: 'TESTEI O SITE!', visual: 'Selo de aprovação em destaque e interface do site', prompt: 'YouTube thumbnail, verified badge, clean dashboard preview, deep dark blue background, bold white text TESTEI O SITE', hex: '#064e3b', expression: 'Satisfação' },
    ];
  };

  const items = parseThumbnails(content);

  const copyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-slate-100 text-lg">5 Opções de Thumbnails e Prompts de IA</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          Midjourney / DALL-E / Leonardo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-lg"
          >
            {/* Visual Thumbnail Card Mockup */}
            <div
              className="h-44 p-4 relative flex flex-col justify-between items-center text-center shadow-inner overflow-hidden"
              style={{ backgroundColor: item.hex }}
            >
              <div className="w-full flex items-center justify-between text-xs text-white/80 font-mono drop-shadow">
                <span>{item.title}</span>
                <span className="bg-black/40 px-2 py-0.5 rounded border border-white/20">{item.hex}</span>
              </div>

              {/* Text Overlay */}
              <div className="my-auto">
                <span className="text-2xl md:text-3xl font-black text-amber-300 tracking-tight uppercase px-3 py-1 bg-black/60 rounded-lg backdrop-blur-sm border border-amber-400/40 drop-shadow-xl inline-block">
                  {item.text}
                </span>
              </div>

              <div className="w-full text-right text-[10px] text-slate-200/90 font-medium">
                😊 Expressão: {item.expression}
              </div>
            </div>

            {/* Details & Prompt */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-slate-900">
              <div>
                <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-2">
                  <strong className="text-slate-100">Visual:</strong> {item.visual}
                </p>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 break-words max-h-24 overflow-y-auto">
                  {item.prompt}
                </div>
              </div>

              <button
                onClick={() => copyPrompt(item.prompt, idx)}
                className="w-full mt-3 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Prompt Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copiar Prompt Midjourney</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Raw Fallback Content display if needed */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2 text-slate-400 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Texto Completo do Gerador de Thumbnails:</span>
        </div>
        {content}
      </div>
    </div>
  );
};
