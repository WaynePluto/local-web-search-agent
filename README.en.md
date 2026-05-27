[English](./README.en.md) | [中文](./README.md)

# Local Web Search Agent

An MCP Server and subagent template that gives Claude Code web search capabilities.

## Overview

This project provides web search support for Claude Code through MCP (Model Context Protocol). When Claude Code needs real-time information or content from the web, it can search and return concise, grounded answers through this project.

### Architecture

```
User -> Claude Code main agent -> local-web-search-agent subagent -> MCP Server -> Bing Search
                                                                                 |
                                                                                 v
                                                                  Chrome for Testing (page rendering)
```

---

## Add Web Search To Other Projects

There are two ways to add web search capabilities to your project.

### Option 1: Use It As An MCP Server

This option is suitable when you want to use the search tools directly inside your own project.

1. **Install dependencies**

   ```bash
   cd /path/to/local-web-search-agent
   npm install
   npm run build
   ```

2. **Configure the MCP server**

   Create or edit `.claude/settings.json` in your project:

   ```json
   {
     "mcpServers": {
       "local-web-search": {
         "command": "node",
         "args": ["/absolute/path/to/local-web-search-agent/build/index.js"]
       }
     }
   }
   ```

3. **Use the tools**

   After configuration, you can directly call these tools in Claude Code:
   - `web_search_bing`: run a web search
   - `read_webpage`: read and extract web page content
   - `get_current_time`: get current date and time information

### Option 2: Use It As A Subagent (Recommended)

This option makes web search available across projects and is usually more convenient.

1. **Copy the subagent template**

   Copy `src/agents/local-web-search-agent.md` into your global agents directory:

   ```bash
   mkdir -p ~/.claude/agents
   cp src/agents/local-web-search-agent.md ~/.claude/agents/
   ```

2. **Configure the MCP server in your project**

   Create or edit `.claude/settings.json` in your project:

   ```json
   {
     "mcpServers": {
       "local-web-search": {
         "command": "node",
         "args": ["/absolute/path/to/local-web-search-agent/build/index.js"]
       }
     }
   }
   ```

3. **Use the subagent**

   In Claude Code, when web access is needed:
   - Ask normally and let the main agent decide whether to invoke the subagent
   - Or explicitly use `/agent local-web-search-agent`

---

## Features

- **Bing Search**: Supports both Bing China and Bing International
- **Web Page Extraction**: Cleans page content and returns structured Markdown
- **Autonomous Subagent**: Completes the full search, read, and summarize loop
- **Result Caching**: Avoids fetching the same content repeatedly
- **Smart Search Skill**: Provides a more structured, multi-source search workflow

## Smart Search Skill

This project includes a skill called `smart-search`, designed for cases where you need high-confidence, structured search results.

### Skill Features

- **Multi-source verification**: Cross-checks information from multiple official or high-trust sources
- **Structured output**: Returns the core answer, supporting links, and confidence notes
- **Adaptive search strategy**: Optimizes keywords based on the type of request
- **Freshness checks**: Validates when the information was published or updated

### How To Use It

1. **Copy the skill template**

   Copy `src/skills/smart-search/SKILL.md` into your global skills directory:

   ```bash
   mkdir -p ~/.claude/skills/smart-search
   cp src/skills/smart-search/SKILL.md ~/.claude/skills/smart-search/
   ```

   **Note**: The correct skill directory structure is `~/.claude/skills/<skill-name>/SKILL.md`

2. **Use it in Claude Code**

   When you need reliable web-backed answers:
   - Ask normally and let Claude decide
   - Or explicitly use `/smart-search`

### Common Use Cases

| Scenario                       | Example                                      |
| ------------------------------ | -------------------------------------------- |
| Software version lookup        | "What is the latest LayaAir version?"        |
| Technical documentation lookup | "What are the new features in React 19?"     |
| Troubleshooting                | "How do I fix pip install errors in Python?" |
| Recent updates                 | "When was Claude 4 released?"                |

### Output Format

The smart search skill returns structured results that include:

- **Core answer**: A direct answer to the question
- **Sources**: Multiple trusted links and supporting details
- **Confidence assessment**: Notes about official confirmation, cross-source agreement, and recency

