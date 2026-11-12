// 零依赖的本地演示站点。只用 Node 内置模块，不需要 npm install 就能起。
// 关键：每次请求都重新读 version.txt，所以切换 v1/v2 不用重启服务。
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VERSION_FILE = path.join(ROOT, 'version.txt');
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function currentVersion() {
  try {
    const v = fs.readFileSync(VERSION_FILE, 'utf8').trim();
    return ['v1', 'v2', 'broken'].includes(v) ? v : 'v1';
  } catch (e) {
    return 'v1';
  }
}

http
  .createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch (e) {
      res.writeHead(400);
      res.end('bad request');
      return;
    }
    if (urlPath === '' || urlPath === '/') urlPath = '/index.html';
    if (urlPath.includes('..')) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }

    const version = currentVersion();
    const file = path.join(ROOT, version, urlPath);
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404');
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log(`demo site ready: http://127.0.0.1:${PORT} (active=${currentVersion()})`);
  });
