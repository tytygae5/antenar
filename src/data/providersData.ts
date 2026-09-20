import { ProviderInfo, TaskType } from '../types';

export const PROVIDERS_LIST: ProviderInfo[] = [
  {
    id: 'puter',
    name: 'Puter.js',
    badge: 'Sem API Key (Browser User-Pays)',
    freeTier: 'Gratuito & Ilimitado no cliente via autenticação browser do usuário final',
    models: ['openai/gpt-5', 'anthropic/claude-sonnet-4.5', 'openai/gpt-4o', 'x-ai/grok-4', 'openai/gpt-4o-mini'],
    keyEnv: 'PUTER_AUTH_TOKEN (Client-side / Browser)',
    portalUrl: 'https://puter.com',
    description: 'Acesso a modelos de ponta (GPT-5, Claude Sonnet 4.5, Grok 4) diretamente no navegador sem chaves de servidor.',
    requiresKey: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Free Router',
    badge: '$0.00 / token',
    freeTier: 'Modelos com sufixo :free ou rota unificada openrouter/free (20+ modelos gratuitos)',
    models: ['openrouter/auto', 'deepseek/deepseek-r1', 'meta-llama/llama-3.1-8b-instruct'],
    keyEnv: 'OPENROUTER_API_KEY',
    portalUrl: 'https://openrouter.ai/keys',
    description: 'Roteador inteligente de modelos $0.00 com alternância automática e compatibilidade OpenAI.',
    requiresKey: true,
  },
  {
    id: 'groq',
    name: 'Groq Cloud (LPU)',
    badge: '14.400 req/dia (~30 RPM)',
    freeTier: '14.400 requisições diárias gratuitas em hardware LPU dedicado com ultra-baixa latência',
    models: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'whisper-large-v3'],
    keyEnv: 'GROQ_API_KEY',
    portalUrl: 'https://console.groq.com/keys',
    description: 'Inferência ultrarrápida em chips LPU dedicados com modelos GPT-OSS 120B/20B e Whisper Large.',
    requiresKey: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini API',
    badge: '1.500 req/dia ($0.00)',
    freeTier: '15 RPM, 1.500 RPD no Google AI Studio sem necessidade de cartão de crédito',
    models: ['gemini-flash-latest'],
    keyEnv: 'GEMINI_API_KEY',
    portalUrl: 'https://aistudio.google.com/apikey',
    description: 'Pioneiro em contexto longo, raciocínio STEM e tarefas multimodais (visão, áudio e código).',
    requiresKey: true,
  },
  {
    id: 'dashscope',
    name: 'Alibaba DashScope (Qwen)',
    badge: '1M Tokens Grátis',
    freeTier: '1 milhão de tokens de teste gratuitos para cada modelo de ponta Qwen',
    models: ['qwen-max', 'qwen3-max', 'qwen-turbo'],
    keyEnv: 'DASHSCOPE_API_KEY',
    portalUrl: 'https://dashscope-intl.aliyuncs.com',
    description: 'Família de modelos Qwen de alta performance em raciocínio, codificação e visão.',
    requiresKey: true,
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI (GLM Series)',
    badge: 'Flash Tier Gratuito',
    freeTier: 'Acesso gratuito ao modelo GLM-4 Flash com alta velocidade e concorrência dedicada',
    models: ['glm-4-flash'],
    keyEnv: 'ZHIPU_API_KEY',
    portalUrl: 'https://open.bigmodel.cn',
    description: 'Modelos fundamentais com tier gratuito para raciocínio analítico e coding rápido.',
    requiresKey: true,
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    badge: '$0/token Permanente',
    freeTier: 'Modelos permanentemente gratuitos a $0/token e ~40 RPM após validação',
    models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-7B-Instruct'],
    keyEnv: 'SILICONFLOW_API_KEY',
    portalUrl: 'https://cloud.siliconflow.cn',
    description: 'Agregador de inferência escalável para DeepSeek e Qwen de custo zero.',
    requiresKey: true,
  },
  {
    id: 'huggingface',
    name: 'HuggingFace Inference Router',
    badge: '$0.10/mês Grátis',
    freeTier: 'API de inferência serverless atualizada via router.huggingface.co/hf-inference',
    models: ['openai/whisper-large-v3', 'meta-llama/Llama-3.2-3B-Instruct'],
    keyEnv: 'HUGGINGFACE_TOKEN',
    portalUrl: 'https://huggingface.co/settings/tokens',
    description: 'Hub aberto de machine learning com suporte a transcrição e modelos abertos.',
    requiresKey: true,
  },
  {
    id: 'nexa',
    name: 'Nexa API',
    badge: '$5 Grátis',
    freeTier: '$5 em créditos promocionais gratuitos para testes via RapidAPI ou SDK local',
    models: ['nexa-omni'],
    keyEnv: 'NEXA_API_KEY',
    portalUrl: 'https://rapidapi.com/user/nexaquency',
    description: 'API de modelos locais e endpoint via RapidAPI (TODO: verificar rota exata no painel).',
    requiresKey: true,
  },
  {
    id: 'cometapi',
    name: 'CometAPI',
    badge: 'Créditos Iniciais',
    freeTier: 'Créditos de boas-vindas com endpoint compatível OpenAI (api.cometapi.com/v1)',
    models: ['grok-beta'],
    keyEnv: 'COMETAPI_KEY',
    portalUrl: 'https://cometapi.com',
    description: 'Gateway agregador com suporte a Grok Beta e modelos com rota unificada.',
    requiresKey: true,
  },
];

