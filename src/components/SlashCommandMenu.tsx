import React from 'react';
import { Video, Search, Trash2, RotateCcw, Cpu, HelpCircle } from 'lucide-react';

export interface SlashCommand {
  cmd: string;
  alias?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export interface SlashCommandMenuProps {
  filter: string;
  onSelectCommand: (cmd: SlashCommand) => void;
  onClose: () => void;
  commands: SlashCommand[];
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  filter,
  onSelectCommand,
  commands,
}) => {
  const cleanFilter = filter.toLowerCase().trim();

  const filtered = commands.filter(
    (c) =>
      c.cmd.toLowerCase().includes(cleanFilter) ||
      (c.alias && c.alias.toLowerCase().includes(cleanFilter)) ||
      c.description.toLowerCase().includes(cleanFilter)
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-0 right-0 max-w-lg mx-auto bg-[#161920] border border-[#10a37f]/50 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-bottom-2">
      <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#10a37f] tracking-wider border-b border-slate-800 mb-1">
        ⚡ Comandos de Poder (Atalhos)
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectCommand(item)}
              className="w-full flex items-center gap-3 p-2 hover:bg-[#10a37f]/15 hover:border-[#10a37f]/30 border border-transparent rounded-xl text-left transition-all cursor-pointer text-slate-200 group"
            >
              <div className="p-1.5 bg-slate-800 group-hover:bg-[#10a37f] group-hover:text-white rounded-lg text-[#10a37f] transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-100">{item.cmd}</span>
                  {item.alias && (
                    <span className="text-[10px] text-slate-400 font-mono">({item.alias})</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