## Tool Reference

### web_search_bing

Uses Bing Search to perform a web search.

**Parameters**:

- `query` (string, required): Search keywords
- `num` (number, optional): Number of results to return, default `10`, maximum `50`
- `useInternational` (boolean, optional): Whether to use Bing International, default `false`

**Returns**:

```json
[
  {
    "title": "Search result title",
    "url": "https://example.com",
    "snippet": "Search result summary..."
  }
]
```

### read_webpage

Visits a URL, extracts the main content, and converts it into clean Markdown.

**Parameters**:

- `url` (string, required): The target page URL

**Returns**:

```json
{
  "title": "Page title",
  "markdown_content": "# Clean Markdown content"
}
```

### get_current_time

Returns current date and time information, including the current year, last year, and the year before last. Useful for time-sensitive searches.

**Parameters**: none

**Returns**:

```json
{
  "currentDateTime": "2026/2/26 10:30:00",
  "currentYear": 2026,
  "currentMonth": 2,
  "currentDay": 26,
  "lastYear": 2025,
  "yearBeforeLast": 2024,
  "isoDate": "2026-02-26T02:30:00.000Z"
}
```

## Subagent Workflow

The `local-web-search-agent` subagent typically performs the following steps:

1. Analyze the user request and extract the core search intent
2. Search with `web_search_bing`
3. Identify the most relevant results
4. Read selected pages with `read_webpage`
5. Combine the findings into a concise answer
6. List sources at the end of the response

## Examples

### Example 1: Real-time information lookup

```
You: What is the latest Python version?
-> [The main agent automatically invokes local-web-search-agent]
-> The latest stable Python release is 3.13.0, released in October 2024.
   Source: https://www.python.org/downloads/
```

### Example 2: Multi-step comparison

```
You: Compare two recent popular lightweight laptops and give me a buying recommendation.
-> [The subagent performs multiple searches and page reads]
-> [Returns a comparison table and recommendation]
```

## Project Structure

```
local-web-search-agent/
├── src/
│   ├── index.ts                    # MCP Server entry point
│   ├── agents/
│   │   └── local-web-search-agent.md   # Subagent template
│   ├── skills/
│   │   └── smart-search/
│   │       └── SKILL.md           # Smart search skill
│   └── tools/
│       ├── webSearchBing.ts       # Bing search tool
│       ├── readWebpage.ts         # Web page reading tool
│       ├── currentTime.ts         # Current time tool
│       └── cache.ts               # Cache tool
├── build/                         # Compiled output
├── package.json
└── tsconfig.json
```

## Development

```bash
# install dependencies
npm install

# development mode
npm run dev

# build
npm run build

# build in watch mode
npm run watch
```

## Performance

### Caching

- **Search result cache**: 5 minutes
- **Web page cache**: 10 minutes
- **Automatic cleanup**: every minute

### Timeouts

- **Search timeout**: 15 seconds
- **Page load timeout**: 20 seconds
- **Page evaluation timeout**: 5 seconds

### Subagent Limits

- Up to 10 searches
- Up to 30 page reads
- Avoids infinite search loops

## Environment Variable

- `CHROME_PATH`: Path to the Chrome for Testing executable (default: `D:/app/chrome-win64/chrome.exe`)

## Tech Stack

- **MCP SDK**: Model Context Protocol
- **Playwright**: Browser automation
- **DOMPurify**: HTML sanitization
- **Turndown**: HTML to Markdown conversion
- **TypeScript**: Type safety

## Community Extension / Forks

The mainline project only provides a local Playwright + Bing search path and emphasizes a local browser workflow without requiring logins to external services.

If you need a remote API-based search path, such as Tavily, you can use the community fork below:

- [Tavily-FDE/autopr--fork-web-search-agent](https://github.com/Tavily-FDE/autopr--fork-web-search-agent)
  Adds a `web_search_tavily` tool on top of the local Bing search flow and uses the Tavily API. You need to configure the `TAVILY_API_KEY` environment variable. This is suitable if you prefer a faster and more stable API-based search flow and are willing to use a Tavily account.

## License

MIT
