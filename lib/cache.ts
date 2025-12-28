/**
 * Advanced Caching Utility
 * Implements LRU cache with TTL support for better performance
 */

interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
}

export class LRUCache<T> {
    private cache: Map<string, CacheEntry<T>>;
    private maxSize: number;
    private defaultTTL: number;

    constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    /**
     * Get value from cache
     */
    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    /**
     * Set value in cache
     */
    set(key: string, value: T, ttl?: number): void {
        // Remove oldest entry if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        });
    }

    /**
     * Check if key exists and is valid
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Delete key from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Clean expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.cache.delete(key));
    }
}

/**
 * IndexedDB Cache for larger data
 */
export class IndexedDBCache {
    private dbName: string;
    private storeName: string;
    private db: IDBDatabase | null = null;

    constructor(dbName: string = 'messenger-cache', storeName: string = 'data') {
        this.dbName = dbName;
        this.storeName = storeName;
    }

    /**
     * Initialize database
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    /**
     * Get value from IndexedDB
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const entry = request.result;

                if (!entry) {
                    resolve(null);
                    return;
                }

                // Check if expired
                if (entry.expiry && Date.now() > entry.expiry) {
                    this.delete(key);
                    resolve(null);
                    return;
                }

                resolve(entry.value);
            };
        });
    }

    /**
     * Set value in IndexedDB
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const entry = {
                value,
                expiry: ttl ? Date.now() + ttl : null,
            };

            const request = store.put(entry, key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    /**
     * Delete value from IndexedDB
     */
    async delete(key: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    /**
     * Clear all data
     */
    async clear(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

// Create singleton instances
export const messageCache = new LRUCache<any>(500, 10 * 60 * 1000); // 10 minutes TTL
export const userCache = new LRUCache<any>(200, 30 * 60 * 1000); // 30 minutes TTL
export const conversationCache = new LRUCache<any>(100, 15 * 60 * 1000); // 15 minutes TTL
export const mediaCache = new IndexedDBCache('messenger-media', 'files');

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    getCacheKey?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
        const key = getCacheKey ? getCacheKey(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);

        return result;
    }) as T;
}
