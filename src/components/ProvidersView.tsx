import React, { useState } from 'react';
import { PROVIDERS_LIST } from '../data/providersData';
import { ProviderInfo } from '../types';
import { KeyRound, ExternalLink, ShieldCheck, Zap, Info, Check, Copy } from 'lucide-react';

interface ProvidersViewProps {
  apiKeys: Record<string, string>;
  onUpdateKey: (providerId: string, val: string) => void;
}

export const ProvidersView: React.FC<ProvidersViewProps> = ({ apiKeys, onUpdateKey }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Catálogo de 10 Provedores de Custo Zero ($0.00)
            </h3>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl">
              O agente prioriza modelos permanentemente gratuitos e rotas agregadas de $0.00 por token. Você pode fornecer chaves locais pelo formulário abaixo ou declará-las diretamente no arquivo <code className="text-indigo-300">.env</code>.
            </p>
          </div>
          <div className="text-xs bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-slate-400">
            Armazenamento: <strong>Navegador / LocalStorage</strong>
          </div>
        </div>
      </div>

      {/* Grid de Provedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDERS_LIST.map((provider) => {
          const keyVal = apiKeys[provider.id] || '';
          return (
            <div
              key={provider.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {provider.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Env: <span className="text-indigo-400">{provider.keyEnv}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                    {provider.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {provider.description}
                </p>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                    Cota & Tier Gratuito
                  </div>
                  <div className="text-xs text-slate-300">
                    {provider.freeTier}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                    Modelos Recomendados para Fallback
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Key or Action Link */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                {provider.requiresKey ? (
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
                      <input
                        type="password"
                        placeholder={`Inserir ${provider.keyEnv}...`}
                        value={keyVal}
                        onChange={(e) => onUpdateKey(provider.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Zero Config (Sem chave necessária)
                  </div>
                )}

                <a
                  href={provider.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors shrink-0"
                >
                  Obter Chave
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
