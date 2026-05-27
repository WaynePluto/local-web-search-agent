# Web Search Agent - 网络搜索指令

## 网络搜索能力

本项目已配置以下搜索能力：

1. **MCP 工具**（推荐用于简单查询）：`mcp__web-search__web_search_bing`、`WebSearch`
2. **`local-web-search-agent` 子代理**（用于复杂研究任务）

## 使用策略

### 优先直接使用 MCP 工具

对于**简单、直接**的查询，直接调用 MCP 工具：

```
✅ 直接查询天气、股价、定义、单一答案
✅ 快速事实核查（人名、地名、日期）
✅ "搜索 X" 这种单次查询
✅ 最新版本号、发布日期等

示例：
→ mcp__web-search__web_search_bing(query="郑州天气 明天")
→ WebSearch(query="Python 最新版本")
```

### 使用 local-web-search-agent 子代理

对于**复杂、多步骤**的研究任务，使用子代理：

```
✅ 需要多轮搜索、对比分析
✅ 需要阅读多个网页并综合信息
✅ 开放式探索（"了解 X 的全面信息"）
✅ 需要跨多个来源深入研究

示例：
→ Task(subagent_type="local-web-search-agent", prompt="研究并对比各大云服务商的价格")
→ Task(subagent_type="local-web-search-agent", prompt="深入了解 Rust 语言的发展历史和生态系统")
```

## 不要联网的情况

- 编程、代码问题（使用本地知识）
- 数学计算
- 逻辑推理
- 项目内的文件操作
