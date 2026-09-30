const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
// 작은 클라이언트 경계만 포함한다. DB·엔진·비밀 설정은 브라우저에 포함하지 않는다.
const MODULES = [
  'src/client/learningFlowTransportContract.js',
  'src/client/learningSessionController.js',
  'src/client/httpLearningFlowTransport.js',
  'src/client/mobileSessionView.js',
  'mobile/previewTransport.js',
  'mobile/browserEntry.js',
];

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
  return outputDirectory;
}

if (require.main === module) console.log('모바일 화면 빌드 완료:', buildMobile());
module.exports = { buildMobile };
