# Web Search Agent

为 Claude Code 提供网络搜索能力的 MCP Server 和子代理模板。

## 简介

本项目通过 MCP (Model Context Protocol) 为 Claude Code 提供网络搜索能力。当 Claude Code 需要查询实时信息或获取网络内容时，可以通过本项目进行搜索并返回准确答案。

### 架构概览

```
用户 → Claude Code 主代理 → Web Search Agent 子代理 → MCP Server → Bing 搜索
                                                                  ↓
                                              Chrome for Testing (页面渲染)
```

---

## 在其他项目中获得网络搜索能力

有两种方式可以让你的项目获得网络搜索能力：

### 方式一：作为 MCP Server 使用

这种方式适用于你想在自己的项目中直接使用搜索工具。

1. **安装依赖**
   ```bash
   cd /path/to/web-search-agent
   npm install
   npm run build
   ```

2. **配置 MCP Server**

   在你的项目目录下创建或编辑 `.claude/settings.json`：
   ```json
   {
     "mcpServers": {
       "web-search": {
         "command": "node",
         "args": ["/absolute/path/to/web-search-agent/build/index.js"]
       }
     }
   }
   ```

3. **使用工具**

   配置完成后，你可以在 Claude Code 中直接调用以下工具：
   - `web_search_bing`: 执行网络搜索
   - `read_webpage`: 读取网页内容

### 方式二：作为子代理使用（推荐）

这种方式会让所有项目都能使用网络搜索能力，更方便。

1. **复制子代理模板**

   将 `src/agents/web-search-agent.md` 复制到全局 agents 目录：
   ```bash
   mkdir -p ~/.claude/agents
   cp src/agents/web-search-agent.md ~/.claude/agents/
   ```

2. **在你的项目中配置 MCP Server**

   在你的项目目录下创建或编辑 `.claude/settings.json`：
   ```json
   {
     "mcpServers": {
       "web-search": {
         "command": "node",
         "args": ["/absolute/path/to/web-search-agent/build/index.js"]
       }
     }
   }
   ```

3. **使用子代理**

   在 Claude Code 中，当需要网络搜索时：
   - 直接提问，让主代理自动判断并调用子代理
   - 或使用 `/agent web-search-agent` 命令明确指定

---

## 功能特性

- **Bing 搜索**: 支持国内版和国际版 Bing 搜索
- **网页内容提取**: 自动清洗网页内容，返回干净的 Markdown 格式
- **智能子代理**: 自动完成"搜索-阅读-总结"闭环
- **结果缓存**: 避免重复抓取同一页面

## 工具说明

### web_search_bing

使用 Bing 搜索引擎执行网络搜索。

**参数**:
- `query` (string, 必需): 搜索关键词
- `num` (number, 可选): 返回结果数量，默认 10，最大 50
- `useInternational` (boolean, 可选): 是否使用 Bing 国际版，默认 false

**返回**:
```json
[
  {
    "title": "搜索结果标题",
    "url": "https://example.com",
    "snippet": "搜索结果摘要..."
  }
]
```

### read_webpage

访问指定 URL，提取并清洗页面正文内容。

**参数**:
- `url` (string, 必需): 要读取的网页 URL

**返回**:
```json
{
  "title": "网页标题",
  "markdown_content": "# 清洗后的 Markdown 内容"
}
```

## 子代理工作流程

Web Search Agent 子代理会自动执行以下步骤：

1. 分析用户问题，提取核心关键词
2. 使用 `web_search_bing` 进行搜索
3. 判断最相关的搜索结果
4. 使用 `read_webpage` 阅读相关页面
5. 整合信息，生成简洁答案
6. 在回答末尾列出引用来源

## 使用示例

### 示例 1：查询实时信息
```
你：Python 最新版本是多少？
→ [主代理自动调用 web-search-agent]
→ Python 的最新稳定版本是 3.13.0，发布于 2024 年 10 月。
   来源：https://www.python.org/downloads/
```

### 示例 2：复杂查询
```
你：对比一下最近的两款热门轻薄本，给出选购建议。
→ [子代理进行多轮搜索和阅读]
→ [返回对比表格和购买建议]
```

## 项目结构

```
web-search-agent/
├── src/
│   ├── index.ts           # MCP Server 入口
│   ├── agents/
│   │   └── web-search-agent.md  # 子代理模板
│   └── tools/
│       ├── webSearchBing.ts     # Bing 搜索工具
│       ├── readWebpage.ts       # 网页读取工具
│       └── cache.ts             # 缓存工具
├── build/                  # 编译输出目录
├── package.json
└── tsconfig.json
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 编译
npm run build

# 监听模式编译
npm run watch
```

## 性能优化

### 缓存机制
- **搜索结果缓存**：5 分钟，避免重复搜索
- **网页内容缓存**：10 分钟，避免重复抓取
- **自动清理**：每分钟自动清理过期缓存

### 超时控制
- **搜索超时**：15 秒，防止搜索卡死
- **页面加载超时**：20 秒，防止页面加载过慢
- **页面评估超时**：5 秒，防止内容提取卡死

### 子代理限制
- 最多搜索 10 次
- 最多阅读 30 个页面
- 避免陷入死循环

## 环境变量

- `CHROME_PATH`: Chrome for Testing 可执行文件路径（默认：`D:/app/chrome-win64/chrome.exe`）

## 技术栈

- **MCP SDK**: Model Context Protocol
- **Playwright**: 浏览器自动化
- **DOMPurify**: HTML 清洗
- **Turndown**: HTML 转 Markdown
- **TypeScript**: 类型安全

## 许可证

MIT
