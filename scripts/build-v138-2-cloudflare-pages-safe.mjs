import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
function run(label, script) {
  if (!fs.existsSync(script)) { console.error(`[V138.2 BUILD SAFE FAIL] missing ${script}`); process.exit(1); }
  const r = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (r.status !== 0) { console.error(`[V138.2 BUILD SAFE FAIL] ${label} exited with ${r.status}`); process.exit(r.status || 1); }
}
run('V137.2 safe base', 'scripts/build-v137-2-cloudflare-pages-safe.mjs');
run('V138 modern section radius dark route polish', 'scripts/generate-v138-modern-section-radius-dark-fix.mjs');
run('V138.1 cert href build hotfix', 'scripts/generate-v138-1-cert-href-hotfix.mjs');
run('V138.2 live header/text visibility fix', 'scripts/generate-v138-2-live-header-text-visibility-fix.mjs');
run('V138.2 verify', 'scripts/verify-v138-2-live-header-text-visibility-fix.mjs');
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/v138-2-cloudflare-build-safe-report.json', JSON.stringify({ok:true,version:'V138_2_LIVE_HEADER_TEXT_VISIBILITY_FIX',mode:'cloudflare-pages-safe-build',generatedAt:new Date().toISOString()}, null, 2));
fs.writeFileSync('build.txt', 'V138-2 LIVE HEADER TEXT VISIBILITY FIX BUILD SAFE PASS\n' + new Date().toISOString() + '\n');
console.log('[V138.2 BUILD SAFE PASS] live header/text visibility + modern rounded route polish');
