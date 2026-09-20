import React from 'react';
import { motion } from 'motion/react';
import { Check, Loader, Video, Link, Calendar, Image } from 'lucide-react';

interface UploadProgressBlockProps {
  step: string; // '1/5' | '2/5' | '3/5' | '4/5' | '5/5' | 'done' | 'error'
  percent: number;
  message: string;
  sent?: number;
  total?: number;
  error?: string;
  videoId?: string;
  url?: string;
  metadata?: {
    title: string;
    privacyStatus: string;
    publishAt?: string;
  };
}

export default function UploadProgressBlock({
  step,
  percent,
  message,
  sent,
  total,
  error,
  videoId,
  url,
  metadata
}: UploadProgressBlockProps) {
  const isDone = step === 'done' || videoId;
  const isError = step === 'error' || error;

  const stepsList = [
    { key: '1/5', label: 'Autenticando com Google' },
    { key: '2/5', label: 'Enviando arquivo de vídeo' },
    { key: '3/5', label: 'Definindo título, descrição e tags' },
    { key: '4/5', label: 'Enviando thumbnail' },
    { key: '5/5', label: 'Agendando publicação' }
  ];

  const getStepStatus = (itemKey: string) => {
    if (isError) return 'error';
    if (isDone) return 'success';

    const currentIdx = stepsList.findIndex((s) => s.key === step);
    const itemIdx = stepsList.findIndex((s) => s.key === itemKey);

    if (itemIdx < currentIdx) return 'success';
    if (itemIdx === currentIdx) return 'active';
    return 'pending';
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div id="upload-progress-block" className="my-6 p-6 bg-white border border-neutral-200 rounded-xl max-w-xl mx-auto shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
          <Video className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {isDone ? 'Vídeo Publicado!' : isError ? 'Falha na Publicação' : 'Publicando no YouTube...'}
          </h3>
          <p className="text-xs text-neutral-500">
            {isDone ? 'Pronto para receber audiência' : isError ? 'Ocorreu um erro no pipeline' : 'Acompanhe as etapas de processamento'}
          </p>
        </div>
      </div>

      {isError && (
        <div className="p-4 mb-5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">
          <strong>Erro:</strong> {error || 'Falha ao processar o upload para o YouTube.'}
        </div>
      )}

      {/* Lista de passos */}
      <div className="space-y-4 mb-6">
        {stepsList.map((item, idx) => {
          const status = getStepStatus(item.key);
          return (
            <div key={item.key} className="flex items-start gap-4">
              <div className="mt-0.5">
                {status === 'success' && (
                  <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                {status === 'active' && (
                  <div className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full">
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
                {status === 'pending' && (
                  <div className="flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-400 rounded-full text-xs font-semibold">
                    {idx + 1}
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center justify-center w-5 h-5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                    ×
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${status === 'active' ? 'text-neutral-900 font-semibold' : status === 'success' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {item.label}
                </p>

                {/* Detalhes de envio e barra de progresso no passo 2 */}
                {status === 'active' && item.key === '2/5' && (
                  <div className="mt-2 space-y-1.5">
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-blue-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-neutral-500">
                      <span>{percent}% concluído</span>
                      <span>
                        {formatSize(sent)} de {formatSize(total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Caixa de status do vídeo publicado */}
      {isDone && url && (
        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-semibold text-neutral-800 line-clamp-1">
                {metadata?.title || 'Título indisponível'}
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Status de Privacidade: <span className="font-semibold capitalize text-neutral-700">{metadata?.privacyStatus || 'privado'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100 text-xs">
            <a
              href={url}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              Ver no YouTube
            </a>
            {metadata?.publishAt && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-md font-medium">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                Agendado: {new Date(metadata.publishAt).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      )}

      {!isDone && !isError && (
        <div className="mt-4 flex items-center gap-2 justify-center py-2 text-xs text-neutral-400 border-t border-neutral-100">
          <Loader className="w-3 h-3 animate-spin text-neutral-400" />
          <span>Mantenha a página aberta para concluir o processo</span>
        </div>
      )}
    </div>
  );
}
