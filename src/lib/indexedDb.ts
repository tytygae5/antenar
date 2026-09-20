/**
 * IndexedDB Local Storage Engine (v2)
 * Responsável por:
 * 1. Memória RAG Local
 * 2. Cache Semântico Local com Versionamento e Sanitização Estrita
 * 3. Logs de Observabilidade
 */

export interface RagRecord {
  id: string;
  timestamp: number;
  text: string;
  embedding: number[];
  role: 'user' | 'assistant' | 'system' | 'document';
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface SemanticCacheRecord {
  id: string;
  query: string;
  embedding: number[];
  response: string;
  model: string;
  provider: string;
  timestamp: number;
}

export interface ObservabilityRecord {
  id: string;
  timestamp: number;
  provider: string;
  model: string;
  latencyMs: number;
  tokensUsed: number;
  success: boolean;
  error?: string;
  taskType?: string;
}

const DB_NAME = 'AgentIntelligenceDB';
const DB_VERSION = 2;
const CACHE_VERSION = '2';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não disponível'));
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('rag_memory')) {
        const ragStore = db.createObjectStore('rag_memory', { keyPath: 'id' });
        ragStore.createIndex('timestamp', 'timestamp', { unique: false });
        ragStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      if (!db.objectStoreNames.contains('semantic_cache')) {
        const cacheStore = db.createObjectStore('semantic_cache', { keyPath: 'id' });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('observability_logs')) {
        const obsStore = db.createObjectStore('observability_logs', { keyPath: 'id' });
        obsStore.createIndex('timestamp', 'timestamp', { unique: false });
        obsStore.createIndex('provider', 'provider', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Inicialização no boot:
 * 1. Reseta chaves legacy de pipelines
 * 2. Valida versão de cache (CACHE_VERSION = 2)
 * 3. Se encontrar qualquer entrada de erro ("Nenhum provedor"), apaga todo o banco.
 */
export async function initAndSanitizeDb(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1.2 Força reset de flags legacy de pipeline
  localStorage.removeItem('selfRefinement');
  localStorage.removeItem('mixtureOfAgents');
  localStorage.removeItem('autonomousAgent');
  localStorage.removeItem('dryRun');

  const currentVersion = localStorage.getItem('agent_cache_version');
  if (currentVersion !== CACHE_VERSION) {
    console.log('[Cache] Versão antiga detectada. Resetando IndexedDB...');
    await wipeEntireDatabase();
    localStorage.setItem('agent_cache_version', CACHE_VERSION);
    return;
  }

  try {
    const db = await openDB();
    const shouldWipe = await new Promise<boolean>((resolve) => {
      const tx = db.transaction('semantic_cache', 'readonly');
      const store = tx.objectStore('semantic_cache');
      const req = store.getAll();

      req.onsuccess = () => {
        const records: SemanticCacheRecord[] = req.result || [];
        for (const r of records) {
          const resp = r.response || '';
          if (
            resp.includes('Nenhum provedor') ||
            resp.includes('❌') ||
            resp.startsWith('[Erro]') ||
            resp.startsWith('[Pipeline]') ||
            resp.length <= 5
          ) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      };

      req.onerror = () => resolve(false);
    });

    if (shouldWipe) {
      console.warn('[Cache] Entrada envenenada encontrada no boot. Apagando banco completamente...');
      await wipeEntireDatabase();
    }
  } catch (err) {
    console.warn('[Cache] Erro na validação de boot:', err);
  }
}

/**
 * Apaga e recria completamente o IndexedDB
 */
export async function wipeEntireDatabase(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;
  return new Promise((resolve) => {
    const req = window.indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => {
      console.log('[Cache] IndexedDB completamente deletado.');
      resolve();
    };
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

/**
 * Similaridade de Cosseno entre dois vetores normalizados
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ==========================================
// RAG LOCAL (IndexedDB)
// ==========================================

export async function saveRagMemory(
  text: string,
  embedding: number[],
  role: 'user' | 'assistant' | 'system' | 'document' = 'user',
  sessionId = 'default',
  metadata: Record<string, any> = {}
): Promise<string> {
  if (!text || text.trim().length === 0) return '';
  const db = await openDB();
  const id = `rag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const record: RagRecord = {
    id,
    timestamp: Date.now(),
    text,
    embedding: embedding || [],
    role,
    sessionId,
    metadata,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('rag_memory', 'readwrite');
    const store = tx.objectStore('rag_memory');
    const req = store.put(record);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export async function searchRagMemory(
  queryEmbedding: number[],
  topK = 5,
  minSimilarity = 0.35
): Promise<Array<{ record: RagRecord; similarity: number }>> {
  if (!queryEmbedding || queryEmbedding.length === 0) return [];
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('rag_memory', 'readonly');
    const store = tx.objectStore('rag_memory');
    const req = store.getAll();

    req.onsuccess = () => {
      const records: RagRecord[] = req.result || [];
      const scored = records
        .map((record) => ({
          record,
          similarity: cosineSimilarity(queryEmbedding, record.embedding),
        }))
        .filter((item) => item.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      resolve(scored);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function getRagMemoryCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('rag_memory', 'readonly');
      const store = tx.objectStore('rag_memory');
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

// ==========================================
// CACHE SEMÂNTICO (IndexedDB)
// ==========================================

export async function checkSemanticCache(
  queryEmbedding: number[],
  threshold = 0.95
): Promise<SemanticCacheRecord | null> {
  if (!queryEmbedding || queryEmbedding.length === 0) return null;
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('semantic_cache', 'readonly');
    const store = tx.objectStore('semantic_cache');
    const req = store.getAll();

    req.onsuccess = () => {
      const records: SemanticCacheRecord[] = req.result || [];
      let bestMatch: SemanticCacheRecord | null = null;
      let highestSimilarity = 0;

      for (const record of records) {
        const resp = record.response || '';
        // Proteção contra entrada inválida
        if (
          resp.length <= 5 ||
          resp.startsWith('Nenhum') ||
          resp.startsWith('❌') ||
          resp.startsWith('[Erro]') ||
          resp.startsWith('[Pipeline]') ||
          resp.includes('Nenhum provedor de IA disponível')
        ) {
          continue;
        }

        const sim = cosineSimilarity(queryEmbedding, record.embedding);
        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          if (sim >= threshold) {
            bestMatch = record;
          }
        }
      }

      resolve(bestMatch);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveSemanticCache(
  query: string,
  embedding: number[],
  response: string,
  model: string,
  provider: string
): Promise<void> {
  // REGRA 1.1: Só salva se response.length > 5 e NÃO for mensagem de erro
  if (!response || response.length <= 5) return;
  if (
    response.startsWith('Nenhum') ||
    response.startsWith('❌') ||
    response.startsWith('⚠️') ||
    response.startsWith('[Erro]') ||
    response.startsWith('[Pipeline]') ||
    response.includes('Nenhum provedor') ||
    (response.toLowerCase().includes('erro') && response.length < 100)
  ) {
    console.warn('[Cache] Rejeitado salvamento de mensagem de erro no cache.');
    return;
  }
  if (!embedding || embedding.length === 0) return;

  const db = await openDB();
  const record: SemanticCacheRecord = {
    id: `cache-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    query,
    embedding,
    response,
    model,
    provider,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('semantic_cache', 'readwrite');
    const store = tx.objectStore('semantic_cache');
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllSemanticCache(): Promise<void> {
  await wipeEntireDatabase();
  localStorage.setItem('agent_cache_version', CACHE_VERSION);
}

export async function sanitizeSemanticCache(): Promise<number> {
  await initAndSanitizeDb();
  return 0;
}

export async function getSemanticCacheCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('semantic_cache', 'readonly');
      const store = tx.objectStore('semantic_cache');
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

// ==========================================
// OBSERVABILIDADE (IndexedDB)
// ==========================================

export interface ObservabilityMetrics {
  totalRequests: number;
  successRate: number;
  avgLatencyMs: number;
  totalTokens: number;
  byProvider: Record<string, { requests: number; errors: number; avgLatency: number }>;
}

export async function getObservabilityLogs(limit = 100): Promise<ObservabilityRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('observability_logs', 'readonly');
      const store = tx.objectStore('observability_logs');
      const req = store.getAll();
      req.onsuccess = () => {
        const records: ObservabilityRecord[] = req.result || [];
        records.sort((a, b) => b.timestamp - a.timestamp);
        resolve(records.slice(0, limit));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export function calculateMetrics(logs: ObservabilityRecord[]): ObservabilityMetrics {
  if (!logs || logs.length === 0) {
    return {
      totalRequests: 0,
      successRate: 100,
      avgLatencyMs: 0,
      totalTokens: 0,
      byProvider: {},
    };
  }

  const total = logs.length;
  const successes = logs.filter((l) => l.success).length;
  const totalTokens = logs.reduce((acc, l) => acc + (l.tokensUsed || 0), 0);
  const totalLatency = logs.reduce((acc, l) => acc + (l.latencyMs || 0), 0);

  const byProvider: Record<string, { requests: number; errors: number; avgLatency: number; totalLat: number }> = {};
  for (const l of logs) {
    const p = l.provider || 'unknown';
    if (!byProvider[p]) {
      byProvider[p] = { requests: 0, errors: 0, avgLatency: 0, totalLat: 0 };
    }
    byProvider[p].requests++;
    if (!l.success) byProvider[p].errors++;
    byProvider[p].totalLat += l.latencyMs || 0;
  }

  const formattedByProvider: Record<string, { requests: number; errors: number; avgLatency: number }> = {};
  for (const [k, v] of Object.entries(byProvider)) {
    formattedByProvider[k] = {
      requests: v.requests,
      errors: v.errors,
      avgLatency: v.requests > 0 ? Math.round(v.totalLat / v.requests) : 0,
    };
  }

  return {
    totalRequests: total,
    successRate: total > 0 ? Math.round((successes / total) * 100) : 100,
    avgLatencyMs: total > 0 ? Math.round(totalLatency / total) : 0,
    totalTokens,
    byProvider: formattedByProvider,
  };
}

export async function logObservability(record: Omit<ObservabilityRecord, 'id'>): Promise<void> {
  try {
    const db = await openDB();
    const fullRecord: ObservabilityRecord = {
      ...record,
      id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('observability_logs', 'readwrite');
      const store = tx.objectStore('observability_logs');
      const req = store.put(fullRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Falha ao registrar log de observabilidade:', err);
  }
}
