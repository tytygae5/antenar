export interface ProviderHealth {
  name: string;
  configured: boolean;
  ok?: boolean;
  latencyMs?: number;
  error?: string;
}

export interface HealthCheckResponse {
  providers: ProviderHealth[];
  timestamp: string;
}

/**
 * Executa o diagnóstico completo dos provedores chamando a API de health
 * e formata a resposta como markdown estruturado.
 */
export async function executeStatusCommand(): Promise<string> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: HealthCheckResponse = await res.json();
    const providers = data.providers || [];

    let activeCount = 0;
    const lines = providers.map((p) => {
      const nameCol = (p.name || '').padEnd(12, ' ');
      if (p.configured && p.ok) {
        activeCount++;
        return `✅ ${nameCol} ativo (${p.latencyMs ?? 0}ms)`;
      } else if (!p.configured) {
        return `⚠️ ${nameCol} sem chave`;
      } else {
        return `❌ ${nameCol} erro (${p.error || 'falha'})`;
      }
    });

    return [
      '📊 **Status dos Provedores**',
      '',
      '```text',
      ...lines,
      '```',
      '',
      `**Total:** ${activeCount} de ${providers.length} ativos`,
      activeCount === 0
        ? '⚠️ *Nenhuma chave configurada. Configure no Secrets do AI Studio.*'
        : activeCount < 3
        ? '💡 *Recomendação: configure mais provedores (ex: GROQ_API_KEY, OPENROUTER_API_KEY) para mais resiliência.*'
        : '⚡ *Sistema altamente resiliente com múltiplos fallbacks ativos.*'
    ].join('\n');
  } catch (err: any) {
    return `❌ **Erro ao consultar diagnóstico de provedores:** ${err.message || err}`;
  }
}
