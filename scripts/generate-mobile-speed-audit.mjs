import fs from 'fs/promises';
import path from 'path';
import { listHtmlRoutes, toFilePath, readFileSafe } from './lib/site-automation.mjs';

const routes = await listHtmlRoutes();
const findings = {
  totalRoutes: routes.length,
  missingViewport: [],
  nonDeferredScripts: [],
  oversizedInlineStyles: [],
  imagesWithoutAlt: [],
  tablesWithoutWrapperHint: []
};

for (const pathname of routes) {
  const html = await readFileSafe(toFilePath(pathname));
  if (!html) continue;
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) findings.missingViewport.push(pathname);
  const scripts = [...html.matchAll(/<script(?![^>]*type=["']application\/ld\+json["'])[^>]*src=["'][^"']+["'][^>]*>/ig)].map((m) => m[0]);
  for (const script of scripts) {
    if (!/\bdefer\b/i.test(script) && !/\basync\b/i.test(script)) findings.nonDeferredScripts.push(pathname);
  }
  const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/ig)].map((m) => m[1]);
  if (inlineStyles.some((css) => css.length > 5000)) findings.oversizedInlineStyles.push(pathname);
  const imgs = [...html.matchAll(/<img\b[^>]*>/ig)].map((m) => m[0]);
  if (imgs.some((img) => !/\balt=["'][^"']*["']/i.test(img))) findings.imagesWithoutAlt.push(pathname);
  if (/<table[\s>]/i.test(html) && !/table-wrap|overflow-x/i.test(html)) findings.tablesWithoutWrapperHint.push(pathname);
}

const topNonDeferred = findings.nonDeferredScripts.slice(0, 10);
const topInline = findings.oversizedInlineStyles.slice(0, 10);
const md = [
  '# 모바일·속도 점검 리포트',
  '',
  `- 생성 시각: ${new Date().toISOString()}`,
  `- 점검 라우트 수: ${findings.totalRoutes}`,
  '',
  '## 요약',
  '',
  `- viewport 누락: ${findings.missingViewport.length}`,
  `- defer/async 없는 외부 스크립트: ${findings.nonDeferredScripts.length}`,
  `- 큰 inline style: ${findings.oversizedInlineStyles.length}`,
  `- alt 없는 이미지: ${findings.imagesWithoutAlt.length}`,
  `- 표 래퍼 힌트 없음: ${findings.tablesWithoutWrapperHint.length}`,
  '',
  '## 우선 확인 항목',
  '',
  ...(topNonDeferred.length ? topNonDeferred.map((item) => `- 스크립트 로딩 점검: ${item}`) : ['- 스크립트 로딩 경고 없음']),
  ...(topInline.length ? topInline.map((item) => `- inline style 축소 검토: ${item}`) : ['- 큰 inline style 경고 없음'])
].join('\n');

await fs.mkdir(path.join(process.cwd(), 'docs'), { recursive: true });
await fs.writeFile(path.join(process.cwd(), 'docs/mobile-speed-audit-20260322.md'), `${md}\n`, 'utf8');
console.log('Mobile/speed audit generated.');
