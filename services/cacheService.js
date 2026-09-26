require("dotenv").config();
const Redis = require("ioredis");

class CacheService {
    constructor() {
        this.redis = null;
        this.memoryStore = new Map(); // Fallback RAM store for local dev

        // Support either REDIS_URI or REDIS_URL from .env
        const redisConnectionUrl = process.env.REDIS_URI || process.env.REDIS_URL;

        if (redisConnectionUrl) {
            this.redis = new Redis(redisConnectionUrl, {
                maxRetriesPerRequest: 2,
                enableOfflineQueue: false
            });

            this.redis.on("connect", () => console.log("⚡ Redis Cache Connected"));
            this.redis.on("error", (err) => {
                console.warn("⚠️ Redis error, using in-memory cache fallback:", err.message);
            });
        } else {
            console.log("⚡ CacheService initialized (In-Memory RAM mode)");
        }
    }

    /**
     * Get data from cache, or run fetchFn() to query PostgreSQL and cache the result
     */
    async getOrSet(key, ttlSeconds, fetchFn) {
        try {
            const start = Date.now();
            // 1. Try reading from cache first
            const cachedValue = await this.get(key);
            if (cachedValue !== null) {
                console.log(`🟢 [CACHE HIT]  ${key} (${Date.now() - start}ms)`);
                return cachedValue;
            }

            // 2. CACHE MISS: Run the actual PostgreSQL query
            const freshData = await fetchFn();
            console.log(`🟡 [CACHE MISS] ${key} - Queried PostgreSQL (${Date.now() - start}ms)`);

            // 3. Save the result in cache for next time
            await this.set(key, freshData, ttlSeconds);

            return freshData;
        } catch (err) {
            console.error(`Cache error on key [${key}]:`, err.message);
            return await fetchFn();
        }
    }

    async get(key) {
        if (this.redis && this.redis.status === "ready") {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        }

        const entry = this.memoryStore.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.memoryStore.delete(key);
            return null;
        }
        return entry.value;
    }

    async set(key, value, ttlSeconds = 60) {
        if (this.redis && this.redis.status === "ready") {
            await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
            return;
        }

        this.memoryStore.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    }

    /**
     * Delete all cache keys starting with a prefix when data changes
     */
    async invalidatePrefix(prefix) {
        if (this.redis && this.redis.status === "ready") {
            const keys = await this.redis.keys(`${prefix}*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            return;
        }

        for (const key of this.memoryStore.keys()) {
            if (key.startsWith(prefix)) {
                this.memoryStore.delete(key);
            }
        }
    }

    /**
     * Cleanly disconnect Redis when the server shuts down
     */
    async close() {
        if (this.redis) {
            this.redis.disconnect();
        }
    }
}

module.exports = new CacheService();