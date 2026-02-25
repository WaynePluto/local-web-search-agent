import { webSearchBing } from "./tools/webSearchBing.js";
import { readWebpage } from "./tools/readWebpage.js";

async function testCache() {
  console.log("=== 缓存测试 ===\n");

  const query = "Rust";
  const url = "https://www.example.com/";

  console.log("1. 首次搜索（应未命中缓存）");
  const start1 = Date.now();
  await webSearchBing(query, 3);
  const time1 = Date.now() - start1;
  console.log(`   耗时: ${time1}ms\n`);

  console.log("2. 第二次搜索相同内容（应命中缓存）");
  const start2 = Date.now();
  await webSearchBing(query, 3);
  const time2 = Date.now() - start2;
  console.log(`   耗时: ${time2}ms`);
  console.log(`   加速: ${((time1 - time2) / time1 * 100).toFixed(1)}%\n`);

  console.log("3. 首次读取网页（应未命中缓存）");
  const start3 = Date.now();
  await readWebpage(url);
  const time3 = Date.now() - start3;
  console.log(`   耗时: ${time3}ms\n`);

  console.log("4. 第二次读取相同网页（应命中缓存）");
  const start4 = Date.now();
  await readWebpage(url);
  const time4 = Date.now() - start4;
  console.log(`   耗时: ${time4}ms`);
  console.log(`   加速: ${((time3 - time4) / time3 * 100).toFixed(1)}%\n`);

  console.log("=== 缓存测试完成 ===");
  process.exit(0);
}

testCache().catch((error) => {
  console.error("测试失败:", error);
  process.exit(1);
});
