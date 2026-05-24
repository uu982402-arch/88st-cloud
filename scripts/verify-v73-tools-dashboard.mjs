import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const htmlPath = path.join(ROOT, 'tools', 'index.html');
const cssPath = path.join(ROOT, 'assets', 'css', 'v73.tools-dashboard.css');
const jsPath = path.join(ROOT, 'assets', 'js', 'v73.tools-dashboard.js');
const errors = [];

function mustFile(file, label){ if(!fs.existsSync(file)) errors.push(`${label} missing: ${file}`); }
mustFile(htmlPath, 'tools html');
mustFile(cssPath, 'tools css');
mustFile(jsPath, 'tools js');

if(fs.existsSync(htmlPath)){
  const html = fs.readFileSync(htmlPath, 'utf8');
  const required = [
    'V73_TOOLS_DASHBOARD_ACTIVE',
    'v73.tools-dashboard.css',
    'v73.tools-dashboard.js',
    'data-v73-tools-grid',
    'data-v73-modal',
    '주소 확인',
    '가입코드 확인',
    '보너스 실수령',
    '롤링 조건',
    '배당 마진',
    '기대값 계산',
    '스포츠 분석',
    '이벤트 조건'
  ];
  for(const token of required) if(!html.includes(token)) errors.push(`tools html missing token: ${token}`);
  const banned = ['도구 허브', 'ANALYTICS TOOLS', '<h1'];
  for(const token of banned) if(html.includes(token)) errors.push(`tools html still contains banned token: ${token}`);
  const cardCount = (html.match(/data-tool-id=/g) || []).length;
  if(cardCount !== 8) errors.push(`expected 8 tool cards, got ${cardCount}`);
}

if(fs.existsSync(cssPath)){
  const css = fs.readFileSync(cssPath, 'utf8');
  for(const token of ['backdrop-filter', 'grid-template-columns:repeat(4', '@media(max-width:720px)', 'grid-template-columns:repeat(2', 'Premium'].filter(Boolean)) {
    if(token === 'Premium') continue;
    if(!css.includes(token)) errors.push(`tools css missing token: ${token}`);
  }
}

if(fs.existsSync(jsPath)){
  const js = fs.readFileSync(jsPath, 'utf8');
  for(const token of ['localStorage', 'data-open-tool', 'data-v73-copy', 'data-v73-telegram', 'type===\'bonus\'', 'type===\'rolling\'']) {
    if(!js.includes(token)) errors.push(`tools js missing token: ${token}`);
  }
}

if(errors.length){
  console.error('[V73 tools verify failed]');
  for(const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log('V73 tools dashboard verify passed');
