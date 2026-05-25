import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const MARKER='V85_4_BLOG_POST_SHELL_LOCK_ACTIVE';
const file=path.join(ROOT,'assets/data/v85-4-blog-post-shell-targets.json');
const report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{targets:[]};
const targets=report.targets||[]; const errors=[];
if(targets.length!==50) errors.push(`expected 50 신규 SEO posts, found ${targets.length}`);
const forbidden=['class="rust-header"','class="rust-nav"','class="rust-mobile-nav"','페이지 하단의 내부 링크를 따라가면','관련 글과 다음 확인 루트','도구 열기</a>','상담 연결</a>'];
for(const rel of targets){const p=path.join(ROOT,rel); if(!fs.existsSync(p)){errors.push(`missing ${rel}`); continue;} const txt=fs.readFileSync(p,'utf8'); for(const need of [MARKER,'class="rust-global-header"','class="rust-header-inner"','class="rust-desktop-nav"','class="rust-bottom-nav"','v85-4-blog-post-shell-lock.css','v85-4-seo-post-shell']) if(!txt.includes(need)) errors.push(`${rel}: missing ${need}`); for(const bad of forbidden) if(txt.includes(bad)) errors.push(`${rel}: forbidden ${bad}`);}
if(errors.length){console.error('[V85-4 verify failed]'); for(const e of errors.slice(0,100)) console.error('-',e); if(errors.length>100) console.error(`... ${errors.length-100} more`); process.exit(1);} console.log(`[V85-4 verify] ok targets=${targets.length}`);
