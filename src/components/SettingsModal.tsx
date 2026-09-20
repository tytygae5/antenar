import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Trash2, Check } from 'lucide-react';

export interface SettingsState {
  systemPrompt: string;
  geminiModel?: string;
  enableCache: boolean;
  enableRag: boolean;
  selfRefinement: boolean;
  mixtureOfAgents: boolean;
  autonomousAgent: boolean;
  showDebugLogs: boolean;
}

export interface SettingsModalProps {
  isOpen: boolean;
  settings: SettingsState;
  onSave: (newSettings: SettingsState) => void;
  onClearCache: () => Promise<void>;
  onClose: () => void;
}

const PRESETS = [
  {
    name: 'Programador',
    prompt: 'Você é um Engenheiro de Software Sênior especialista em TypeScript, React, Python e arquiteturas de alta performance. Entregue código limpo, moderno e direto.',
  },
  {
    name: 'Professor',
    prompt: 'Você é um professor didático e paciente. Explique conceitos de forma simples, usando metáforas claras e exemplos práticos antes de aprofundar.',
  },
  {
    name: 'Analista',
    prompt: 'Você é um analista estratégico sênior. Entregue análises críticas estruturadas, prós e contras, riscos, dados e recomendações executivas diretas.',
  },
  {
    name: 'Poeta',
    prompt: 'Você é um escritor e poeta refinado. Responda com elegância lírica, prosa poética e metáforas ricas em português fluente.',
  },
];

