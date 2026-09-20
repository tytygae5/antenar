import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, sanitizeModelBadge } from './ChatMessage';
import { InputBar } from './InputBar';
import { ArtifactBlock } from './blocks/ArtifactBlock';
import {
  Sparkles,
  Code2,
  BookOpen,
  Lightbulb,
  Plus,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Zap,
  Brain,
  Sliders,
  RotateCcw,
  Check,
  Edit3,
} from 'lucide-react';
import { VideoPackage, VideoAnalysisReport } from '../types';

export interface ChatViewProps {
  systemPrompt?: string;
  geminiModel?: string;
  injectedPrompt?: string;
  onClearInjectedPrompt?: () => void;
  onClearCacheGlobal?: () => void;
  showDebugLogs?: boolean;
}

export interface ChatRole {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  instruction: string;
  starters: { title: string; prompt: string }[];
  recommendedModel: 'auto' | 'gemini-flash-latest';
}

export const CHAT_ROLES: ChatRole[] = [
  {
    id: 'general',
    name: 'Geral',
    badge: 'Equilibrado',
    icon: '✨',
    description: 'Assistente versátil, claro e direto para qualquer assunto ou dúvida.',
    instruction: 'Você é um assistente de inteligência artificial prestativo, claro, empático e direto. Responda sempre em português com precisão técnica e formatação elegante em Markdown.',
    starters: [
      { title: 'Diferença RAG vs Fine-Tuning', prompt: 'Explique a diferença entre modelos RAG e Fine-Tuning de forma simples com exemplos do dia a dia.' },
      { title: 'Tópicos em alta de IA', prompt: 'Liste 5 tópicos em alta sobre inteligência artificial para um canal de tecnologia.' },
    ],
    recommendedModel: 'gemini-flash-latest',
  },
  {
    id: 'youtube_expert',
    name: 'Roteirista YouTube',
    badge: 'Criador & SEO',
    icon: '🎬',
    description: 'Estrategista de YouTube, roteiros virais de alta retenção e copywriting persuasivo.',
    instruction: 'Você é um roteirista sênior e estrategista de canais no YouTube. Especializado em retenção máxima, ganchos magnéticos nos primeiros 30 segundos, títulos com alto CTR e tags SEO completas.',
    starters: [
      { title: '🎬 Criar Vídeo Completo', prompt: '/video' },
      { title: '🔍 Revisar Roteiro/Vídeo', prompt: '/revisar' },
      { title: 'Gancho Magnético de 15s', prompt: 'Crie 3 opções de ganchos magnéticos de 15 segundos para prender a atenção sobre a nova IA da Google.' },
    ],
    recommendedModel: 'gemini-flash-latest',
  },
  {
    id: 'code_engineer',
    name: 'Engenheiro de Software',
    badge: 'Código & Arquitetura',
    icon: '💻',
    description: 'Especialista em TypeScript, React, algoritmos, arquitetura de sistemas e código limpo.',
    instruction: 'Você é um engenheiro de software sênior especialista em TypeScript, React, arquitetura limpa, segurança e algoritmos. Responda com código conciso, fortemente tipado e com explicações arquiteturais das decisões e armadilhas.',
    starters: [
      { title: 'Custom Hook com Debounce', prompt: 'Escreva um custom hook em React com TypeScript para debounce com suporte a cancelamento, loading e abort controller.' },
      { title: 'Refatoração & Clean Architecture', prompt: 'Como estruturar uma aplicação full-stack Express + Vite + TypeScript com tipagem compartilhada?' },
    ],
    recommendedModel: 'gemini-flash-latest',
  },
  {
    id: 'complex_reasoning',
    name: 'Raciocínio Complexo',
    badge: 'STEM & Dedução',
    icon: '🔬',
    description: 'Deduções passo a passo, análise profunda de problemas difíceis e ciência de dados.',
    instruction: 'Você é um pesquisador e especialista em raciocínio analítico, lógica matemática e ciências exatas. Desenvolva seu pensamento detalhadamente passo a passo, articulando premissas, teoremas, comparações e implicações lógicas.',
    starters: [
      { title: 'Consistência Distribuída', prompt: 'Analise detalhadamente e passo a passo os trade-offs entre linearizabilidade e consistência causal em sistemas distribuídos.' },
      { title: 'Paradoxo de Fermi e IA', prompt: 'Analise detalhadamente as principais hipóteses do Paradoxo de Fermi à luz do avanço acelerado da Inteligência Artificial.' },
    ],
    recommendedModel: 'gemini-flash-latest',
  },
  {
    id: 'fast_summary',
    name: 'Resumo Express',
    badge: 'Ultra Rápido',
    icon: '⚡',
    description: 'Sínteses rápidas e objetivas em poucos tópicos essenciais sem rodeios.',
    instruction: 'Você é um assistente de respostas expressas e ultra-rápidas. Forneça respostas concisas, estruturadas em bullet points diretos ao ponto, eliminando preâmbulos vazios.',
    starters: [
      { title: '3 Pilares da Nuvem', prompt: 'Resuma rapidamente em 3 tópicos essenciais os principais benefícios da computação em nuvem moderna.' },
      { title: 'Checklist de SEO', prompt: 'Forneça um checklist ultrarrápido de 5 pontos para otimizar um vídeo antes de publicar.' },
    ],
    recommendedModel: 'gemini-flash-latest',
  },
  {
    id: 'custom',
    name: 'Personalizado',
    badge: 'Custom Prompt',
    icon: '✏️',
    description: 'Defina uma instrução de sistema sob medida para qualquer persona específica.',
    instruction: 'Você é um consultor estratégico especialista. Responda às solicitações de forma estruturada e orientada a resultados.',
    starters: [
      { title: 'Iniciar Conversa Customizada', prompt: 'Olá! Como você pode me orientar com as diretrizes configuradas?' },
    ],
    recommendedModel: 'auto',
  },
];

