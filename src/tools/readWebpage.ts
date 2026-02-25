import { chromium } from "playwright";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { webpageCache } from "./cache.js";

export interface WebpageContent {
  title: string;
  markdown: string;
  url: string;
}

// 创建 DOMPurify 实例
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// 网页读取超时配置
const PAGE_TIMEOUT = 20000; // 20 秒

/**
 * 读取网页内容并转换为 Markdown
 * @param url 网页 URL
 */
export async function readWebpage(url: string): Promise<WebpageContent> {
  // 检查缓存
  const cached = webpageCache.get(url) as WebpageContent | null;
  if (cached) {
    console.error(`[Cache] 网页命中缓存: ${url}`);
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
    page.setDefaultTimeout(PAGE_TIMEOUT);

    // 访问网页（带超时）
    await page.goto(url, {
      waitUntil: "domcontentloaded", // 改用 domcontentloaded 更快
      timeout: PAGE_TIMEOUT,
    });

    // 提取页面标题和主要内容
    const { title, html } = await page.evaluate(
      () => {
        // 获取标题
        const title =
          document.querySelector("h1")?.textContent?.trim() ||
          document.title ||
          "";

        // 尝试找到主要内容区域
        let contentElement: Element | null = null;

        // 优先使用常见的内容容器选择器
        const contentSelectors = [
          "article",
          "main",
          '[role="main"]',
          ".content",
          ".post-content",
          ".article-content",
          ".entry-content",
          "#content",
          "body",
        ];

        for (const selector of contentSelectors) {
          contentElement = document.querySelector(selector);
          if (contentElement) break;
        }

        if (!contentElement) {
          contentElement = document.body;
        }

        // 克隆元素以避免修改原始 DOM
        const clone = contentElement.cloneNode(true) as Element;

        // 移除不需要的元素
        const unwantedSelectors = [
          "script",
          "style",
          "nav",
          "header",
          "footer",
          ".advertisement",
          ".ad",
          ".sidebar",
          ".comments",
          ".social-share",
          "iframe",
          "noscript",
        ];

        unwantedSelectors.forEach((selector) => {
          clone.querySelectorAll(selector).forEach((el) => el.remove());
        });

        return {
          title,
          html: clone.innerHTML,
        };
      },
      { timeout: 5000 }
    );

    // 使用 DOMPurify 清洗 HTML
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "b",
        "i",
        "em",
        "strong",
        "a",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "code",
        "pre",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title"],
    });

    // 转换为 Markdown
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });

    const markdown = turndownService.turndown(cleanHtml);

    const result = {
      title,
      markdown: markdown.trim(),
      url,
    };

    // 缓存结果
    webpageCache.set(url, result);
    console.error(`[Cache] 网页内容已缓存: ${url}`);

    return result;
  } finally {
    await browser.close().catch(() => {});
  }
}
