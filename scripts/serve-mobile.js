const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { buildMobile } = require('./build-mobile');

const ASSETS = Object.freeze({
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/icon.svg': ['icon.svg', 'image/svg+xml'],
});

function createMobileServer({ directory = path.resolve(__dirname, '../mobile/dist') } = {}) {
  return http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('이 실행기는 화면 파일만 제공합니다.');
      return;
    }
    let pathname;
    try {
      pathname = new URL(request.url, 'http://localhost').pathname;
    } catch {
      response.writeHead(400);
      response.end();
      return;
    }
    if (!Object.hasOwn(ASSETS, pathname)) {
      response.writeHead(404);
      response.end('페이지를 찾지 못했어요.');
      return;
    }
    const [file, contentType] = ASSETS[pathname];
    try {
      const content = await fs.readFile(path.join(directory, file));
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch {
      response.writeHead(503);
      response.end('화면 파일을 준비하지 못했어요.');
    }
  });
}

if (require.main === module) {
  buildMobile();
  const port = Number(process.env.LLE_MOBILE_PORT || 4173);
  const host = process.env.LLE_MOBILE_HOST || '127.0.0.1';
  const server = createMobileServer();
  server.on('error', () => { console.error('모바일 화면 실행에 실패했습니다.'); process.exitCode = 1; });
  server.listen(port, host, () => {
    console.log(`모바일 화면: http://${host}:${server.address().port}`);
    console.log(`명시적 미리보기: http://${host}:${server.address().port}/?preview=1`);
  });
}

module.exports = { createMobileServer };
