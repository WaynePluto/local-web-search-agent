import { chromium } from "playwright";
import { searchCache } from "./cache.js";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// 搜索超时配置
const SEARCH_TIMEOUT = 15000; // 15 秒

/**
 * 生成缓存键
 */
function getCacheKey(query: string, num: number, useInternational: boolean): string {
  return `search:${query}:${num}:${useInternational}`;
}

/**
 * 使用 Bing 搜索引擎执行搜索
 * @param query 搜索关键词
 * @param num 返回结果数量
 * @param useInternational 是否使用国际版
 */
export async function webSearchBing(
  query: string,
  num: number = 10,
  useInternational: boolean = false
): Promise<SearchResult[]> {
  // 检查缓存
  const cacheKey = getCacheKey(query, num, useInternational);
  const cached = searchCache.get(cacheKey) as SearchResult[] | null;
  if (cached) {
    console.error(`[Cache] 搜索命中缓存: ${query}`);
    return cached;
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "D:/app/chrome-win64/chrome.exe",
    headless: true,
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // 设置页面超时
    page.setDefaultTimeout(SEARCH_TIMEOUT);

    // 构造 Bing 搜索 URL
    const baseUrl = useInternational
      ? "https://www.bing.com/search?"
      : "https://cn.bing.com/search?";
    const searchUrl = new URL(baseUrl);
    searchUrl.searchParams.set("q", query);

    if (useInternational) {
      searchUrl.searchParams.set("ensearch", "1");
    }

    // 访问搜索页面（带超时）
    await page.goto(searchUrl.toString(), {
      waitUntil: "domcontentloaded", // 改用 domcontentloaded 更快
      timeout: SEARCH_TIMEOUT,
    });

    // 等待搜索结果加载（带超时）
    await page.waitForSelector("li.b_algo", { timeout: 10000 }).catch(() => {
      throw new Error("搜索结果加载超时");
    });

    // 提取搜索结果
    const results = await page.evaluate((maxResults: number) => {
      const searchResults: SearchResult[] = [];

      // 查找所有自然搜索结果
      const resultElements = document.querySelectorAll("li.b_algo");

      for (let i = 0; i < Math.min(resultElements.length, maxResults); i++) {
        const elem = resultElements[i];

        // 提取标题和链接
        const titleElem = elem.querySelector("h2 a");
        if (!titleElem) continue;

        const title = (titleElem as HTMLAnchorElement).textContent?.trim() || "";
        const url = (titleElem as HTMLAnchorElement).href;

        // 跳过广告和无效链接
        if (!url || url.startsWith("javascript:") || url.includes("/aclk?")) {
          continue;
        }

        // 提取摘要
        let snippet = "";
        const snippetElem = elem.querySelector("p, div.b_caption p");
        if (snippetElem) {
          snippet = snippetElem.textContent?.trim() || "";
        }

        searchResults.push({ title, url, snippet });
      }

      return searchResults;
    }, num);

    // 缓存结果
    searchCache.set(cacheKey, results);
    console.error(`[Cache] 搜索结果已缓存: ${query} (${results.length} 条)`);

    return results;
  } finally {
    await browser.close().catch(() => {});
  }
}
