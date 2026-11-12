// 切换演示站的 DOM 版本。跨平台，不用环境变量。
const fs = require('fs');
const path = require('path');

const v = process.argv[2];
if (!['v1', 'v2', 'broken'].includes(v)) {
  console.error('用法: node demo-site/switch.js v1 | v2 | broken');
  process.exit(1);
}
fs.writeFileSync(path.join(__dirname, 'version.txt'), v + '\n');
if (v === 'broken') {
  console.log('已切换到 broken（故意改坏加购角标）。跑 npm test 应该红 1 条，并在 playwright-report/ 留下截图。');
} else {
  console.log(`已切换到 ${v}。现在跑 npm test —— 用例一个字都不改，应该照样全绿。`);
}
