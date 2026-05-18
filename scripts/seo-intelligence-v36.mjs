#!/usr/bin/env node
/* V36 Static Growth & Conversion Engine / V43 Comprehensive Quality Upgrade
   - strict SEO meta/canonical/schema
   - sitemap/robots generation
   - related links + topic hubs; blog detail conversion CTAs removed; V43 quality guards
   - provider JSON aware ordering and links
*/
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DOMAIN = "https://88st.cloud";
const VERSION = "static-growth-conversion-v44-20260518";
const TODAY = "2026-05-17";
const BOT_URL = "https://t.me/TRS999_bot";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (["node_modules", ".git", "__MACOSX"].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
function rel(p) { return path.relative(ROOT, p).replaceAll(path.sep, "/"); }
function routeFor(r) {
  if (r === "index.html") return "/";
  if (r.endsWith("/index.html")) return "/" + r.slice(0, -10);
  return "/" + r;
}
function strip(s) { return String(s || "").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function esc(s) { return String(s || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function cleanTitle(s) { return strip(s).replace(/\s+\|\s+88ST\.Cloud.*$/i, "").slice(0, 80); }
function titleFromPath(r) {
  const base = path.basename(r, ".html") === "index" ? path.basename(path.dirname(r)) : path.basename(r, ".html");
  return base.replace(/[-_]/g, " ").replace(/\b\w/g, m => m.toUpperCase());
}
function classify(r) {
  if (r === "index.html") return "home";
  if (r.startsWith("admin/") || r.startsWith("ops/") || r.startsWith("api/")) return "noindex";
  if (r === "blog/index.html") return "blog_hub";
  if (r.startsWith("blog/page/") && r.endsWith(".html")) return "blog_hub";
  if (r.startsWith("blog/") && r.endsWith(".html")) return "blog_article";
  if (r === "search-guides/index.html") return "search_hub";
  if (r.startsWith("search-guides/") && r.endsWith(".html")) return "search_guide";
  if (r === "faq/index.html") return "faq_hub";
  if (r.startsWith("faq/") && r.endsWith(".html")) return "faq";
  if (r.startsWith("provider-updates/") && r.endsWith(".html")) return "provider_update";
  if (r === "guaranteed/index.html") return "guaranteed";
  if (r === "tools/index.html") return "tools_hub";
  if (r.startsWith("tools/") && r.endsWith(".html")) return "tool";
  if (r === "consult/index.html") return "consult";
  if (r.startsWith("consult-result/") && r.endsWith(".html")) return "consult_result";
  if (r.startsWith("consult-motives/") && r.endsWith(".html")) return "consult_motive";
  if (r.startsWith("consult/") && r.endsWith(".html")) return "consult_detail";
  if (r.startsWith("sports-check/") && r.endsWith(".html")) return "sports";
  return "webpage";
}
function rawTitle(txt, r) {
  const m = txt.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return cleanTitle(m && m[1]) || titleFromPath(r);
}
function rawDesc(txt, title) {
  const meta = txt.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  let d = strip(meta && meta[1]);
  if (!d) {
    const p = txt.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    d = strip(p && p[1]);
  }
  if (!d) d = `${title} 정보를 코드, 공식주소, 조건 확인 기준으로 정리했습니다.`;
  return d;
}
function titleTemplate(page) {
  const base = cleanTitle(page.baseTitle || page.title || titleFromPath(page.rel));
  const byKind = {
    home: "Team RUST MAIN | 88ST.Cloud",
    blog_hub: "블로그 | 코드·주소·조건 확인 가이드",
    blog_article: `${base} | 확인 가이드`,
    search_hub: "검색 가이드 | 공식주소·조건 확인",
    search_guide: `${base} | 공식주소·조건 확인`,
    faq_hub: "FAQ | 상담 전 자주 묻는 질문",
    faq: `${base} | FAQ`,
    provider_update: `${base} | 업체 변경 이력`,
    guaranteed: "RUST 에이전시 보증 업체",
    tools_hub: "도구 | 조건·코드·문의 문구 확인",
    tool: `${base} | 확인 도구`,
    consult: "상담센터 | 자동화 상담봇 연결",
    consult_result: `${base} | 상담 전 확인`,
    consult_motive: `${base} | 상담 명분 정리`,
    sports: `${base} | 조건 확인`,
    webpage: `${base} | 88ST.Cloud`
  };
  let t = byKind[page.kind] || byKind.webpage;
  return t.length > 62 ? t.slice(0, 59).trim() + "..." : t;
}
function descTemplate(page) {
  let d = strip(page.rawDescription || "");
  if (page.kind === "home") d = "Team RUST MAIN 기준의 메인 화면입니다. 불필요한 부제와 홍보 박스를 줄이고 핵심 확인 루트만 간결하게 정리했습니다.";
  if (page.kind === "guaranteed") d = "RUST 에이전시 보증 업체의 코드 확인, 도메인 바로가기, 상담 연결을 카드 중심으로 빠르게 확인할 수 있도록 정리한 공식 안내 페이지입니다.";
  if (page.kind === "consult") d = "고객센터 페이지입니다. 복잡한 안내 섹션을 줄이고 텔레그램 상담센터로 바로 이동하는 단일 CTA 흐름만 제공하도록 정리한 상담 연결 페이지입니다.";
  if (!d || d.length < 80) d = `${cleanTitle(page.baseTitle)} 관련 내용을 코드, 공식주소, 이벤트 조건, 출금 전 확인 흐름으로 정리했습니다.`;
  const legacyPattern = new RegExp([
    "@" + "seo" + "a69",
    "seo" + "a69",
    "odds" + "88st",
    "\\uBD84\\uC11D\\uBD07",
    "\\uC2A4\\uD3EC\\uCE20\\s*\\uBC30\\uB2F9\\uBD84\\uC11D",
    "\\uCF54\\uC778\\s*\\uD604\\uBB3C"
  ].join("|"), "gi");
  d = d.replace(legacyPattern, "").replace(/\s+/g, " ").trim();
  if (d.length < 80) d += " 이용 전 필요한 확인 항목과 관련 가이드를 함께 볼 수 있습니다.";
  if (d.length > 150) d = d.slice(0, 147).trim() + "...";
  return d;
}
function words(text) {
  let t = String(text || "").toLowerCase();
  const add = [["출금","payout"],["주소","address"],["조건","condition"],["코드","code"],["보증","provider"],["상담","consult"],["페이백","payback"],["롤링","rolling"],["usdt","usdt"],["이벤트","event"],["도메인","domain"]];
  for (const [a,b] of add) if (t.includes(a.toLowerCase())) t += " " + b;
  return new Set((t.match(/[a-z0-9가-힣]{2,}/g) || []).filter(x => !["html","index","guide","basic","check","88st","cloud","com","https","www"].includes(x)));
}
function replaceOrInsert(txt, regex, tag) {
  if (regex.test(txt)) return txt.replace(regex, tag);
  return txt.replace("</head>", tag + "\n</head>");
}
function dropAndAppendHead(txt, regex, tag) {
  txt = txt.replace(regex, "\n");
  return txt.replace("</head>", tag + "\n</head>");
}
function upsertName(txt, name, content) {
  return dropAndAppendHead(txt, new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "ig"), `<meta name="${name}" content="${esc(content)}"/>`);
}
function upsertProp(txt, prop, content) {
  return dropAndAppendHead(txt, new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${prop}["'])[^>]*>`, "ig"), `<meta property="${prop}" content="${esc(content)}"/>`);
}
function upsertLink(txt, relName, href) {
  return dropAndAppendHead(txt, new RegExp(`<link\\b(?=[^>]*\\brel=["']${relName}["'])[^>]*>`, "ig"), `<link rel="${relName}" href="${esc(href)}"/>`);
}
function removeOld(txt) {
  const seoSection = /\n?<section\b(?=[^>]*class=["'][^"']*(?:v31-related-links|v31-topic-hubs|v36-growth-hubs|v36-related-links|v36-conversion-cta)[^"']*["'])[^>]*>[\s\S]*?<\/section>\s*/ig;
  return txt
    .replace(seoSection, "\n")
    .replace(/\n?<style\b(?=[^>]*id=["']v41-blog-visual-guard["'])[^>]*>[\s\S]*?<\/style>\s*/ig, "\n")
    .replace(/\n?<style\b(?=[^>]*id=["']v42-blog-visual-guard["'])[^>]*>[\s\S]*?<\/style>\s*/ig, "\n")
    .replace(/\n?<style\b(?=[^>]*id=["']v43-blog-visual-guard["'])[^>]*>[\s\S]*?<\/style>\s*/ig, "\n")
    .replace(/\n?<section\b(?=[^>]*class=["'][^"']*(?:v27-detail-support|blog-standard-cta-v16)[^"']*["'])[^>]*>[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<style\b(?=[^>]*id=["']v41-guaranteed-visual-guard["'])[^>]*>[\s\S]*?<\/style>\s*/ig, "\n")
    .replace(/\n?<script\b(?=[^>]*id=["']v41-guaranteed-interaction["'])[^>]*>[\s\S]*?<\/script>\s*/ig, "\n")
    .replace(/\n?<script\b(?=[^>]*data-v31-schema=)[^>]*>[\s\S]*?<\/script>\s*/ig, "\n")
    .replace(/\n?<script\b(?=[^>]*data-v36-schema=)[^>]*>[\s\S]*?<\/script>\s*/ig, "\n");
}
function breadcrumbSchema(page) {
  const parts = page.route.split("/").filter(Boolean);
  const crumbs = [{ "@type":"ListItem", "position":1, "name":"홈", "item":DOMAIN + "/" }];
  let acc = "";
  parts.forEach((part, i) => {
    acc += "/" + part;
    crumbs.push({ "@type":"ListItem", "position":i+2, "name":part.replace(".html","").replaceAll("-"," "), "item":DOMAIN+acc });
  });
  return { "@type":"BreadcrumbList", "itemListElement":crumbs };
}
function extractFaqEntities(txt, page) {
  const headings = [...txt.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)].map(m => strip(m[1])).filter(Boolean);
  const questions = headings.filter(h => h.includes("?") || /무엇|어떻게|왜|가능|되나요|인가요|확인/.test(h)).slice(0, 6);
  const arr = questions.length ? questions : [page.title];
  return arr.map(q => ({
    "@type":"Question",
    "name":q,
    "acceptedAnswer":{"@type":"Answer", "text":page.desc}
  }));
}

function headHints(txt) {
  const hints = [];
  if (!/<link\b(?=[^>]*rel=["']preconnect["'])(?=[^>]*href=["']https:\/\/t\.me["'])/i.test(txt)) hints.push('<link rel="preconnect" href="https://t.me" crossorigin/>');
  if (!/<link\b(?=[^>]*rel=["']preload["'])(?=[^>]*href=["']\/img\/logo-v24\.png["'])/i.test(txt)) hints.push('<link rel="preload" as="image" href="/img/logo-v24.png" imagesrcset="/img/logo-v24.png"/>');
  if (!hints.length) return txt;
  return txt.replace('</head>', hints.join('\n') + '\n</head>');
}

function schema(page, txt) {
  const graph = [
    { "@type":"Organization", "@id":DOMAIN+"/#organization", "name":"88ST.Cloud", "url":DOMAIN+"/", "logo":DOMAIN+"/img/logo-v24.png" },
    { "@type":"WebSite", "@id":DOMAIN+"/#website", "url":DOMAIN+"/", "name":"88ST.Cloud", "publisher":{"@id":DOMAIN+"/#organization"} },
    breadcrumbSchema(page)
  ];
  if (["blog_article","search_guide","provider_update"].includes(page.kind)) {
    graph.push({ "@type":"Article", "@id":DOMAIN+page.route+"#primary", "url":DOMAIN+page.route, "headline":page.title.slice(0,110), "description":page.desc, "image":DOMAIN+"/assets/img/v24/moonsafe-hero-v24.webp", "dateModified":TODAY, "author":{"@type":"Organization","name":"88ST.Cloud"}, "publisher":{"@id":DOMAIN+"/#organization"}, "mainEntityOfPage":DOMAIN+page.route });
  } else if (page.kind === "faq") {
    graph.push({ "@type":"FAQPage", "@id":DOMAIN+page.route+"#faq", "url":DOMAIN+page.route, "name":page.title, "mainEntity":extractFaqEntities(txt, page) });
  } else if (page.kind === "tool") {
    graph.push({ "@type":"SoftwareApplication", "@id":DOMAIN+page.route+"#tool", "name":page.title, "url":DOMAIN+page.route, "applicationCategory":"UtilitiesApplication", "operatingSystem":"Web", "description":page.desc });
  } else {
    graph.push({ "@type":"WebPage", "@id":DOMAIN+page.route+"#webpage", "url":DOMAIN+page.route, "name":page.title, "description":page.desc, "isPartOf":{"@id":DOMAIN+"/#website"} });
  }
  return `<script type="application/ld+json" data-v36-schema="primary">${JSON.stringify({ "@context":"https://schema.org", "@graph":graph })}</script>`;
}

const htmlFiles = walk(ROOT).filter(p => p.endsWith(".html"));
let pages = htmlFiles.map(file => {
  const r = rel(file);
  const txt = fs.readFileSync(file, "utf8");
  const kind = classify(r);
  const baseTitle = rawTitle(txt, r);
  return { file, rel:r, route:routeFor(r), kind, baseTitle, rawDescription:rawDesc(txt, baseTitle) };
});
pages = pages.map(p => ({ ...p, title:titleTemplate(p), desc:descTemplate(p) }));
// duplicate title/description correction
const titleCounts = new Map();
const descCounts = new Map();
for (const p of pages) {
  titleCounts.set(p.title, (titleCounts.get(p.title)||0)+1);
  descCounts.set(p.desc, (descCounts.get(p.desc)||0)+1);
}
for (const p of pages) {
  if (titleCounts.get(p.title) > 1 && p.kind !== "home") {
    const seg = p.route.split("/").filter(Boolean).slice(-2).join(" · ").replace(".html","");
    p.title = `${cleanTitle(p.baseTitle)} | ${seg}`.slice(0,62);
  }
  if (descCounts.get(p.desc) > 1 && p.kind !== "home") {
    p.desc = `${p.desc.replace(/\.\.\.$/,"")} (${p.route.split("/").filter(Boolean).slice(-1)[0].replace(".html","")})`;
    if (p.desc.length > 150) p.desc = p.desc.slice(0,147).trim()+"...";
  }
  p.keywords = words(p.title + " " + p.desc + " " + p.route);
}
const publicPages = pages.filter(p => p.kind !== "noindex" && !p.route.startsWith("/admin/") && !p.route.startsWith("/ops/"));
const routeSet = new Set(publicPages.map(p => p.route));

const topicLinks = {
  "출금": [["출금 전 문의 문구","/search-guides/payout-inquiry-template.html"],["출금 지연 체크","/search-guides/payout-delay-check.html"],["출금 전 확인","/consult-result/payout-before-check.html"]],
  "조건": [["도구","/tools/"],["이벤트 조건 확인","/consult-result/event-condition-check.html"],["첫충·롤링 확인","/search-guides/first-charge-rolling.html"]],
  "주소": [["공식주소 사칭 확인","/search-guides/official-address-impersonation-check.html"],["가입코드 조회","/tools/code-check/"],["보증업체 게이트웨이","/guaranteed/"]],
  "코드": [["가입코드 조회","/tools/code-check/"],["보증업체 바로가기","/guaranteed/"],["문의 문구 만들기","/tools/inquiry-builder/"]]
};
function relatedFor(page, n = 4) {
  const scored = [];
  for (const q of publicPages) {
    if (q.route === page.route) continue;
    let score = 0;
    if (q.kind === page.kind) score += 6;
    if (q.route.split("/")[1] === page.route.split("/")[1]) score += 4;
    for (const k of page.keywords) if (q.keywords.has(k)) score += 2;
    if (page.kind === "faq" && q.kind === "search_guide") score += 5;
    if (page.kind === "search_guide" && ["consult_result","tool","guaranteed"].includes(q.kind)) score += 4;
    if (page.kind === "blog_article" && ["search_guide","consult_result","tool"].includes(q.kind)) score += 2;
    if (page.kind === "provider_update" && ["guaranteed","search_guide","tool"].includes(q.kind)) score += 6;
    if (["/guaranteed/","/tools/code-check/","/tools/inquiry-builder/","/consult/"].includes(q.route)) score += 1;
    if (score > 0) scored.push([score,q]);
  }
  scored.sort((a,b) => b[0]-a[0] || a[1].route.localeCompare(b[1].route));
  const out = [];
  for (const [,q] of scored) {
    if (!out.find(x => x.route === q.route) && out.length < n) out.push(q);
  }
  const core = ["/guaranteed/","/tools/code-check/","/tools/inquiry-builder/","/consult/"].map(r => publicPages.find(p => p.route === r)).filter(Boolean);
  for (const q of core) if (!out.find(x => x.route === q.route) && q.route !== page.route && out.length < n) out.push(q);
  return out;
}
function relatedBlock(page) {
  const cards = relatedFor(page).map(q => `<a href="${q.route}" data-v36-related><span>${q.kind.replaceAll("_"," ")}</span><strong>${esc(q.title)}</strong><small>${esc(q.desc.slice(0,80))}</small></a>`).join("");
  return `<section class="v36-related-links" aria-label="관련 확인"><div class="v36-section-head"><span>RELATED</span><h2>관련 확인</h2></div><div class="v36-related-grid">${cards}</div></section>`;
}
function hubsBlock(page) {
  const text = `${page.title} ${page.desc} ${page.route}`;
  let topics = Object.keys(topicLinks).filter(topic => text.includes(topic));
  if (!topics.length && ["blog_article","search_guide","faq","consult_result","provider_update","tool"].includes(page.kind)) topics = ["조건","주소"];
  topics = topics.slice(0,2);
  if (!topics.length) return "";
  const cards = topics.map(topic => `<div class="v36-hub-card"><strong>${topic} 허브</strong><div>${topicLinks[topic].filter(([,href]) => routeSet.has(href)).map(([label,href]) => `<a href="${href}">${label}</a>`).join("")}</div></div>`).join("");
  return `<section class="v36-growth-hubs" aria-label="키워드 허브"><div class="v36-section-head"><span>TOPIC HUB</span><h2>키워드별 확인 허브</h2></div><div class="v36-hub-grid">${cards}</div></section>`;
}
function conversionBlock(page) {
  if (page.kind === "blog_article") return "";
  if (!["search_guide","faq","provider_update","tool","consult_result","consult_motive"].includes(page.kind)) return "";
  const start = page.route.replace(/[^a-z0-9가-힣]+/gi, "-").replace(/^-|-$/g, "").slice(0,48) || "home";
  return `<section class="v36-conversion-cta" aria-label="상담 전환"><div><span>CHECK BEFORE ACTION</span><h2>상담 전 필요한 항목만 먼저 확인하세요</h2><p>가입코드, 공식주소, 이벤트 조건, 출금 전 자료를 정리한 뒤 고객센터로 연결할 수 있습니다.</p></div><nav><a href="/tools/code-check/">가입코드 확인</a><a href="/search-guides/official-address-impersonation-check.html">공식주소 확인</a><a href="/tools/inquiry-builder/">문의 문구 만들기</a><a class="is-primary" href="${BOT_URL}?start=${start}" target="_blank" rel="nofollow noopener">고객센터에서 확인하기</a></nav></section>`;
}


function trimProRelated(txt) {
  return txt.replace(/<div\s+class=["']pro-related__grid["'][^>]*>([\s\S]*?)<\/div>/ig, (full, inner) => {
    const links = [...inner.matchAll(/<a\b[\s\S]*?<\/a>/ig)].map(m => m[0]).slice(0, 4);
    return `<div class="pro-related__grid">${links.join("")}</div>`;
  });
}

function blogVisualGuard() {
  return `<style id="v43-blog-visual-guard">
html,body.pro-blog-page{background:#03070d!important;color:#edf4ff!important;color-scheme:dark;}body.pro-blog-page{background:radial-gradient(circle at 14% -8%,rgba(245,215,139,.13),transparent 32%),radial-gradient(circle at 84% 8%,rgba(79,140,255,.10),transparent 34%),linear-gradient(180deg,#03070d 0%,#07101c 42%,#03070d 100%)!important;}body.pro-blog-page #mainContent{background:transparent!important;color:#edf4ff!important;}body.pro-blog-page .pro-article{background:transparent!important;color:#edf4ff!important;border:0!important;box-shadow:none!important;padding:clamp(18px,4vw,34px) 0 42px!important;}body.pro-blog-page .pro-article__wrap{width:min(920px,calc(100% - 32px))!important;margin-inline:auto!important;color:#edf4ff!important;}body.pro-blog-page .pro-article h1{margin-top:0!important;color:#fff4df!important;font-size:clamp(30px,4.6vw,52px)!important;line-height:1.08!important;letter-spacing:-.04em!important;text-wrap:balance!important;text-shadow:0 10px 34px rgba(0,0,0,.34)!important;}body.pro-blog-page .pro-article .lead{color:rgba(223,232,246,.84)!important;line-height:1.72!important;}body.pro-blog-page .pro-article__meta{gap:8px!important;flex-wrap:wrap!important;}body.pro-blog-page .pro-article__meta span{background:rgba(245,215,139,.10)!important;color:#f5d78b!important;border:1px solid rgba(245,215,139,.24)!important;border-radius:999px!important;font-size:11px!important;padding:5px 9px!important;}body.pro-blog-page .pro-article__body{background:linear-gradient(180deg,rgba(255,255,255,.072),rgba(255,255,255,.03)),rgba(7,13,23,.92)!important;color:#dbe5f1!important;border:1px solid rgba(215,228,255,.14)!important;border-radius:24px!important;box-shadow:0 20px 64px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.075)!important;line-height:1.72!important;}body.pro-blog-page .pro-article__body h2,body.pro-blog-page .pro-article__body h3,body.pro-blog-page .v37-article-summary h2{color:#fff4df!important;margin-top:1.65em!important;margin-bottom:.6em!important;line-height:1.22!important;}body.pro-blog-page .pro-article__body p,body.pro-blog-page .pro-article__body li,body.pro-blog-page .pro-article__body ul,body.pro-blog-page .pro-article__body ol{color:#dbe5f1!important;}body.pro-blog-page .pro-article__body li{margin:.38em 0!important;}body.pro-blog-page .pro-article__body a{color:#f5d78b!important;text-decoration:none!important;border-bottom:1px solid rgba(245,215,139,.34)!important;overflow-wrap:anywhere;}body.pro-blog-page .pro-article__body a[target="_blank"]::after{content:"↗";font-size:.86em;margin-left:.18em;color:#f5d78b;}body.pro-blog-page .v37-article-summary,body.pro-blog-page .pro-related,body.pro-blog-page .article-related-panel{background:rgba(255,255,255,.058)!important;border:1px solid rgba(245,215,139,.18)!important;color:#dbe5f1!important;border-radius:20px!important;}body.pro-blog-page .pro-related__grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}body.pro-blog-page .pro-related a,body.pro-blog-page .article-related-card,body.pro-blog-page .related-card{background:rgba(255,255,255,.062)!important;color:#fff4df!important;border:1px solid rgba(215,228,255,.15)!important;border-radius:16px!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important;}body.pro-blog-page .pro-notice{font-size:12.5px!important;color:rgba(223,232,246,.68)!important;border-top-color:rgba(215,228,255,.15)!important;}body.pro-blog-page .v36-related-links{background:linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.028)),rgba(7,13,23,.82)!important;color:#edf4ff!important;border:1px solid rgba(215,228,255,.12)!important;}body.pro-blog-page .v36-related-grid a{background:rgba(255,255,255,.052)!important;color:#dbe5f1!important;border-color:rgba(215,228,255,.14)!important;}body.pro-blog-page blockquote{margin:18px 0!important;padding:14px 16px!important;border-left:3px solid #f5d78b!important;border-radius:14px!important;background:rgba(245,215,139,.08)!important;color:#fff4df!important;}body.pro-blog-page table{display:block!important;max-width:100%!important;overflow-x:auto!important;border-collapse:collapse!important;}body.pro-blog-page code,body.pro-blog-page kbd,body.pro-blog-page samp{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;color:#f7df9e!important;background:rgba(255,255,255,.07)!important;border-radius:6px!important;padding:.08em .32em!important;}body.pro-blog-page [style*="background:#fff"],body.pro-blog-page [style*="background: #fff"],body.pro-blog-page [style*="background-color:#fff"],body.pro-blog-page [style*="background-color: #fff"],body.pro-blog-page [style*="background:white"],body.pro-blog-page [style*="background: white"]{background:rgba(7,13,23,.88)!important;color:#dbe5f1!important;}@media(max-width:720px){body.pro-blog-page .pro-article__wrap{width:calc(100% - 18px)!important}body.pro-blog-page .pro-article__body{padding:18px!important;border-radius:18px!important}body.pro-blog-page .pro-related__grid{grid-template-columns:1fr!important}}@media print{body.pro-blog-page{background:#fff!important;color:#111!important}body.pro-blog-page .moon-header,body.pro-blog-page .v36-related-links,body.pro-blog-page .moon-footer{display:none!important}body.pro-blog-page .pro-article__body{box-shadow:none!important;border:1px solid #ccc!important;color:#111!important;background:#fff!important}}
</style>`;
}

const detailKinds = new Set(["blog_article","search_guide","faq","provider_update","consult_result","consult_motive","sports","tool"]);
for (const page of pages) {
  let txt = fs.readFileSync(page.file, "utf8");
  txt = removeOld(txt);
  txt = txt.replace(/\n?<meta\b(?=[^>]*\bname=["\']keywords["\'])[^>]*>\s*/ig, "\n");
  txt = txt.match(/<title[^>]*>[\s\S]*?<\/title>/i) ? txt.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`) : txt.replace("</head>", `<title>${esc(page.title)}</title>\n</head>`);
  txt = upsertName(txt, "description", page.desc);
  txt = upsertName(txt, "robots", page.kind === "noindex" ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large");
  txt = upsertLink(txt, "canonical", DOMAIN + page.route);
  txt = upsertProp(txt, "og:type", ["blog_article","search_guide","provider_update"].includes(page.kind) ? "article" : "website");
  txt = upsertProp(txt, "og:site_name", "88ST.Cloud");
  txt = upsertProp(txt, "og:title", page.title);
  txt = upsertProp(txt, "og:description", page.desc);
  txt = upsertProp(txt, "og:url", DOMAIN + page.route);
  txt = upsertProp(txt, "og:image", DOMAIN + "/assets/img/v24/moonsafe-hero-v24.webp");
  txt = upsertName(txt, "twitter:card", "summary_large_image");
  txt = upsertName(txt, "twitter:title", page.title);
  txt = upsertName(txt, "twitter:description", page.desc);
  txt = upsertName(txt, "twitter:image", DOMAIN + "/assets/img/v24/moonsafe-hero-v24.webp");
  txt = headHints(txt);
  txt = txt.replace("</head>", schema(page, txt) + "\n</head>");
  if (page.kind === "blog_article") {
    txt = trimProRelated(txt);
    txt = txt.replace("</head>", blogVisualGuard() + "\n</head>");
  }
  if (txt.includes("/assets/css/growth-conversion.v36.css")) txt = txt.replace(/\/assets\/css\/growth-conversion\.v36\.css\?v=[^"']+/g, `/assets/css/growth-conversion.v36.css?v=${VERSION}`);
  else txt = txt.replace("</head>", `<link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/>\n</head>`);
  if (txt.includes("/assets/js/growth-conversion.v36.js")) txt = txt.replace(/\/assets\/js\/growth-conversion\.v36\.js\?v=[^"']+/g, `/assets/js/growth-conversion.v36.js?v=${VERSION}`);
  else txt = txt.replace("</body>", `<script src="/assets/js/growth-conversion.v36.js?v=${VERSION}" defer></script>\n</body>`);
  if (detailKinds.has(page.kind)) {
    const blocks = page.kind === "blog_article" ? relatedBlock(page) : hubsBlock(page) + relatedBlock(page) + conversionBlock(page);
    txt = txt.includes("</main>") ? txt.replace("</main>", blocks + "\n</main>") : txt.replace("</body>", blocks + "\n</body>");
  }
  fs.writeFileSync(page.file, txt);
}
function priority(p) {
  if (p.route === "/") return "1.00";
  if (["/guaranteed/","/tools/","/consult/","/blog/","/search-guides/","/faq/"].includes(p.route)) return "0.85";
  if (p.kind === "search_guide" && /payout|official-address|code|event|rolling/.test(p.route)) return "0.74";
  return "0.62";
}
const sitemapPages = publicPages.sort((a,b) => a.route.localeCompare(b.route));
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const p of sitemapPages) {
  xml += `  <url>\n    <loc>${DOMAIN}${p.route}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority(p)}</priority>\n  </url>\n`;
}
xml += `</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
fs.writeFileSync(path.join(ROOT, "sitemap.txt"), sitemapPages.map(p => DOMAIN + p.route).join("\n") + "\n");
if (fs.existsSync(path.join(ROOT, "serverless"))) {
  fs.writeFileSync(path.join(ROOT, "serverless/sitemap.xml"), xml);
  fs.writeFileSync(path.join(ROOT, "serverless/sitemap.txt"), sitemapPages.map(p => DOMAIN + p.route).join("\n") + "\n");
}
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nDisallow: /admin/\nDisallow: /ops/\nDisallow: /api/\nDisallow: /muktu-police/\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
const deployCheck = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  html: pages.length,
  sitemap: sitemapPages.length,
  checkUrls: ["/","/blog/","/consult/","/guaranteed/","/tools/code-check/","/sitemap.xml","/robots.txt","/api/health"].map(u => DOMAIN + u + (u.includes("?") ? "" : `?v=${VERSION}`))
};
fs.writeFileSync(path.join(ROOT, "assets/data/deploy-check.urls.v36.json"), JSON.stringify(deployCheck, null, 2));
console.log(`[${VERSION}] html=${pages.length} sitemap=${sitemapPages.length}`);