export const ROUTING_MATRIX_DATA: Record<TaskType, { primary: string; secondary: string; tertiary: string }> = {
  TEXT_GENERATION: {
    primary: 'Google Gemini (gemini-flash-latest)',
    secondary: 'Groq LPU (openai/gpt-oss-120b)',
    tertiary: 'OpenRouter (openrouter/auto)',
  },
  COMPLEX_REASONING: {
    primary: 'Google Gemini (gemini-flash-latest)',
    secondary: 'Groq LPU (openai/gpt-oss-120b)',
    tertiary: 'OpenRouter (deepseek/deepseek-r1)',
  },
  VISION: {
    primary: 'Google Gemini (gemini-flash-latest)',
    secondary: 'Groq LPU (qwen/qwen3.6-27b)',
    tertiary: 'OpenRouter (qwen/qwen-2.5-vl-72b-instruct)',
  },
  AUDIO_TRANSCRIPTION: {
    primary: 'Groq LPU (whisper-large-v3)',
    secondary: 'Google Gemini (gemini-flash-latest)',
    tertiary: 'HuggingFace Router (whisper-large-v3)',
  },
  CODING: {
    primary: 'Google Gemini (gemini-flash-latest)',
    secondary: 'Groq LPU (openai/gpt-oss-120b)',
    tertiary: 'OpenRouter (qwen/qwen-2.5-coder-32b-instruct)',
  },
  REALTIME: {
    primary: 'Groq LPU (openai/gpt-oss-20b)',
    secondary: 'Google Gemini (gemini-flash-latest)',
    tertiary: 'OpenRouter (openrouter/auto)',
  },
  SELF_REFINEMENT: {
    primary: 'Gemini Flash (Rascunho) → Groq GPT-OSS-120B (Crítica) → Gemini (Refino)',
    secondary: 'Groq LPU (Rascunho) → DeepSeek R1 → Gemini Flash',
    tertiary: 'OpenRouter Auto Pipeline',
  },
  MIXTURE_OF_AGENTS: {
    primary: 'Gemini Flash + Groq GPT-OSS-120B + OpenRouter Auto → Agregador Gemini',
    secondary: 'DeepSeek R1 + Gemini Flash → Agregador Groq',
    tertiary: 'OpenRouter Multi-Model Parallel',
  },
  AUTONOMOUS_AGENT: {
    primary: 'Planejador Gemini Flash + Tool Executor + Síntese Groq',
    secondary: 'Gemini Flash Autonomous Engine',
    tertiary: 'DeepSeek R1 Agentic Step Solver',
  },
  VIDEO_CREATION: {
    primary: 'Google Gemini (gemini-flash-latest)',
    secondary: 'Groq LPU (openai/gpt-oss-120b)',
    tertiary: 'OpenRouter (meta-llama/llama-3.1-8b-instruct)',
  },
  VIDEO_REVIEW: {
    primary: 'Groq LPU (whisper-large-v3) + Google Gemini (gemini-flash-latest)',
    secondary: 'Google Gemini (gemini-flash-latest)',
    tertiary: 'HuggingFace Router (whisper-large-v3)',
  },
};

export const MERMAID_DIAGRAM_TEXT = `graph TD
    User([Usuário: Texto, Código, Visão ou Áudio]) --> RateLimiter[Global Rate Limiter: 30 RPM]
    RateLimiter --> Layer1[Camada 1: Roteador de Tarefas]

    Layer1 -->|Classificação Semântica & MIME| TaskType{Tipo de Tarefa}
    TaskType -->|Texto Geral| RouteText[Texto: OpenRouter Free ➔ Groq GPT-OSS-120B ➔ Puter GPT-4o-mini]
    TaskType -->|Raciocínio Complexo| RouteReason[Raciocínio: DeepSeek V4 Flash ➔ Gemini 3.6 Flash ➔ Claude Sonnet 4.5]
    TaskType -->|Visão / Multimodal| RouteVision[Visão: Gemini 3.6 Flash ➔ Puter GPT-4o ➔ DashScope Qwen-Plus]
    TaskType -->|Transcrição Áudio| RouteAudio[Áudio: Groq Whisper LPU ➔ HuggingFace Router ➔ Gemini 3.6 Flash]
    TaskType -->|Código / Algoritmo| RouteCode[Código: DeepSeek V4 Flash ➔ Puter GPT-5 ➔ DashScope Qwen-Plus]
    TaskType -->|Tempo Real| RouteRT[Tempo Real: Groq GPT-OSS-20B ➔ OpenRouter Free ➔ Puter Grok 4]

    RouteText & RouteReason & RouteVision & RouteAudio & RouteCode & RouteRT --> Layer2[Camada 2: Seletor de Provedor & Prioridade Custo $0.00]

    Layer2 --> Primario[1. Provedor Primário]
    Primario -->|Tentativa com Retry Exponencial| PrimCheck{Sucesso?}
    
    PrimCheck -->|Sim| Telemetry[Telemetria: Latência, Tokens e Custo $0.00]
    PrimCheck -->|Falha / Rate Limit / Sem Chave (Pulo Silencioso)| Secundario[2. Fallback Secundário]
    
    Secundario -->|Tentativa com Retry Exponencial| SecCheck{Sucesso?}
    SecCheck -->|Sim| Telemetry
    SecCheck -->|Falha / Sem Chave| Terciario[3. Fallback Terciário]
    
    Terciario -->|Tentativa com Retry Exponencial| TerCheck{Sucesso?}
    TerCheck -->|Sim| Telemetry
    TerCheck -->|Falha Geral| FriendlyMsg[Orientação de Configuração Amigável]

    Telemetry --> Layer4[Camada 4: Context Manager FIFO 10 Turnos]
    Layer4 --> ReturnResp([Resposta: Provider, Model, Usage, Latency, Cost $0.00, FallbackTrace])
`;
