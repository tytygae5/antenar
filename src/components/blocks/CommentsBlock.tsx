import React, { useState } from 'react';
import { MessageSquare, Check, Edit2, Trash2, Send, CornerDownRight, ShieldCheck } from 'lucide-react';
import { postYouTubeCommentReply } from '../../utils/youtubeApi';

interface CommentItem {
  id: string;
  author: string;
  text: string;
  suggestedReply: string;
}

interface CommentsBlockProps {
  comments: CommentItem[];
  isAutoModeEnabled?: boolean;
  onToggleAutoMode?: () => void;
}

export default function CommentsBlock({
  comments: initialComments,
  isAutoModeEnabled = false,
  onToggleAutoMode
}: CommentsBlockProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [statusMap, setStatusMap] = useState<Record<string, { type: 'success' | 'loading' | 'error'; msg?: string }>>({});

  const handlePostReply = async (commentId: string, replyText: string) => {
    setStatusMap((prev) => ({ ...prev, [commentId]: { type: 'loading' } }));
    try {
      await postYouTubeCommentReply(commentId, replyText);
      setStatusMap((prev) => ({
        ...prev,
        [commentId]: { type: 'success', msg: 'Resposta postada com sucesso!' }
      }));
      setEditingId(null);
    } catch (err: any) {
      setStatusMap((prev) => ({
        ...prev,
        [commentId]: { type: 'error', msg: err.message || 'Erro ao postar.' }
      }));
    }
  };

  const handleStartEdit = (comment: CommentItem) => {
    setEditingId(comment.id);
    setEditingText(comment.suggestedReply);
  };

  const handleIgnore = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div id="comments-block" className="my-6 p-6 bg-white border border-neutral-200 rounded-xl max-w-xl mx-auto shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-600" />
            Comentários Recentes
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Sugestões inteligentes geradas pelo assistente
          </p>
        </div>

        {onToggleAutoMode && (
          <button
            onClick={onToggleAutoMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isAutoModeEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Auto-responder: {isAutoModeEnabled ? 'ON' : 'OFF'}
          </button>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-8 text-sm text-neutral-400">
          Nenhum comentário pendente de moderação no momento.
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => {
            const status = statusMap[c.id];
            const isEditing = editingId === c.id;

            return (
              <div key={c.id} className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg space-y-3">
                {/* Header do Comentário */}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-neutral-800">{c.author}</span>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed italic">
                  "{c.text}"
                </p>

                {/* Resposta Inteligente IA */}
                <div className="pt-2.5 border-t border-neutral-200/60">
                  <div className="flex gap-2 items-start text-xs text-neutral-500 mb-1.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-blue-600 flex items-center gap-1">
                      💡 Sugestão de Resposta IA
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 mt-1">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full text-xs p-2.5 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-400 focus:outline-none"
                        rows={2}
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 bg-white border border-neutral-200 text-[11px] font-semibold rounded-md text-neutral-600"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handlePostReply(c.id, editingText)}
                          disabled={status?.type === 'loading'}
                          className="px-2.5 py-1 bg-neutral-900 text-[11px] text-white font-semibold rounded-md hover:bg-neutral-800 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Enviar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600 bg-white border border-neutral-100 p-2.5 rounded-md leading-relaxed">
                      {c.suggestedReply}
                    </p>
                  )}
                </div>

                {/* Status e Feedback */}
                {status?.type === 'success' && (
                  <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded">
                    ✓ {status.msg}
                  </div>
                )}
                {status?.type === 'error' && (
                  <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded">
                    Error: {status.msg}
                  </div>
                )}

                {/* Ações */}
                {!isEditing && status?.type !== 'success' && (
                  <div className="flex gap-1.5 pt-1 text-xs">
                    <button
                      onClick={() => handlePostReply(c.id, c.suggestedReply)}
                      disabled={status?.type === 'loading'}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Postar
                    </button>
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-md font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleIgnore(c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-red-50 text-neutral-400 hover:text-red-600 border border-neutral-200 hover:border-red-100 rounded-md font-semibold transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Ignorar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
