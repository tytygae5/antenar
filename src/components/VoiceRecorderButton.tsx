import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Volume2, VolumeX } from 'lucide-react';

interface VoiceRecorderButtonProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = ({
  onTranscriptionComplete,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [micError, setMicError] = useState<string | null>(null);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processAudioTranscription(audioBlob);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
    } catch (err: any) {
      console.warn('Erro ao acessar microfone:', err);
      const isDismissedOrDenied =
        err?.name === 'NotAllowedError' ||
        err?.message?.includes('Permission') ||
        err?.message?.includes('dismissed') ||
        err?.message?.includes('denied');

      if (isDismissedOrDenied) {
        setMicError('Permissão de microfone negada. Clique no ícone de cadeado na barra de endereço para permitir ou abra o app em uma nova aba.');
      } else {
        setMicError('Nenhum microfone encontrado ou dispositivo indisponível.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      // Converte Blob para Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: blob.type || 'audio/webm',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.text) {
        onTranscriptionComplete(data.text);
      }
    } catch (err: any) {
      console.warn('Falha na transcrição Groq Whisper:', err);
      // Fallback para Web Speech API nativa se o endpoint estiver offline
      fallbackWebSpeechRecognition();
    } finally {
      setIsTranscribing(false);
    }
  };

  const fallbackWebSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) onTranscriptionComplete(text);
      };
      recognition.start();
    }
  };

  if (isTranscribing) {
    return (
      <button
        type="button"
        disabled
        className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center gap-1 text-xs"
        title="Transcrevendo áudio via Groq Whisper..."
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-[11px] hidden sm:inline">Transcrevendo...</span>
      </button>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={stopRecording}
        className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 text-xs animate-pulse shadow-lg shadow-red-600/30"
        title="Parar gravação"
      >
        <Square className="w-4 h-4 fill-white" />
        <span className="text-[11px] font-semibold">Gravando...</span>
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        id="voice-record-btn"
        onClick={startRecording}
        disabled={disabled}
        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
        title="Gravar áudio (Groq Whisper STT)"
      >
        <Mic className="w-4 h-4" />
      </button>

      {micError && (
        <div className="absolute bottom-full mb-2 right-0 w-72 p-2.5 bg-amber-950/90 border border-amber-800 text-amber-200 text-xs rounded-lg shadow-xl z-50 flex items-start justify-between gap-2">
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
    </div>
  );
};

/**
 * Leitor de Voz TTS (Browser window.speechSynthesis)
 */
export function playTextToSpeech(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // Para fala anterior
  const clean = text
    .replace(/```[\s\S]*?```/g, 'Bloco de código omitido.')
    .replace(/[#*`_~]/g, '')
    .slice(0, 800); // 800 caracteres para leitura suave

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.05;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopTextToSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
