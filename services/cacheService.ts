const CACHE_KEY = 'ecoBotCache';
const MAX_CACHE_SIZE = 50; // Store up to 50 recent responses

interface Cache {
  [key: string]: string;
}

interface CacheStore {
    entries: Cache;
    order: string[];
}

const getCacheStore = (): CacheStore => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      // Basic validation
      if (parsed.entries && Array.isArray(parsed.order)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  return { entries: {}, order: [] };
};

const saveCacheStore = (store: CacheStore) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

const normalizeKey = (key: string): string => {
    return key.trim().toLowerCase();
}

export const getCachedResponse = (prompt: string): string | null => {
  const store = getCacheStore();
  const key = normalizeKey(prompt);
  return store.entries[key] || null;
};

export const setCachedResponse = (prompt: string, response: string): void => {
  const store = getCacheStore();
  const key = normalizeKey(prompt);
  
  // If the key doesn't exist yet, add it to the order
  if (!store.entries[key]) {
      store.order.push(key);
  }

  store.entries[key] = response;
  
  // Enforce cache size limit (FIFO)
  if (store.order.length > MAX_CACHE_SIZE) {
    const oldestKey = store.order.shift();
    if (oldestKey) {
        delete store.entries[oldestKey];
    }
  }

  saveCacheStore(store);
};
