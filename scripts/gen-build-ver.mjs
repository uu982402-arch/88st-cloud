import { writeFileSync, mkdirSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';

const stamp = new Date().toISOString();
const compact = stamp.replace(/[-:.TZ]/g, '').slice(0, 14);
const version = `static-growth-conversion-v62-${compact}`;

function countFiles(pattern) {
  let n = 0;
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (['node_modules','.git','__MACOSX'].includes(name)) continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (pattern.test(p)) n++;
    }
  }
  walk(process.cwd());
  return n;
}

const htmlCount = countFiles(/\.html$/);
let sitemapCount = 0;
try {
  const sitemap = readFileSync(resolve(process.cwd(), 'sitemap.xml'), 'utf8');
  sitemapCount = (sitemap.match(/<loc>/g) || []).length;
} catch {}

const buildTxt = resolve(process.cwd(), 'build.txt');
mkdirSync(dirname(buildTxt), { recursive: true });
writeFileSync(buildTxt, [
  `build=${stamp}`,
  `version=${version}`,
  `cache=${compact}`,
  `html=${htmlCount}`,
  `sitemap=${sitemapCount}`,
  `worker=safe-mode`,
  `consultBot=@TRS999_bot`
].join('\n') + '\n', 'utf8');

const buildJs = resolve(process.cwd(), 'assets/js/build.ver.js');
mkdirSync(dirname(buildJs), { recursive: true });
writeFileSync(buildJs, [
  `window.__BUILD_VER__ = "${version}";`,
  `window.__BUILD_TIME__ = "${stamp}";`,
  `window.__CACHE_BUSTER__ = "${compact}";`,
  `window.__WORKER_MODE__ = "safe";`,
  `window.__CONSULT_BOT__ = "@TRS999_bot";`
].join('\n') + '\n', 'utf8');

console.log(`Build version refreshed: ${version}`);
