import React from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
}

export interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  isOpen: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  isOpen,
  onSelect,
  onNewChat,
  onDelete,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0f1115] border-r border-[#232733] flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64'
        }`}
        id="sidebar-container"
      >
        {/* Topo do Sidebar */}
        <div className="p-3 flex items-center justify-between border-b border-[#232733]/50">
          <button
            type="button"
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#161920] hover:bg-[#1f2937] text-[#e5e7eb] text-sm font-medium rounded-[8px] border border-[#232733] transition-colors"
            id="btn-new-chat"
          >
            <Plus className="w-4 h-4 text-[#10a37f]" />
            <span>Nova conversa</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="md:hidden ml-2 p-2 text-[#9ca3af] hover:text-[#e5e7eb] rounded-[8px]"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1" id="conversations-list">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6b7280]">
              Nenhuma conversa recente
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-[8px] cursor-pointer text-sm transition-colors ${
                    isActive
                      ? 'bg-[#1f2937] text-white font-medium'
                      : 'text-[#9ca3af] hover:bg-[#161920] hover:text-[#e5e7eb]'
                  }`}
                  id={`chat-item-${c.id}`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#10a37f]' : 'text-[#6b7280]'}`} />
                    <span className="truncate">{c.title || 'Nova conversa'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => onDelete(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6b7280] hover:text-red-400 rounded transition-opacity"
                    title="Excluir conversa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
