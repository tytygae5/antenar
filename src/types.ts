export type TaskType =
  | 'TEXT_GENERATION'
  | 'VISION'
  | 'AUDIO_TRANSCRIPTION'
  | 'COMPLEX_REASONING'
  | 'CODING'
  | 'REALTIME'
  | 'SELF_REFINEMENT'
  | 'MIXTURE_OF_AGENTS'
  | 'AUTONOMOUS_AGENT'
  | 'VIDEO_CREATION'
  | 'VIDEO_REVIEW';

export type ExecutionMode =
  | 'standard'
  | 'self_refinement'
  | 'moa'
  | 'autonomous'
  | 'comparator';

export interface FallbackStep {
  tier: 'Primário' | 'Secundário' | 'Terciário';
  provider: string;
  model: string;
  name: string;
  status: 'SUCESSO' | 'FALHA' | 'PENDENTE' | 'PULADO' | 'SKIPPED' | 'SUCCESS' | 'FAILED';
  latencyMs?: number;
  tokens?: number;
  error?: string;
  reason?: string;
}

export interface RefineStep {
  step: number;
  title: string;
  description?: string;
  content?: string;
}

export interface AgentStep {
  id: number;
  action: string;
  description: string;
  output?: string;
  status?: 'pending' | 'running' | 'done';
}

export interface AgentPlan {
  goal: string;
  steps: AgentStep[];
}

export interface MoaAnswer {
  provider: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  reasoning?: string;
  timestamp: string;
  taskType?: TaskType;
  provider?: string;
  model?: string;
  latencyMs?: number;
  cost?: string;
  fallbackTrace?: FallbackStep[];
  success?: boolean;
  isStreaming?: boolean;
  cached?: boolean;
  mode?: ExecutionMode;
  refineSteps?: RefineStep[];
  agentPlan?: AgentPlan;
  moaAnswers?: MoaAnswer[];
  toolCalls?: any[];
  inlineBlock?: 'video_form' | 'video_upload';
  steps?: Array<{ index: number; total: number; label: string; status: 'done' | 'running' | 'pending' }>;
  artifact?: {
    kind: 'video_package' | 'video_review';
    package?: VideoPackage;
    report?: VideoAnalysisReport;
  };
  attachedFile?: {
    name: string;
    type: 'pdf' | 'csv' | 'image' | 'text' | 'unknown';
    sizeBytes: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  systemPrompt?: string;
  presetId?: string;
  messages: ChatMessage[];
}

export interface PresetPrompt {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  badge: string;
  freeTier: string;
  models: string[];
  keyEnv: string;
  portalUrl: string;
  description: string;
  requiresKey: boolean;
}

export interface ModelComparisonResult {
  id: string;
  name: string;
  provider: string;
  model: string;
  response: string;
  latencyMs: number;
  success: boolean;
}

export interface VideoPackage {
  name?: string;
  url?: string;
  duration?: string;
  tone?: string;
  research?: any;
  script?: any;
  seo?: any;
  thumbnails?: any;
  srt?: any;
  ttsText?: any;
  tts?: any;
  checklist?: any;
  [key: string]: any;
}

export interface VideoAnalysisReport {
  duration: { planned: string; actual: string; delta: string; status: 'good' | 'warning' | 'danger' };
  pace: { wpm: number; status: 'good' | 'warning' | 'danger' };
  fidelity: { percent: number; missing: string[]; extra: string[] };
  fillers: { count: number; top: string[] };
  long_silences: { start: string; end: string; suggestion: string }[];
  hook: { score: number; comment: string };
  cta: { early: boolean; final: boolean };
  promises_kept: { promise: string; kept: boolean }[];
  priority_actions: { priority: 'high' | 'medium' | 'low'; action: string; reason: string }[];
  rawText?: string;
}
