#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { webSearchBing } from "./tools/webSearchBing.js";
import { readWebpage } from "./tools/readWebpage.js";
import { getCurrentTime } from "./tools/currentTime.js";

// 创建 MCP Server
const server = new Server(
  {
    name: "local-web-search-agent",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// 注册工具列表处理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "web_search_bing",
        description:
          "使用 Bing 搜索引擎执行网络搜索。输入：query（搜索关键词）和 num（返回结果数量，默认10）。返回：包含标题、URL和摘要的搜索结果列表。",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "搜索关键词",
            },
            num: {
              type: "number",
              description: "返回结果数量（默认10，最大50）",
              default: 10,
            },
            useInternational: {
              type: "boolean",
              description: "是否使用 Bing 国际版（默认 false，使用中文版）",
              default: false,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "read_webpage",
        description:
          "访问指定 URL，提取并清洗页面正文内容，返回干净的 Markdown 格式文本。输入：url（网页地址）。返回：包含标题和 Markdown 内容的对象。",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "要读取的网页 URL",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "get_current_time",
        description: "获取当前时间信息，包括当前年份、去年年份、前年年份等。用于搜索最新动态时动态获取年份信息。",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// 注册工具调用处理器
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "web_search_bing": {
        const query = args?.query as string;
        const num = (args?.num as number) ?? 10;
        const useInternational = (args?.useInternational as boolean) ?? false;

        if (!query) {
          throw new Error("缺少必需参数：query");
        }

        const results = await webSearchBing(query, num, useInternational);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case "read_webpage": {
        const url = args?.url as string;

        if (!url) {
          throw new Error("缺少必需参数：url");
        }

        const result = await readWebpage(url);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_current_time": {
        const result = getCurrentTime();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: errorMessage }),
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Web Search MCP Server running on stdio");
}

main().catch(error => {
  console.error("Server error:", error);
  process.exit(1);
});