export const GEMINI_MODELS = [
  {
    id: 'auto',
    name: 'Auto Inteligente',
    badge: 'Recomendado',
    desc: 'Seleciona dinamicamente a melhor rota com fallback garantido.',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash',
    badge: 'Padrão',
    desc: 'Modelo oficial ultra rápido e eficiente para geração de conteúdo, código e raciocínio.',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  systemPrompt = '',
  geminiModel = 'auto',
  injectedPrompt = '',
  onClearInjectedPrompt,
  onClearCacheGlobal,
  showDebugLogs = false,
}) => {
  const sessionIdRef = useRef(`session_${Date.now()}`);
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem('active_chat_session_id') || sessionIdRef.current;
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    return localStorage.getItem('chat_active_role_id') || 'general';
  });

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    return localStorage.getItem('chat_active_gemini_model') || (geminiModel !== 'auto' ? geminiModel : 'auto');
  });

  const [customInstruction, setCustomInstruction] = useState<string>(() => {
    return (
      localStorage.getItem('chat_custom_system_instruction') ||
      'Você é um consultor estratégico especialista. Responda às solicitações com clareza, estrutura e precisão técnica.'
    );
  });

  const [isCustomInstructionOpen, setIsCustomInstructionOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const [messages, setMessages] = useState<any[]>(() => {
    const savedId = localStorage.getItem('active_chat_session_id') || sessionIdRef.current;
    const savedMsgs = localStorage.getItem(`chat_session_msgs_${savedId}`);
    if (savedMsgs) {
      try {
        return JSON.parse(savedMsgs);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const renderedArtifactsRef = useRef<Set<string>>(new Set());
  const pipelineSessionRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const clientTimeoutRef = useRef<any>(null);

  // Sync role & model to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chat_active_role_id', selectedRoleId);
    } catch (e) {}
  }, [selectedRoleId]);

  useEffect(() => {
    try {
      localStorage.setItem('chat_active_gemini_model', selectedModelId);
    } catch (e) {}
  }, [selectedModelId]);

  useEffect(() => {
    try {
      localStorage.setItem('chat_custom_system_instruction', customInstruction);
    } catch (e) {}
  }, [customInstruction]);

  // Persistence of active session and messages
  useEffect(() => {
    try {
      localStorage.setItem('active_chat_session_id', sessionId);
      // Remove campos de imagem/vídeo base64 pesados (>50KB) antes de salvar no localStorage para evitar QuotaExceededError
      const sanitizedMsgs = messages.map((msg) => {
        if (msg.image && typeof msg.image === 'string' && msg.image.length > 50000) {
          const { image, ...rest } = msg;
          return rest;
        }
        return msg;
      });
      localStorage.setItem(`chat_session_msgs_${sessionId}`, JSON.stringify(sanitizedMsgs));
    } catch (e) {
      console.warn('[Storage] QuotaExceeded ao salvar no localStorage. Limpando chaves antigas...', e);
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('chat_session_msgs_') && k !== `chat_session_msgs_${sessionId}`) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        const lightMsgs = messages.slice(-20).map((m) => {
          if (m.image && typeof m.image === 'string' && m.image.length > 50000) {
            const { image, ...rest } = m;
            return rest;
          }
          return m;
        });
        localStorage.setItem(`chat_session_msgs_${sessionId}`, JSON.stringify(lightMsgs));
      } catch (err) {
        console.warn('[Storage] Falha ao persistir no localStorage:', err);
      }
    }
  }, [sessionId, messages]);

  // Clean up client-side safety timer on unmount
  useEffect(() => {
    return () => {
      if (clientTimeoutRef.current) {
        clearTimeout(clientTimeoutRef.current);
      }
      setIsLoading(false);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Process injected prompt if any
  useEffect(() => {
    if (injectedPrompt && injectedPrompt.trim()) {
      handleSend(injectedPrompt);
      if (onClearInjectedPrompt) {
        onClearInjectedPrompt();
      }
    }
  }, [injectedPrompt]);

  const activeRole = CHAT_ROLES.find((r) => r.id === selectedRoleId) || CHAT_ROLES[0];
  const activeModel = GEMINI_MODELS.find((m) => m.id === selectedModelId) || GEMINI_MODELS[0];

  const handleSelectRole = (role: ChatRole) => {
    setSelectedRoleId(role.id);
    if (role.id === 'custom') {
      setIsCustomInstructionOpen(true);
    }
  };

  const handleNewConversation = () => {
    renderedArtifactsRef.current.clear();
    const newId = `session_${Date.now()}`;
    sessionIdRef.current = newId;
    setSessionId(newId);
    setMessages([]);
    setArtifacts([]);
    try {
      localStorage.setItem('active_chat_session_id', newId);
      localStorage.removeItem(`chat_session_msgs_${newId}`);
    } catch (e) {}
  };

  const handleClearAllHistory = () => {
    renderedArtifactsRef.current.clear();
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('chat_session_') || k.startsWith('chat_history') || k === 'active_chat_session_id' || k.includes('video_package') || k.includes('package_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.error('Error clearing localStorage history:', e);
      }
    }
    const newId = `session_${Date.now()}`;
    sessionIdRef.current = newId;
    setSessionId(newId);
    setMessages([]);
    setArtifacts([]);
    try {
      localStorage.setItem('active_chat_session_id', newId);
    } catch (e) {}
  };

  const handleCancelInlineBlock = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  // Send normal message to /api/chat with SSE
  const handleSend = async (text: string, imageBase64?: string) => {
    if (!text.trim() && !imageBase64) return;

    const trimmed = text.trim();

    let displayContent = text;
    if (trimmed.startsWith('/video\n')) {
      const match = trimmed.match(/Nome:\s*(.+)/i);
      displayContent = match ? `🎬 Fazer vídeo sobre: ${match[1]}` : text;
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    // Limpar artifacts anteriores ao iniciar novo pipeline de vídeo
    const trimmedLower = trimmed.toLowerCase();
    const isVideoPipelineTrigger =
      trimmedLower.startsWith('/video') ||
      trimmedLower === 'sim' ||
      trimmedLower === 's' ||
      trimmedLower === 'yes' ||
      trimmedLower === 'pode' ||
      trimmedLower === 'bora' ||
      trimmedLower.startsWith('sim');

    if (isVideoPipelineTrigger) {
      pipelineSessionRef.current = `session_${Date.now()}`;
      renderedArtifactsRef.current.clear();
      setArtifacts([]);
    } else if (!pipelineSessionRef.current) {
      pipelineSessionRef.current = `session_${Date.now()}`;
    }

    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: displayContent,
      image: imageBase64,
    };

    const defaultModelLabel = selectedModelId !== 'auto'
      ? selectedModelId
      : activeRole.recommendedModel !== 'auto'
      ? activeRole.recommendedModel
      : 'gemini-flash-latest';

    const newAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      provider: 'Google Gemini',
      model: sanitizeModelBadge(defaultModelLabel),
      isStreaming: true,
      showDebugLogs,
      steps: [],
    };

    setMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);
    setIsLoading(true);

    let clientTimeout: any = null;
    let silenceTimeout: any = null;
    let hasReceivedArtifact = false;
    let fallbackTimer: any = null;

    // Calculate effective system instruction
    let effectiveSystemPrompt = activeRole.instruction;
    if (selectedRoleId === 'custom') {
      effectiveSystemPrompt = customInstruction;
    } else if (systemPrompt && selectedRoleId === 'general') {
      effectiveSystemPrompt = `${systemPrompt}\n\n${activeRole.instruction}`;
    }

    try {
      const historyForApi = messages
        .filter((m) => m.content && !m.inlineBlock)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      let mimeType: string | undefined = undefined;
      if (imageBase64 && imageBase64.startsWith('data:')) {
        mimeType = imageBase64.split(';')[0].split(':')[1];
      }

      let effectivePrompt = text;
      if (!effectivePrompt.trim() && imageBase64) {
        const isVideo = mimeType?.startsWith('video/') || imageBase64.startsWith('data:video/');
        effectivePrompt = isVideo ? 'Analise este vídeo em detalhes.' : 'Analise esta imagem em detalhes.';
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          prompt: effectivePrompt,
          sessionId: sessionIdRef.current,
          systemPrompt: effectiveSystemPrompt,
          geminiModel: selectedModelId === 'auto' ? undefined : selectedModelId,
          model: selectedModelId === 'auto' ? undefined : selectedModelId,
          imageBase64,
          mimeType,
          stream: true,
          messages: historyForApi,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.response || `HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Servidor não retornou corpo de resposta.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      silenceTimeout = null;

      const resetSilenceTimeout = () => {
        if (silenceTimeout) clearTimeout(silenceTimeout);
        silenceTimeout = setTimeout(() => {
          console.warn('[SSE] Silence timeout — sem eventos por 30s, abortando stream e limpando loading');
          setIsLoading(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, isStreaming: false, content: msg.content || 'Sem resposta do servidor por 30s. Parando.' }
                : msg
            )
          );
          try { reader.cancel(); } catch (e) {}
        }, 30000);
      };

      resetSilenceTimeout();

      clientTimeoutRef.current = setTimeout(() => {
        console.warn('[SSE] Timeout absoluto cliente (180s) — abortando stream');
        if (silenceTimeout) clearTimeout(silenceTimeout);
        try {
          reader.cancel();
        } catch (e) {}
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  isStreaming: false,
                  content: msg.content || 'Pipeline demorou demais. Tente novamente.',
                }
              : msg
          )
        );
        setIsLoading(false);
      }, 180000);

      clientTimeout = clientTimeoutRef.current;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resetSilenceTimeout();

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

          if (trimmedLine.startsWith('data: ')) {
            console.log('[SSE EVENT]', trimmedLine.slice(0, 200));
            try {
              const data = JSON.parse(trimmedLine.slice(6));

              // 🔴 FILTRO NUCLEAR: rejeita QUALQUER step sem label válido ou index > 3 no pipeline de vídeo
              if (data.type === 'step') {
                if (data.pipeline === 'video' && data.index > 3) {
                  console.warn('[FRONTEND] Step de vídeo com index > 3 IGNORADO:', data);
                  continue;
                }

                const hasValidLabel =
                  typeof data.label === 'string' &&
                  data.label.trim().length > 0 &&
                  data.label !== 'undefined' &&
                  data.label !== 'null';

                if (!hasValidLabel) {
                  console.warn('[FRONTEND] Step sem label IGNORADO:', data);
                  continue;
                }

                const hasValidIndex = typeof data.index === 'number' && data.index >= 1;
                if (!hasValidIndex) {
                  console.warn('[FRONTEND] Step sem index válido IGNORADO:', data);
                  continue;
                }
              }

              if (data.type === 'chunk') {
                const chunkText = data.delta || data.chunk || data.text || '';
                accumulatedText += chunkText;
              } else if (data.text || data.delta) {
                accumulatedText += data.text || data.delta || '';
              } else if (data.type === 'step') {
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== assistantMsgId) return msg;
                    const existingSteps = msg.steps || [];
                    const stepIdx = existingSteps.findIndex((s: any) => s.index === data.index);
                    const newStep = {
                      index: data.index,
                      total: data.total,
                      label: data.label,
                      status: data.status || 'running',
                      pipeline: data.pipeline,
                      reason: data.reason
                    };
                    let updatedSteps = [...existingSteps];
                    if (stepIdx >= 0) {
                      updatedSteps[stepIdx] = {
                        ...updatedSteps[stepIdx],
                        ...newStep
                      };
                    } else {
                      updatedSteps.push(newStep);
                    }
                    return { ...msg, steps: updatedSteps };
                  })
                );
              } else if (data.type === 'substep') {
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== assistantMsgId) return msg;
                    const existingSteps = msg.steps || [];
                    const parentIdx = existingSteps.findIndex((s: any) => Number(s.index) === Number(data.parentIndex));
                    if (parentIdx >= 0) {
                      const parentStep = existingSteps[parentIdx];
                      const existingSubsteps = parentStep.substeps || [];
                      const substepIdx = existingSubsteps.findIndex((s: any) => s.label === data.label);
                      const newSub = {
                        label: data.label,
                        status: data.status || 'running'
                      };
                      let updatedSubs = [...existingSubsteps];
                      if (substepIdx >= 0) {
                        updatedSubs[substepIdx] = newSub;
                      } else {
                        updatedSubs.push(newSub);
                      }
                      
                      let updatedSteps = [...existingSteps];
                      updatedSteps[parentIdx] = {
                        ...parentStep,
                        substeps: updatedSubs
                      };
                      return { ...msg, steps: updatedSteps };
                    }
                    return msg;
                  })
                );
              } else if (data.type === 'artifact') {
                hasReceivedArtifact = true;
                if (fallbackTimer) {
                  clearTimeout(fallbackTimer);
                  fallbackTimer = null;
                }
                const pipeline = data.pipeline || 'video';
                const kind = data.kind || 'video-package';
                const artPayload = data.package || data.content || data.report;

                // 🔴 Chave inclui sessão para dedupe real (FIX 4)
                const isReviewReport = kind === 'review-report' || kind === 'video_report' || kind === 'review_report' || kind === 'video_review' || kind === 'video-review';
                const sessionKey = isReviewReport
                  ? `${pipelineSessionRef.current || sessionIdRef.current}::review-report`
                  : `${pipelineSessionRef.current || sessionIdRef.current}::${kind}`;

                // 🔴 Para reports, valida antes de renderizar (FIX 3 / FIX 4)
                if (isReviewReport) {
                  const content = data.report || artPayload?.report || artPayload;
                  const contentStr = typeof content === 'string' ? content : JSON.stringify(content || '');
                  if (contentStr.includes('Nenhum provedor') || contentStr.includes('nenhum provedor')) {
                    console.warn('[Review] Relatório vazio bloqueado');
                    continue;
                  }
                }

                // 🔴 Rejeitar pacote de vídeo vazio/incompleto (menos de 100 caracteres de script)
                if (kind === 'video-package' || kind === 'video_package') {
                  const pkg = artPayload?.package || artPayload;
                  if (!pkg?.script || pkg.script.length < 100) {
                    console.log('[Dedupe] Artifact de vídeo vazio/insuficiente ignorado (<100 chars)');
                    renderedArtifactsRef.current.delete(sessionKey);
                    continue;
                  }
                }

                // 🔴 Se já renderizou esse artifact nesta sessão, ignora (FIX 3 / FIX 4)
                if (renderedArtifactsRef.current.has(sessionKey)) {
                  console.log('[Dedupe] Ignorado (já renderizado):', sessionKey);
                  continue;
                }
                renderedArtifactsRef.current.add(sessionKey);
                console.log('[Frontend] Artifact recebido via SSE:', kind);

                if (isReviewReport) {
                  const content = data.report || artPayload?.report || artPayload;
                  let parsed = content;
                  if (typeof content === 'string') {
                    try { parsed = JSON.parse(content); } catch {}
                  }

                  setArtifacts((prev) => [
                    ...prev,
                    {
                      id: sessionKey,
                      kind: 'review-report-rendered',
                      content: parsed,
                      report: parsed,
                    },
                  ]);
                } else {
                  setArtifacts((prev) => [
                    ...prev,
                    {
                      id: sessionKey,
                      kind: kind,
                      content: artPayload,
                      report: data.report,
                    },
                  ]);
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          artifact: {
                            kind: isReviewReport ? 'review-report-rendered' : kind,
                            package: artPayload,
                            report: data.report || artPayload,
                            progress: data.progress,
                            days: data.days,
                            videoId: data.videoId,
                            videoTitle: data.videoTitle,
                            data: data.data,
                            comments: data.comments,
                            content: artPayload,
                          },
                        }
                      : msg
                  )
                );
              } else if (data.type === 'error') {
                if (clientTimeout) clearTimeout(clientTimeout);
                if (silenceTimeout) clearTimeout(silenceTimeout);
                if (fallbackTimer) clearTimeout(fallbackTimer);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          isStreaming: false,
                          error: true,
                          content: data.message || data.error || 'Erro durante a execução do pipeline.',
                        }
                      : msg
                  )
                );
                setIsLoading(false);
                try { reader.cancel(); } catch (e) {}
                break;
              } else if (data.type === 'done') {
                if (clientTimeout) clearTimeout(clientTimeout);
                if (silenceTimeout) clearTimeout(silenceTimeout);
                if (data.result?.response && !accumulatedText) {
                  accumulatedText = data.result.response;
                }

                const resolvedModel = sanitizeModelBadge(
                  data.result?.model ||
                  data.result?.modelUsed ||
                  data.model ||
                  defaultModelLabel
                );
                const resolvedProvider =
                  data.result?.provider ||
                  data.result?.providerUsed ||
                  data.provider ||
                  'Google Gemini';

                const doneArtifact = data.result?.artifact;
                const pipeline = 'video';
                const kind = doneArtifact?.kind || 'video-package';
                const pkgPayload = doneArtifact?.package || doneArtifact?.content;

                let isArtifactValid = Boolean(doneArtifact);
                if (doneArtifact && (kind === 'video-package' || kind === 'video_package')) {
                  const pkg = pkgPayload?.package || pkgPayload;
                  if (!pkg?.script || pkg.script.length < 100) {
                    console.log('[Dedupe] Done artifact de vídeo vazio/insuficiente ignorado (<100 chars)');
                    isArtifactValid = false;
                  }
                }

                const sessionKey = `${pipelineSessionRef.current || sessionIdRef.current}::${kind}`;

                if (isArtifactValid && !renderedArtifactsRef.current.has(sessionKey)) {
                  renderedArtifactsRef.current.add(sessionKey);
                  hasReceivedArtifact = true;
                  if (fallbackTimer) {
                    clearTimeout(fallbackTimer);
                    fallbackTimer = null;
                  }
                  console.log('[Frontend] Artifact extraído do payload de done:', kind);
                  setArtifacts((prev) => [
                    ...prev,
                    {
                      id: sessionKey,
                      kind: kind,
                      content: pkgPayload,
                      report: doneArtifact.report,
                    },
                  ]);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? {
                            ...msg,
                            isStreaming: false,
                            content: msg.content || accumulatedText,
                            model: resolvedModel,
                            provider: resolvedProvider,
                            artifact: {
                              kind: kind,
                              package: pkgPayload,
                              content: pkgPayload,
                              report: doneArtifact.report,
                            },
                          }
                        : msg
                    )
                  );
                } else {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? {
                            ...msg,
                            isStreaming: false,
                            content: msg.content || accumulatedText,
                            model: resolvedModel,
                            provider: resolvedProvider,
                          }
                        : msg
                    )
                  );
                }

                // 🔴 CAMADA 3: Fallback REST se NENHUM artifact foi renderizado
                fallbackTimer = setTimeout(async () => {
                  const jaRenderizou = renderedArtifactsRef.current.size > 0;
                  if (!jaRenderizou) {
                    console.log('[Fallback] Nada foi renderizado, tentando REST...');
                    try {
                      const resPkg = await fetch(`/api/video/package/${sessionIdRef.current}`);
                      if (resPkg.ok) {
                        const pkg = await resPkg.json();
                        if (pkg && pkg.script && pkg.script.length >= 100) {
                          const fallbackKey = `${pipelineSessionRef.current || sessionIdRef.current}::video-package`;
                          if (!renderedArtifactsRef.current.has(fallbackKey)) {
                            renderedArtifactsRef.current.add(fallbackKey);
                            console.log('[Frontend] Pacote recuperado com sucesso via REST!', pkg.name);
                            setArtifacts((prev) => [
                              ...prev,
                              {
                                id: fallbackKey,
                                kind: 'video-package',
                                content: pkg,
                              },
                            ]);
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === assistantMsgId
                                  ? {
                                      ...msg,
                                      isStreaming: false,
                                      artifact: {
                                        kind: 'video_package',
                                        package: pkg,
                                        content: pkg,
                                      },
                                    }
                                  : msg
                              )
                            );
                          }
                        }
                      }
                    } catch (e) {
                      console.error('[Fallback REST] Erro ao buscar pacote:', e);
                    }
                  } else {
                    console.log('[Fallback] Artifact já renderizado, ignorando REST');
                  }
                  setIsLoading(false);
                }, 2000);

                try { reader.cancel(); } catch (e) {}
                break;
              }
            } catch (err) {
              console.warn('[SSE] Erro ao parsear linha JSON:', err);
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (err: any) {
      console.error('[ChatView] Erro na requisição:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                isStreaming: false,
                error: true,
                content: err.message || 'Falha de comunicação com o servidor.',
              }
            : msg
        )
      );
    } finally {
      if (clientTimeout) clearTimeout(clientTimeout);
      if (silenceTimeout) clearTimeout(silenceTimeout);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto w-full p-2">
      {/* Top Header: Personas (Roles) & Model Selector */}
      <div className="flex flex-col gap-2 pb-2 px-1 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Role selection pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {CHAT_ROLES.map((role) => {
              const isSelected = role.id === selectedRoleId;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#10a37f]/20 border-[#10a37f] text-emerald-300 shadow-sm'
                      : 'bg-[#161920] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={role.description}
                >
                  <span>{role.icon}</span>
                  <span>{role.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">
                    {role.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Model Selector & Actions */}
          <div className="flex items-center gap-2 relative">
            {/* Model Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#161920] border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5 text-[#10a37f]" />
                <span className="truncate max-w-[140px] sm:max-w-none">{activeModel.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isModelDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsModelDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 bg-[#161920] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 space-y-1">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                      <span>Modelo Gemini</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Google GenAI</span>
                    </div>
                    {GEMINI_MODELS.map((mod) => {
                      const isModSelected = mod.id === selectedModelId;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(mod.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start gap-2 cursor-pointer ${
                            isModSelected
                              ? 'bg-[#10a37f]/15 border border-[#10a37f]/40 text-white'
                              : 'hover:bg-slate-800/70 text-slate-300'
                          }`}
                        >
                          <div className="mt-0.5">
                            {mod.id === 'gemini-flash-latest' ? (
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-[#10a37f]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200">{mod.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                {mod.badge}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{mod.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* System Instruction Toggle */}
            <button
              type="button"
              onClick={() => setIsCustomInstructionOpen((v) => !v)}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                isCustomInstructionOpen
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                  : 'bg-[#161920] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title="Configurar Instruções do Sistema"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* New Conversation */}
            <button
              type="button"
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#161920] border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Iniciar uma nova conversa limpa"
              id="btn-new-conversation"
            >
              <Plus className="w-3.5 h-3.5 text-[#10a37f]" />
              <span className="hidden sm:inline font-medium">Nova Conversa</span>
            </button>

            {/* Apagar Histórico de Conversas Anteriores */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja realmente apagar todo o histórico de conversas anteriores e limpar a memória?')) {
                  handleClearAllHistory();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-red-400/80 hover:text-red-300 px-2.5 py-1.5 rounded-lg bg-[#161920] border border-red-950/50 hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Apagar Histórico de Conversas Anteriores"
              id="btn-clear-history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Apagar Histórico</span>
            </button>
          </div>
        </div>

        {/* Custom / System Instruction Expandable Panel */}
        {isCustomInstructionOpen && (
          <div className="p-3 bg-[#161920] border border-slate-800 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#10a37f]" />
                  Instruções do Sistema ({activeRole.name})
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedRoleId === 'custom' ? 'Modo Customizado' : 'Modo Pré-definido'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedRoleId !== 'custom' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoleId('custom');
                      setCustomInstruction(activeRole.instruction);
                    }}
                    className="text-[11px] text-[#10a37f] hover:underline cursor-pointer"
                  >
                    Personalizar este prompt
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCustomInstructionOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedRoleId === 'custom' ? (
              <div className="space-y-2">
                <textarea
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0e1117] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#10a37f] transition-all font-mono leading-relaxed"
                  placeholder="Defina as regras, persona e tom de resposta que o chatbot deve adotar..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>As instruções são persistidas e aplicadas a todas as requisições deste chat.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomInstruction(
                        'Você é um consultor estratégico especialista. Responda às solicitações com clareza, estrutura e precisão técnica.'
                      );
                    }}
                    className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Resetar Padrão
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-[#0e1117] border border-slate-800/80 rounded-lg text-xs text-slate-300 font-mono leading-relaxed">
                {activeRole.instruction}
              </div>
            )}
          </div>
        )}

        {/* Sub-bar: Turns count & Role description */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="truncate">{activeRole.description}</span>
          {messages.length > 0 && (
            <span className="whitespace-nowrap ml-2">
              {messages.filter((m) => m.role === 'user').length} turnos no histórico
            </span>
          )}
        </div>
      </div>

      {/* Messages / Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#10a37f]/10 border border-[#10a37f]/30 flex items-center justify-center text-2xl shadow-lg">
              {activeRole.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{activeRole.name}</h2>
              <p className="text-slate-400 text-xs max-w-md">
                {activeRole.description} Escolha um dos atalhos abaixo ou envie sua pergunta.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {activeRole.starters.map((starter, index) => {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSend(starter.prompt)}
                    className="flex items-center gap-3 p-3.5 bg-[#161920] hover:bg-[#1a1d26] border border-slate-800 hover:border-[#10a37f]/50 rounded-xl text-left transition-all cursor-pointer group shadow-md"
                  >
                    <div className="p-2 rounded-lg bg-[#10a37f]/10 text-[#10a37f] group-hover:bg-[#10a37f] group-hover:text-white transition-all">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white">{starter.title}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{starter.prompt}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full space-y-2">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                {...msg}
                showDebugLogs={showDebugLogs}
                onCancelInlineBlock={() => handleCancelInlineBlock(msg.id)}
                onDiscutirArtifact={(p) => handleSend(p)}
                onRefazerArtifact={() => handleSend('/video')}
              />
            ))}
            {artifacts
              .filter((a) => !messages.some((m) => m.artifact && (m.artifact as any).kind === a.kind))
              .map((a) => (
                <div key={a.id} className="p-4 bg-[#161920] border border-[#232733] rounded-xl my-2">
                <ArtifactBlock
                  kind={a.kind}
                  pkgData={a.content}
                  reportData={a.report}
                  onDiscutir={(p) => handleSend(p)}
                  onRefazer={() => handleSend('/video')}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="pt-2 bg-transparent">
        <InputBar
          onSend={handleSend}
          onClearCache={() => {
            if (onClearCacheGlobal) onClearCacheGlobal();
          }}
          onResetChat={handleNewConversation}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
