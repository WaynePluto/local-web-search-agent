import { tavily } from "@tavily/core";
import { SearchResult } from "./webSearchBing.js";
import { searchCache } from "./cache.js";

/**
 * 生成缓存键
 */
function getCacheKey(query: string, num: number): string {
  return `tavily:${query}:${num}`;
}

/**
 * 使用 Tavily 搜索引擎执行搜索
 * @param query 搜索关键词
 * @param num 返回结果数量
 */
export async function webSearchTavily(
  query: string,
  num: number = 10
): Promise<SearchResult[]> {
  // 检查缓存
  const cacheKey = getCacheKey(query, num);
  const cached = searchCache.get(cacheKey) as SearchResult[] | null;
  if (cached) {
    console.error(`[Cache] Tavily 搜索命中缓存: ${query}`);
    return cached;
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("缺少环境变量：TAVILY_API_KEY");
  }

  const client = tavily({ apiKey });

  const response = await client.search(query, {
    maxResults: Math.min(num, 20),
    searchDepth: "basic",
    topic: "general",
  });

  const results: SearchResult[] = response.results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content,
  }));

  // 缓存结果
  searchCache.set(cacheKey, results);
  console.error(`[Cache] Tavily 搜索结果已缓存: ${query} (${results.length} 条)`);

  return results;
}