const DEFAULT_SYSTEM_PROMPT = `Você é um assistente amigável e direto, como um amigo inteligente conversando no WhatsApp.

REGRAS DE TOM:
- Fale em primeira pessoa natural: "eu posso", "eu faço", "consigo"
- NUNCA diga "Como um modelo de linguagem...", "Sou uma IA...", "Minhas capacidades técnicas..."
- NUNCA use jargão corporativo ou listas numeradas quando uma frase simples resolver
- Seja conciso: 2-3 frases para perguntas simples, listas curtas só quando necessário
- Use emojis com moderação (1 a cada 3-4 mensagens no máximo)
- Português do Brasil informal, mas sem gírias forçadas

EXEMPLO ERRADO:
"Como um modelo de linguagem baseado em inteligência artificial, minhas capacidades técnicas e operacionais incluem: Processamento e Geração de Texto: Redação de documentos..."

EXEMPLO CERTO:
"Consigo te ajudar com bastante coisa! Por exemplo:
• Escrever e revisar textos (e-mails, artigos, roteiros)
• Programar em várias linguagens (Python, JS, etc.)
• Explicar conceitos complicados de forma simples
• Criar roteiros de vídeo para o seu canal
O que você quer fazer agora?"

REGRAS ADICIONAIS:
- Se a pergunta for vaga ("o que você faz?"), responda curto e pergunte o que a pessoa quer
- Se for específica, vá direto ao ponto
- Nunca encha linguiça`;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClearCache,
  onClose,
}) => {
  const initialPrompt =
    !settings.systemPrompt ||
    /bots|e-?mail|contas|automa[çc][ãa]o|detec[çc][ãa]o|CAPTCHA|contornar|bypass|n[ãa]o posso|recuso/i.test(
      settings.systemPrompt
    )
      ? DEFAULT_SYSTEM_PROMPT
      : settings.systemPrompt;

  const [localSettings, setLocalSettings] = useState<SettingsState>({
    ...settings,
    systemPrompt: initialPrompt,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (prompt: string) => {
    setLocalSettings((prev) => ({ ...prev, systemPrompt: prompt }));
  };

  const handleSaveAndClose = () => {
    onSave(localSettings);
    onClose();
  };

  const handleClearCacheClick = async () => {
    setClearing(true);
    await onClearCache();
    setClearing(false);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs" id="settings-modal">
      <div className="w-full max-w-lg bg-[#161920] border border-[#232733] rounded-[16px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232733]">
          <h2 className="text-base font-semibold text-[#e5e7eb]">Configurações</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#9ca3af] hover:text-[#e5e7eb] rounded-[6px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-sm text-[#e5e7eb]">
          {/* System Prompt */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              Instrução de Sistema (System Prompt)
            </label>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings((prev) => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="Defina o comportamento do assistente..."
              rows={3}
              className="w-full bg-[#0f1115] border border-[#232733] rounded-[8px] p-3 text-sm text-[#e5e7eb] focus:outline-none focus:border-[#10a37f] resize-none"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePresetSelect(p.prompt)}
                  className="px-2.5 py-1 bg-[#1f2937] hover:bg-[#283548] text-xs text-[#e5e7eb] rounded-[6px] transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Modelo Gemini */}
          <div className="space-y-2 pt-2 border-t border-[#232733]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
              Modelo Principal (Google Gemini)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'gemini-flash-latest',
                  name: 'Gemini Flash (Latest)',
                  desc: 'Padrão recomendado: rápido, versátil para tarefas gerais, raciocínio e multimodal',
                  badge: 'Padrão & Eficiente',
                },
              ].map((m) => {
                const isSelected = (localSettings.geminiModel || 'gemini-flash-latest') === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setLocalSettings((prev) => ({ ...prev, geminiModel: m.id }))}
                    className={`text-left p-2.5 rounded-[8px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#10a37f]/10 border-[#10a37f] text-[#e5e7eb]'
                        : 'bg-[#0f1115] border-[#232733] text-[#9ca3af] hover:border-slate-700 hover:text-[#e5e7eb]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{m.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-[#10a37f] border border-[#10a37f]/30">
                        {m.badge}
                      </span>
                    </div>
                    <div className="text-[11px] mt-1 text-slate-400">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles Básicos */}
          <div className="space-y-3 pt-2 border-t border-[#232733]">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Cache Semântico Local</div>
                <div className="text-xs text-[#9ca3af]">Responde consultas frequentes instantaneamente (&lt;10ms)</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.enableCache}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, enableCache: e.target.checked }))}
                className="w-4 h-4 accent-[#10a37f] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Memória RAG Local (IndexedDB)</div>
                <div className="text-xs text-[#9ca3af]">Recupera contexto histórico por similaridade vetorial</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.enableRag}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, enableRag: e.target.checked }))}
                className="w-4 h-4 accent-[#10a37f] cursor-pointer"
              />
            </div>
          </div>

          {/* Seção Avançada Colapsável */}
          <div className="pt-2 border-t border-[#232733]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9ca3af] hover:text-[#e5e7eb] transition-colors"
            >
              {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>Avançado (Pipelines Opcionais)</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pl-2 bg-[#0f1115] p-3 rounded-[8px] border border-[#232733]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-xs">Self-Refinement (3 Passos)</div>
                    <div className="text-[11px] text-[#9ca3af]">Rascunho → Crítica estruturada → Síntese polida</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.selfRefinement}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, selfRefinement: e.target.checked }))}
                    className="w-4 h-4 accent-[#10a37f] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-xs">Mixture of Agents (MoA)</div>
                    <div className="text-[11px] text-[#9ca3af]">Inferência paralela em 3 modelos + sintetizador final</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.mixtureOfAgents}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, mixtureOfAgents: e.target.checked }))}
                    className="w-4 h-4 accent-[#10a37f] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-xs">Agente Autônomo</div>
                    <div className="text-[11px] text-[#9ca3af]">Gera plano em passos e invoca ferramentas de suporte</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.autonomousAgent}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, autonomousAgent: e.target.checked }))}
                    className="w-4 h-4 accent-[#10a37f] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-xs">Mostrar Logs de Roteamento</div>
                    <div className="text-[11px] text-[#9ca3af]">Exibe provedor, modelo e trace nas mensagens</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.showDebugLogs}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, showDebugLogs: e.target.checked }))}
                    className="w-4 h-4 accent-[#10a37f] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botão Limpar Cache */}
          <div className="pt-2 border-t border-[#232733]">
            <button
              type="button"
              onClick={handleClearCacheClick}
              disabled={clearing}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 rounded-[8px] text-xs font-medium transition-colors"
              id="btn-clear-cache"
            >
              {clearSuccess ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Cache e Memória Resetados com Sucesso!</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{clearing ? 'Limpando...' : 'Limpar Cache & Resetar Memória'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-5 py-3 border-t border-[#232733] flex justify-end gap-2 bg-[#0f1115]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#9ca3af] hover:text-[#e5e7eb] rounded-[8px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-2 text-xs font-medium bg-[#10a37f] hover:bg-[#0e8e6e] text-white rounded-[8px] transition-colors"
            id="btn-save-settings"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
