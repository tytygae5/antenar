import React, { useState } from 'react';
import { PresetPrompt } from '../types';
import { Sparkles, Terminal, BookOpen, Search, Feather, ChevronDown, ChevronUp, Save, Check } from 'lucide-react';

export const SYSTEM_PROMPT_PRESETS: PresetPrompt[] = [
  {
    id: 'senior-dev',
    name: 'Programador Sênior',
    description: 'Especialista em arquitetura limpa, TypeScript, otimizações e padrões SOLID.',
    icon: 'Terminal',
    prompt: `Você é um Engenheiro de Software Fullstack Sênior e Especialista em Arquitetura de Software.
Responda com código conciso, modular, seguro, fortemente tipado em TypeScript/Python e pronto para produção.
Explique brevemente as decisões técnicas, trade-offs de desempenho e boas práticas.`,
  },
  {
    id: 'didactic-teacher',
    name: 'Professor Didático',
    description: 'Explica conceitos complexos com analogias claras, ritmo progressivo e exemplos práticos.',
    icon: 'BookOpen',
    prompt: `Você é um Professor Didático premiado.
Sua missão é explicar conceitos de forma extremamente clara, acessível e engajadora.
Utilize analogias intuitivas do mundo real, organize o conteúdo em etapas lógicas e finalize com um resumo prático.`,
  },
  {
    id: 'critical-analyst',
    name: 'Analista Crítico',
    description: 'Análise profunda, identificação de falhas, riscos, premissas ocultas e visão 360°.',
    icon: 'Search',
    prompt: `Você é um Analista Crítico e Estrategista Sênior.
Avalie rigorosamente as premissas, aponte vulnerabilidades, vieses cognitivos e consequências de segunda ordem.
Estruture suas respostas com dados, análise de riscos e recomendações acionáveis.`,
  },
  {
    id: 'poet',
    name: 'Poeta & Criativo',
    description: 'Estilo literário refinado, métrica poética, metáforas vívidas e escrita expressiva.',
    icon: 'Feather',
    prompt: `Você é um Poeta e Escritor de prosa lírica e expressiva.
Responda com elegância literária, metáforas vívidas e ritmo sonoro harmonioso em língua portuguesa, mantendo clareza e profundidade emocional.`,
  },
];

interface SystemPromptBarProps {
  systemPrompt: string;
  activePresetId?: string;
  onUpdateSystemPrompt: (prompt: string, presetId?: string) => void;
}

export const SystemPromptBar: React.FC<SystemPromptBarProps> = ({
  systemPrompt,
  activePresetId,
  onUpdateSystemPrompt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState(systemPrompt);
  const [justSaved, setJustSaved] = useState(false);

  // Sincroniza texto local se prop mudar
  React.useEffect(() => {
    setCustomText(systemPrompt);
  }, [systemPrompt]);

  const handleApplyPreset = (preset: PresetPrompt) => {
    setCustomText(preset.prompt);
    onUpdateSystemPrompt(preset.prompt, preset.id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleManualSave = () => {
    onUpdateSystemPrompt(customText, undefined);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'BookOpen':
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'Search':
        return <Search className="w-3.5 h-3.5 text-amber-400" />;
      case 'Feather':
        return <Feather className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const currentPreset = SYSTEM_PROMPT_PRESETS.find((p) => p.id === activePresetId);

  return (
    <div className="border-b border-slate-800 bg-[#0c0e14] px-4 py-2.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            id="toggle-system-prompt-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>System Prompt</span>
            {currentPreset && (
              <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800">
                {currentPreset.name}
              </span>
            )}
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center gap-1.5">
            {SYSTEM_PROMPT_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`preset-btn-${preset.id}`}
                  onClick={() => handleApplyPreset(preset)}
                  title={preset.description}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {getPresetIcon(preset.icon)}
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {justSaved && (
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
            <Check className="w-3 h-3" />
            <span>Salvo no LocalStorage</span>
          </div>
        )}
      </div>

      {/* Expandable Textarea Panel */}
      {isOpen && (
        <div className="max-w-5xl mx-auto mt-2.5 p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Defina a persona, diretrizes de comportamento ou restrições do agente:</span>
            <span className="text-[11px] font-mono text-slate-500">{customText.length} caracteres</span>
          </div>

          <textarea
            id="system-prompt-textarea"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={4}
            placeholder="Ex: Você é um assistente sênior em IA..."
            className="w-full bg-[#0a0c10] text-slate-200 text-xs font-mono p-2.5 rounded-md border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-y"
          />

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-500">
              * Vinculado permanentemente a esta conversa via IndexedDB & LocalStorage.
            </p>
            <div className="flex items-center gap-2">
              <button
                id="reset-prompt-btn"
                onClick={() => {
                  setCustomText('');
                  onUpdateSystemPrompt('', undefined);
                }}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              >
                Limpar
              </button>
              <button
                id="save-prompt-btn"
                onClick={handleManualSave}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Diretriz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
