interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * 简单的内存缓存实现
 */
export class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private ttl: number; // 缓存有效期（毫秒）

  constructor(ttl: number = 5 * 60 * 1000) {
    // 默认 5 分钟
    this.ttl = ttl;
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  clean(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }
}

// 创建缓存实例（使用 unknown 避免泛型问题）
export const searchCache = new Cache<unknown>(5 * 60 * 1000); // 搜索结果缓存 5 分钟
export const webpageCache = new Cache<unknown>(10 * 60 * 1000); // 网页内容缓存 10 分钟

// 定期清理过期缓存（每分钟）
setInterval(() => {
  searchCache.clean();
  webpageCache.clean();
}, 60 * 1000);
