import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script) {
  if (!fs.existsSync(script)) { console.error(`[V138 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (r.status !== 0) { console.error(`[V138 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status || 1); }
}
run('V137.2 safe base', 'scripts/build-v137-2-cloudflare-pages-safe.mjs');
run('V138 modern section radius dark route polish', 'scripts/generate-v138-modern-section-radius-dark-fix.mjs');
run('V138 verify', 'scripts/verify-v138-modern-section-radius-dark-fix.mjs');
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/v138-cloudflare-build-safe-report.json', JSON.stringify({ok:true,version:'V138_MODERN_SECTION_RADIUS_SPORTS_SEARCH_DARK_TONE_FIX',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()}, null, 2));
fs.writeFileSync('build.txt', 'V138 MODERN SECTION RADIUS / SPORTS SEARCH DARK TONE FIX BUILD SAFE PASS\n' + new Date().toISOString() + '\n');
console.log('[V138 BUILD SAFE PASS] modern section radius + sports/search dark tone fix');
