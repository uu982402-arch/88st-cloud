import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const stamp = new Date().toISOString();
const compact = stamp.replace(/[-:.TZ]/g, '').slice(0, 14);
const version = `static-seo-intelligence-v31-${compact}`;

const buildTxt = resolve(process.cwd(), 'build.txt');
mkdirSync(dirname(buildTxt), { recursive: true });
writeFileSync(buildTxt, `build=${stamp}\nversion=${version}\ncache=${compact}\n`, 'utf8');

const buildJs = resolve(process.cwd(), 'assets/js/build.ver.js');
mkdirSync(dirname(buildJs), { recursive: true });
writeFileSync(buildJs, `window.__BUILD_VER__ = "${version}";\nwindow.__BUILD_TIME__ = "${stamp}";\nwindow.__CACHE_BUSTER__ = "${compact}";\nwindow.__CONSULT_BOT__ = "@TRS999_bot";\n`, 'utf8');

console.log(`Build shim complete: ${buildTxt}`);
console.log(`Build version refreshed: ${version}`);
