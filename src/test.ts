import { webSearchBing } from "./tools/webSearchBing.js";
import { readWebpage } from "./tools/readWebpage.js";

async function test() {
  console.log("=== 测试 1: Bing 搜索 ===");
  try {
    const searchResults = await webSearchBing("TypeScript", 5);
    console.log(`找到 ${searchResults.length} 条结果:`);
    searchResults.slice(0, 3).forEach((result, i) => {
      console.log(`\n${i + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   摘要: ${result.snippet.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error("搜索测试失败:", error);
  }

  console.log("\n=== 测试 2: 读取网页 ===");
  try {
    // 使用搜索结果的第一个 URL 进行测试
    const searchResults = await webSearchBing("example.com", 1);
    if (searchResults.length > 0) {
      const url = "https://www.example.com/";
      const content = await readWebpage(url);
      console.log(`标题: ${content.title}`);
      console.log(`URL: ${content.url}`);
      console.log(`内容预览:\n${content.markdown.substring(0, 300)}...`);
    }
  } catch (error) {
    console.error("网页读取测试失败:", error);
  }

  console.log("\n=== 测试完成 ===");
  process.exit(0);
}

test().catch((error) => {
  console.error("测试失败:", error);
  process.exit(1);
});
