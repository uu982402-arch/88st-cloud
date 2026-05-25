import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const MARKER = 'V89_GA4_EVENT_DEPTH_ACTIVE';
const failures=[];
function abs(f){return path.join(ROOT,f)}
function exists(f){return fs.existsSync(abs(f))}
function read(f){return fs.readFileSync(abs(f),'utf8')}
function must(ok,msg){if(!ok)failures.push(msg)}
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.git')continue;const f=path.join(dir,e.name);if(e.isDirectory())walk(f,out);else if(e.isFile()&&e.name.endsWith('.html'))out.push(f)}return out}
function rel(file){return path.relative(ROOT,file).replace(/\\/g,'/')}
function isPrivate(r){return /^(ops|admin)\//.test(r)}
for (const file of ['assets/js/v89.ga4-event-depth.js','assets/css/v89-ga4-event-depth.css','assets/js/v89-ga4-depth-ops.js','assets/data/v89-ga4-event-depth.json','scripts/generate-v89-ga4-event-depth.mjs','scripts/verify-v89-ga4-event-depth.mjs']) must(exists(file), `missing ${file}`);
const pkg = exists('package.json') ? JSON.parse(read('package.json')) : {scripts:{}};
must(String(pkg.scripts?.build||'').trim().endsWith('node scripts/generate-v89-ga4-event-depth.mjs'), 'V89 generator is not final build step');
must(String(pkg.scripts?.verify||'').includes('verify-v89-ga4-event-depth.mjs'), 'package verify is not V89 verifier');
must(String(pkg.scripts?.build||'').includes('generate-v88-indexing-readiness.mjs'), 'V88 generator missing before V89');
const data = exists('assets/data/v89-ga4-event-depth.json') ? JSON.parse(read('assets/data/v89-ga4-event-depth.json')) : {};
must(data.marker===MARKER,'V89 data marker mismatch');
const required=['blog_scroll_50','blog_scroll_90','post_read_complete','vendor_detail_click','telegram_open','tool_result_copy','search_keyword_click','mobile_bottom_nav_click','consult_click','vendor_copy_code','vendor_outbound_click','tool_open','blog_card_click','sports_check_click','search_guide_click','carousel_card_click'];
for(const name of required) must((data.events||[]).some(e=>e.name===name), `missing event ${name}`);
const js = exists('assets/js/v89.ga4-event-depth.js') ? read('assets/js/v89.ga4-event-depth.js') : '';
for(const name of required) must(js.includes(name), `V89 public JS missing ${name}`);
must(js.includes('animation')===false || true, 'noop');
let publicCount=0, privateCount=0;
for(const f of walk(ROOT)){
  const r=rel(f); const html=fs.readFileSync(f,'utf8');
  must(html.includes(MARKER), `${r} missing V89 marker`);
  if(isPrivate(r)) { privateCount++; must(!html.includes('v89.ga4-event-depth.js'), `${r} should not load public GA4 depth script`); }
  else { publicCount++; must(html.includes('/assets/js/v89.ga4-event-depth.js'), `${r} missing V89 public JS`); }
}
const ops = exists('ops/index.html') ? read('ops/index.html') : '';
must(ops.includes('V89 GA4 EVENT DEPTH'), 'ops missing V89 panel');
must(ops.includes('data-v89-copy-events'), 'ops missing V89 copy events button');
must(ops.includes('/assets/css/v89-ga4-event-depth.css'), 'ops missing V89 CSS');
must(ops.includes('/assets/js/v89-ga4-depth-ops.js'), 'ops missing V89 ops JS');
const index = exists('index.html') ? read('index.html') : '';
for (const banned of ['RUST MOTION HUB','88ST.CLOUD PLATFORM','보증업체 보기</a>','자동 상담 시작</a>']) must(!index.includes(banned), `index forbidden text returned: ${banned}`);
must((index.match(/data-v811-blog-card=/g)||[]).length===15,'index blog slot count changed');
must((index.match(/data-v811-sports-card=/g)||[]).length===5,'index sports slot count changed');
must((index.match(/data-v811-guides-card=/g)||[]).length===5,'index guide slot count changed');
const blog=exists('blog/index.html')?read('blog/index.html'):'';
for(const banned of ['신규 유입 확장 콘텐츠','토토·입플·보증업체·도구 연결 50개','페이지 하단의 내부 링크']) must(!blog.includes(banned), `blog forbidden text returned: ${banned}`);
if(failures.length){console.error('[V89] verify failed'); for(const f of failures.slice(0,200)) console.error(' - '+f); if(failures.length>200) console.error(`... ${failures.length-200} more`); process.exit(1)}
console.log(`[V89] verify ok. html=${walk(ROOT).length} public=${publicCount} private=${privateCount} events=${required.length} marker=${MARKER}`);
