const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
// 작은 클라이언트 경계만 포함한다. DB·엔진·비밀 설정은 브라우저에 포함하지 않는다.
const MODULES = [
  'src/client/learningFlowTransportContract.js',
  'src/client/learningSessionController.js',
  'src/client/httpLearningFlowTransport.js',
  'src/client/mobileSessionView.js',
  'src/client/languagePackService.js',
  'src/client/languagePackController.js',
  'src/client/languagePackView.js',
  'mobile/previewTransport.js',
  'mobile/previewLanguagePacks.js',
  'mobile/browserEntry.js',
];

function sourceVersion() {
  try {
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const changed = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return `${sha}${changed ? ' (작업 파일 변경 있음)' : ''}`;
  } catch {
    return '미확인';
  }
}

function standalonePreview(runtime) {
  const script = runtime.replace(/<\/script/gi, '<\\/script');
  const styles = fs.readFileSync(path.join(ROOT, 'mobile/styles.css'), 'utf8');
  const icon = fs.readFileSync(path.join(ROOT, 'mobile/icon.svg')).toString('base64');
  const guide = fs.readFileSync(path.join(ROOT, 'mobile/previewGuide.html'), 'utf8');
  const digest = (text) => createHash('sha256').update(text).digest('base64');
  const policy = `default-src 'none'; script-src 'sha256-${digest(script)}'; style-src 'sha256-${digest(styles)}'; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;
  return fs.readFileSync(path.join(ROOT, 'mobile/index.html'), 'utf8')
    .replace('<html lang="ko">', '<html lang="ko" data-lle-preview="standalone">')
    .replace('<meta charset="utf-8">', `<meta charset="utf-8">\n  <meta http-equiv="Content-Security-Policy" content="${policy}">\n  <meta name="lle-source-commit" content="${sourceVersion()}">`)
    .replace('<title>LLE — 배운 표현이 내 말이 되도록</title>', '<title>LLE — 다운로드용 화면 미리보기</title>')
    .replace('<link rel="icon" href="./icon.svg" type="image/svg+xml">', `<link rel="icon" href="data:image/svg+xml;base64,${icon}" type="image/svg+xml">`)
    .replace('<link rel="stylesheet" href="./styles.css">', `<style>${styles}</style>`)
    .replace('  <script src="./app.js" defer></script>\n', '')
    .replace('href="./" aria-label="LLE 시작 화면"', 'href="#learning-root" aria-label="학습 화면으로 이동"')
    .replace('href="./?preview=1"', 'href="#preview-controls"')
    .replace('    </form>', `    </form>\n${guide}`)
    .replace('</body>', `<script>${script}</script>\n</body>`);
}

function buildMobile(outputDirectory = path.join(ROOT, 'mobile', 'dist')) {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const factories = MODULES.map((id) => `${JSON.stringify(id)}: function(module, exports, require) {\n${fs.readFileSync(path.join(ROOT, id), 'utf8')}\n}`).join(',\n');
  const runtime = `(() => {
    const factories = {${factories}};
    const cache = Object.create(null);
    function resolve(from, request) {
      if (!request.startsWith('.')) throw new Error('허용되지 않은 브라우저 의존성');
      const parts = from.split('/'); parts.pop();
      for (const part of request.split('/')) {
        if (part === '..') parts.pop();
        else if (part !== '.') parts.push(part);
      }
      return parts.join('/') + '.js';
    }
    function load(id) {
      if (!Object.hasOwn(factories, id)) throw new Error('브라우저 모듈을 찾을 수 없습니다');
      if (cache[id]) return cache[id].exports;
      const module = { exports: {} }; cache[id] = module;
      factories[id](module, module.exports, (request) => load(resolve(id, request)));
      return module.exports;
    }
    load('mobile/browserEntry.js');
  })();\n`;
  fs.writeFileSync(path.join(outputDirectory, 'app.js'), runtime);
  for (const file of ['index.html', 'styles.css', 'icon.svg']) {
    fs.copyFileSync(path.join(ROOT, 'mobile', file), path.join(outputDirectory, file));
  }
  fs.writeFileSync(path.join(outputDirectory, 'lle-mobile-preview.html'), standalonePreview(runtime));
  return outputDirectory;
}

if (require.main === module) console.log('모바일 화면 빌드 완료:', buildMobile());
module.exports = { buildMobile };
