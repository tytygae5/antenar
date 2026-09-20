/**
 * Cache Sanitizer and Management Utilities
 */

const SHORT_GREETINGS = /^(oi+|ol[áa]|e a[íi]|hey|hello|bom dia|boa tarde|boa noite|tudo bem|tudo bom|blz|beleza|eae|eai|salve)\b/i;

export function isShortGreeting(prompt) {
  const p = (prompt || '').trim();
  return p.length <= 15 && SHORT_GREETINGS.test(p);
}

export async function getAllCacheEntries() {
  if (typeof window === 'undefined' || !window.indexedDB) return [];
  return new Promise((resolve) => {
    const req = window.indexedDB.open('AgentIntelligenceDB');
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('semantic_cache')) {
        return resolve([]);
      }
      const tx = db.transaction('semantic_cache', 'readonly');
      const store = tx.objectStore('semantic_cache');
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => resolve(getAllReq.result || []);
      getAllReq.onerror = () => resolve([]);
    };
    req.onerror = () => resolve([]);
  });
}

export async function deleteCacheEntry(id) {
  if (typeof window === 'undefined' || !window.indexedDB || !id) return;
  return new Promise((resolve) => {
    const req = window.indexedDB.open('AgentIntelligenceDB');
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('semantic_cache')) return resolve();
      const tx = db.transaction('semantic_cache', 'readwrite');
      const store = tx.objectStore('semantic_cache');
      const delReq = store.delete(id);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => resolve();
    };
    req.onerror = () => resolve();
  });
}

export async function sanitizeCache() {
  const entries = await getAllCacheEntries();
  let deletedCount = 0;
  for (const e of entries) {
    const query = e.query || '';
    const resp = e.response || '';
    const bad =
      isShortGreeting(query) ||
      /n[ãa]o posso|n[ãa]o vou|recuso|bots|e-?mail|detec[çc][ãa]o|CAPTCHA/i.test(resp);
    if (bad) {
      await deleteCacheEntry(e.id);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`[SanitizeCache] Deletadas ${deletedCount} entradas envenenadas/inválidas do cache.`);
  }
  return deletedCount;
}
