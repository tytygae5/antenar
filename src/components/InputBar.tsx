import React, { useRef, useState, useEffect } from 'react';
import { Video, Search, Eye, Paperclip, Mic, MicOff, Send, X, Loader2, Trash2, RotateCcw, Key, Play, Scissors, Globe, Radio, Bell, Layers, Tv, DollarSign, Sparkles } from 'lucide-react';
import { parseUploadedFile } from '../lib/fileParser';
import { SlashCommandMenu, SlashCommand } from './SlashCommandMenu';

export interface InputBarProps {
  onSend: (text: string, imageBase64?: string) => void;
  onOpenVideoForm?: () => void;
  onClearCache: () => void;
  onResetChat: () => void;
  isLoading: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSend,
  onOpenVideoForm,
  onClearCache,
  onResetChat,
  isLoading,
}) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedName, setAttachedName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-resize do textarea e verificação de slash command
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }

    if (text.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashFilter(text.slice(1));
    } else {
      setShowSlashMenu(false);
      setSlashFilter('');
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !attachedImage) || isLoading) return;

    const trimmed = text.trim();

    if (trimmed === '/limpar') {
      onClearCache();
      onSend('🧹 Limpando o cache e circuit breakers do sistema...', undefined);
      setText('');
      setShowSlashMenu(false);
      return;
    }

    if (trimmed === '/reset') {
      onResetChat();
      setText('');
      setShowSlashMenu(false);
      return;
    }

    if (trimmed === '/help') {
      onSend(
        `📜 **Comandos de Poder Disponíveis:**\n\n` +
        `- \`/video\` ou \`/criar\`: Inicia a criação conversacional de vídeo\n` +
        `- \`/revisar\`: Inicia a revisão conversacional de pós-produção\n` +
        `- \`/auto\`: Modo Autônomo Total de ponta a ponta sem intervenção\n` +
        `- \`/limpar\`: Limpa cache e reseta circuit breakers\n` +
        `- \`/reset\`: Inicia uma conversa nova e limpa\n` +
        `- \`/modelo [nome]\`: Força um modelo específico para a conversa\n` +
        `- \`/conectar-heygen\`: Conecta sua conta do HeyGen para Avatares\n` +
        `- \`/gerar-video\`: Gera o vídeo com Avatar IA do HeyGen\n` +
        `- \`/shorts\`: Gera 3 Shorts verticais inteligentes\n` +
        `- \`/auto-gravar [url]\`: Grava a tela de uma IA via automação\n` +
        `- \`/traduzir [lang]\`: Traduz e dubla para espanhol, inglês, etc.\n` +
        `- \`/monitorar [canal]\`: Monitora canal concorrente em tempo real\n` +
        `- \`/alertas\`: Configura notificações e limites de alertas\n` +
        `- \`/batch\`: Produção de múltiplos vídeos em série\n` +
        `- \`/serie [tema]\`: Cria série de vídeos sequenciais sobre um tema\n` +
        `- \`/receita\`: Exibe faturamento detalhado do canal\n` +
        `- \`/help\`: Exibe esta lista de ajuda`,
        undefined
      );
      setText('');
      setShowSlashMenu(false);
      return;
    }

    onSend(trimmed, attachedImage || undefined);
    setText('');
    setAttachedImage(null);
    setAttachedName(null);
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    setShowSlashMenu(false);
    cmd.action();
  };

  const slashCommandsList: SlashCommand[] = [
    {
      cmd: '/video',
      alias: '/criar',
      description: 'Inicia a criação conversacional de vídeo para YouTube 🎬',
      icon: Video,
      action: () => {
        setText('');
        onSend('/video');
      },
    },
    {
      cmd: '/revisar',
      description: 'Inicia a revisão conversacional de vídeo de pós-produção 🔍',
      icon: Eye,
      action: () => {
        setText('');
        onSend('/revisar');
      },
    },
    {
      cmd: '/descobrir',
      description: 'Descobre e analisa novas ferramentas de IA na internet 🔎',
      icon: Search,
      action: () => {
        setText('');
        onSend('/descobrir');
      },
    },
    {
      cmd: '/conectar-heygen',
      description: 'Autentica sua conta HeyGen / D-ID de Avatar 🔑',
      icon: Key,
      action: () => {
        setText('');
        onSend('/conectar-heygen');
      }
    },
    {
      cmd: '/gerar-video',
      description: 'Gera o vídeo completo com Avatar IA integrado 🎬',
      icon: Play,
      action: () => {
        setText('');
        onSend('/gerar-video');
      }
    },
    {
      cmd: '/shorts',
      description: 'Corta 3 Shorts inteligentes em vertical vertical 📱',
      icon: Scissors,
      action: () => {
        setText('');
        onSend('/shorts');
      }
    },
    {
      cmd: '/auto-gravar',
      description: 'Navega e grava a tela de uma IA usando automação browser 🎥',
      icon: Tv,
      action: () => {
        setText('/auto-gravar https://gamma.app');
      }
    },
    {
      cmd: '/traduzir',
      description: 'Traduz e dubla em espanhol, inglês, francês, etc. 🌍',
      icon: Globe,
      action: () => {
        setText('/traduzir es');
      }
    },
    {
      cmd: '/monitorar',
      description: 'Adiciona canal concorrente para monitorar uploads e virais 👁️',
      icon: Radio,
      action: () => {
        setText('/monitorar ');
      }
    },
    {
      cmd: '/alertas',
      description: 'Configura o painel de notificações ativas e proativas 🔔',
      icon: Bell,
      action: () => {
        setText('');
        onSend('/alertas');
      }
    },
    {
      cmd: '/auto',
      description: 'Modo Autônomo Total de ponta a ponta sem intervenção 🤖',
      icon: Sparkles,
      action: () => {
        setText('');
        onSend('/auto');
      }
    },
    {
      cmd: '/batch',
      description: 'Inicia produção automatizada em lote de 5 vídeos 📦',
      icon: Layers,
      action: () => {
        setText('');
        onSend('/batch');
      }
    },
    {
      cmd: '/serie',
      description: 'Cria uma série de vídeos sequenciais com teaser e ganchos 📚',
      icon: Tv,
      action: () => {
        setText('/serie ');
      }
    },
    {
      cmd: '/receita',
      description: 'Mostra os dados de AdSense, Membros e Receita do Canal 💰',
      icon: DollarSign,
      action: () => {
        setText('');
        onSend('/receita');
      }
    },
    {
      cmd: '/limpar',
      description: 'Limpa o cache semântico e reseta circuit breakers de API',
      icon: Trash2,
      action: () => {
        setText('');
        onClearCache();
        onSend('🧹 Limpando o cache e circuit breakers...', undefined);
      },
    },
    {
      cmd: '/reset',
      description: 'Inicia uma nova conversa totalmente limpa',
      icon: RotateCcw,
      action: () => {
        setText('');
        onResetChat();
      },
    },
    {
      cmd: '/help',
      description: 'Mostra todos os comandos de poder disponíveis',
      icon: Send,
      action: () => {
        setText('/help');
        handleSend();
      },
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name);
      const isImage = file.type.startsWith('image/');

      if (isImage || isVideo) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedImage(reader.result as string);
          setAttachedName(file.name);
        };
        reader.readAsDataURL(file);
      } else {
        const parsed = await parseUploadedFile(file);
        if (parsed.type === 'video' || parsed.type === 'image') {
          if (parsed.imageBase64) {
            setAttachedImage(parsed.imageBase64);
            setAttachedName(file.name);
          }
        } else {
          const fileText = parsed.textContent || '';
          setText((prev) => (prev ? `${prev}\n\n[Arquivo: ${file.name}]\n${fileText}` : `[Arquivo: ${file.name}]\n${fileText}`));
          setAttachedName(file.name);
        }
      }
    } catch (err) {
      console.error('Erro ao ler arquivo:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [micError, setMicError] = useState<string | null>(null);

  const startVoiceRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeVoice(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.warn('Erro ao acessar microfone:', err);
      setMicError('Não foi possível conectar ao microfone.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeVoice = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64, mimeType: 'audio/webm' }),
        });
        const data = await res.json();
        if (data.text) {
          setText((prev) => (prev ? `${prev} ${data.text}` : data.text));
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Falha na transcrição:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 pb-3" id="input-bar-container">
      {/* Menu Autocomplete de Slash Commands */}
      {showSlashMenu && (
        <SlashCommandMenu
          filter={slashFilter}
          onSelectCommand={handleSelectSlashCommand}
          onClose={() => setShowSlashMenu(false)}
          commands={slashCommandsList}
        />
      )}

      {/* Alerta de microfone */}
      {micError && (
        <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 bg-amber-950/80 border border-amber-800 text-amber-200 rounded-xl text-xs">
          <span>{micError}</span>
          <button
            type="button"
            onClick={() => setMicError(null)}
            className="text-amber-400 hover:text-white font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Preview de anexo */}
      {attachedName && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-[#161920] border border-[#232733] rounded-xl text-xs text-slate-200 w-fit">
          {attachedImage?.startsWith('data:video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(attachedName) ? (
            <Video className="w-3.5 h-3.5 text-[#10a37f]" />
          ) : (
            <Paperclip className="w-3.5 h-3.5 text-[#10a37f]" />
          )}
          <span className="truncate max-w-xs">{attachedName}</span>
          <button
            type="button"
            onClick={() => {
              setAttachedImage(null);
              setAttachedName(null);
            }}
            className="p-0.5 hover:text-red-400 rounded cursor-pointer"
            title="Remover anexo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BARRA ÚNICA: [🎬] [🔍] [📎] [🎤] [input__________] [➤] */}
      <div className="relative flex items-center gap-1.5 bg-[#161920] border border-[#232733] rounded-2xl p-2 focus-within:border-[#10a37f]/70 transition-all shadow-lg">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.txt,.js,.ts,.py,.json,.csv,.mp4,.webm,.mov,.avi,.mkv"
          id="file-input-element"
        />

        {/* 🎬 Botão Criar Vídeo (Conversacional) */}
        <button
          type="button"
          onClick={() => onSend('/video')}
          disabled={isLoading}
          className="p-2 text-[#10a37f] hover:bg-[#10a37f]/15 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Criar Vídeo (Conversa no Chat) - Digite /video"
          id="btn-inline-video"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* 🔍 Botão Revisar Vídeo (Conversacional) */}
        <button
          type="button"
          onClick={() => onSend('/revisar')}
          disabled={isLoading}
          className="p-2 text-blue-400 hover:bg-blue-500/15 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Revisar Vídeo (Conversa no Chat) - Digite /revisar"
          id="btn-inline-review"
        >
          <Eye className="w-5 h-5" />
        </button>

        {/* 🔎 Botão Descobrir Lançamentos (Conversacional) */}
        <button
          type="button"
          onClick={() => onSend('/descobrir')}
          disabled={isLoading}
          className="p-2 text-purple-400 hover:bg-purple-500/15 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Descobrir Novas IAs - Digite /descobrir"
          id="btn-inline-discover"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* 📎 Botão de Anexo */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Anexar arquivo ou imagem"
          id="btn-attach"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* 🎤 Botão de Microfone */}
        <button
          type="button"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={isLoading || isTranscribing}
          className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            isRecording
              ? 'bg-red-500/20 text-red-400 animate-pulse'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
          title={isRecording ? 'Parar gravação' : 'Gravar áudio com Whisper'}
          id="btn-voice"
        >
          {isTranscribing ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#10a37f]" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Input Textarea Livre */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem ou digite / para atalhos..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-slate-100 text-[14px] placeholder-slate-500 resize-none focus:outline-none py-1.5 px-2 max-h-40 overflow-y-auto leading-relaxed"
          id="chat-textarea"
        />

        {/* ➤ Botão Enviar */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || (!text.trim() && !attachedImage)}
          className={`p-2 rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
            isLoading || (!text.trim() && !attachedImage)
              ? 'text-slate-600 cursor-not-allowed bg-transparent'
              : 'bg-[#10a37f] text-white hover:bg-[#0e8e6e] shadow-md shadow-[#10a37f]/20'
          }`}
          title="Enviar mensagem (Enter)"
          id="btn-send"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
