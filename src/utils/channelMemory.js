// Utility for IndexedDB persistence of Channel Memory & Intelligence
const DB_NAME = 'channel_memory_db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('channel')) {
        db.createObjectStore('channel', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('feedback')) {
        db.createObjectStore('feedback', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('patterns')) {
        db.createObjectStore('patterns', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

export async function getChannelData() {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction('channel', 'readonly');
    const store = tx.objectStore('channel');
    const req = store.get('main');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function saveChannelData(data) {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction('channel', 'readwrite');
    const store = tx.objectStore('channel');
    const item = { id: 'main', ...data, updatedAt: Date.now() };
    const req = store.put(item);
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

export async function getVideos() {
  const db = await openDB();
  if (!db) return [];
  return new Promise((resolve) => {
    const tx = db.transaction('videos', 'readonly');
    const store = tx.objectStore('videos');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function addVideo(video) {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction('videos', 'readwrite');
    const store = tx.objectStore('videos');
    const item = {
      id: video.id || `video-${Date.now()}`,
      createdAt: Date.now(),
      ...video,
    };
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => resolve(null);
  });
}

export async function addFeedback(videoId, rating, notes) {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction('feedback', 'readwrite');
    const store = tx.objectStore('feedback');
    const item = { videoId, rating, notes, timestamp: Date.now() };
    const req = store.add(item);
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

export async function getPatterns() {
  const db = await openDB();
  if (!db) {
    return {
      bestTitles: ['Títulos com número (+34% CTR)', 'Nomes diretos de IA'],
      bestHooks: ['Ganchos com pergunta nos primeiros 5s (+22% retenção)'],
      bestCTAs: ['Incentivo a teste no site oficial'],
    };
  }
  return new Promise((resolve) => {
    const tx = db.transaction('patterns', 'readonly');
    const store = tx.objectStore('patterns');
    const req = store.get('main');
    req.onsuccess = () => {
      resolve(
        req.result || {
          id: 'main',
          bestTitles: ['Títulos com número (+34% CTR)', 'Nomes diretos de IA'],
          bestHooks: ['Ganchos com pergunta nos primeiros 5s (+22% retenção)'],
          bestCTAs: ['Incentivo a teste no site oficial'],
        }
      );
    };
    req.onerror = () =>
      resolve({
        id: 'main',
        bestTitles: [],
        bestHooks: [],
        bestCTAs: [],
      });
  });
}

export async function updatePatterns(patch) {
  const db = await openDB();
  if (!db) return false;
  const current = await getPatterns();
  return new Promise((resolve) => {
    const tx = db.transaction('patterns', 'readwrite');
    const store = tx.objectStore('patterns');
    const updated = { ...current, ...patch, id: 'main', updatedAt: Date.now() };
    const req = store.put(updated);
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

export async function clearChannelMemory() {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(['channel', 'videos', 'feedback', 'patterns'], 'readwrite');
    tx.objectStore('channel').clear();
    tx.objectStore('videos').clear();
    tx.objectStore('feedback').clear();
    tx.objectStore('patterns').clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

export async function getFromMemory(key) {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction('channel', 'readonly');
    const store = tx.objectStore('channel');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function saveToMemory(key, data) {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction('channel', 'readwrite');
    const store = tx.objectStore('channel');
    const item = { id: key, ...data, updatedAt: Date.now() };
    const req = store.put(item);
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

export async function updateChannelMemory(patch) {
  if (patch.videos) {
    for (const v of patch.videos) {
      await addVideo(v);
    }
  }
  const mainPatch = { ...patch };
  delete mainPatch.videos;
  if (Object.keys(mainPatch).length > 0) {
    const current = await getChannelData() || {};
    await saveChannelData({ ...current, ...mainPatch });
  }
}

