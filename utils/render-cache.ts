/**
 * Mermaid 渲染缓存
 * 用于缓存已渲染的 SVG 内容，避免重复渲染相同的图表
 */

interface CacheItem {
  svg: string;
  timestamp: number;
  theme: string;
}

class RenderCache {
  private cache: Map<string, CacheItem>;
  private maxSize: number;
  private ttl: number; // 缓存生存时间（毫秒）

  constructor(maxSize: number = 50, ttl: number = 1000 * 60 * 30) { // 默认 30 分钟过期
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * 生成缓存键
   * @param content - Mermaid 内容
   * @param theme - 主题名称
   * @returns 缓存键
   */
  private generateKey(content: string, theme: string): string {
    return `${content}:${theme}`;
  }

  /**
   * 获取缓存项
   * @param content - Mermaid 内容
   * @param theme - 主题名称
   * @returns 缓存的 SVG 或 null
   */
  get(content: string, theme: string): string | null {
    const key = this.generateKey(content, theme);
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问时间
    item.timestamp = Date.now();
    this.cache.set(key, item);

    return item.svg;
  }

  /**
   * 设置缓存项
   * @param content - Mermaid 内容
   * @param theme - 主题名称
   * @param svg - 渲染后的 SVG
   */
  set(content: string, theme: string, svg: string): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const key = this.generateKey(content, theme);
    this.cache.set(key, {
      svg,
      timestamp: Date.now(),
      theme
    });
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 删除最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

// 导出单例
export const renderCache = new RenderCache();