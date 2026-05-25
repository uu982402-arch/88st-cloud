import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V93_TOOLS_USABILITY_PASS_ACTIVE';
const fail = (msg) => { throw new Error(`[V93 verify] ${msg}`); };
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const tools = read('tools/index.html');
if (!tools.includes(MARKER)) fail('tools page marker missing');
if (!tools.includes('/assets/css/v93-tools-usability-pass.css')) fail('V93 css not linked');
if (!tools.includes('/assets/js/v93-tools-usability-pass.js')) fail('V93 js not linked');
if (!tools.includes('data-v93-tools-usability="true"')) fail('tools body data marker missing');
if ((tools.match(/data-open-tool=/g)||[]).length !== 8) fail('expected 8 tool cards');
if (!tools.includes('data-v73-modal')) fail('tool modal missing');
if (tools.includes('RUST MOTION HUB')) fail('forbidden main motion title leaked into tools page');

const css = read('assets/css/v93-tools-usability-pass.css');
for (const token of ['.v93-value-chip','min-height:52px','is-pulsing','.v73-mobile-nav','display:none!important']) {
  if (!css.includes(token)) fail(`css token missing: ${token}`);
}
const js = read('assets/js/v93-tools-usability-pass.js');
for (const token of ['tool_result_copy','telegram_open','tool_open','MutationObserver','RUST_V93_TOOLS_USABILITY']) {
  if (!js.includes(token)) fail(`js token missing: ${token}`);
}
const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.includes('node scripts/generate-v93-tools-usability-pass.mjs')) fail('build chain missing V93 generator');
if (pkg.scripts.verify !== 'node scripts/verify-v93-tools-usability-pass.mjs') fail('verify script not set to V93');
console.log('[V93 verify] ok');
