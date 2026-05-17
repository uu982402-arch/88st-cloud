#!/usr/bin/env node
/* V36 Static Growth & Conversion Engine / V37 Non-Duplicate Game SEO Expansion
   - strict SEO meta/canonical/schema
   - sitemap/robots generation
   - related links + topic hubs + conversion CTAs
   - provider JSON aware ordering and links
*/
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DOMAIN = "https://88st.cloud";
const VERSION = "static-growth-conversion-v38-20260517";
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
    home: "88ST.Cloud | 코드·주소·조건 확인 대시보드",
    blog_hub: "블로그 | 코드·주소·조건 확인 가이드",
    blog_article: `${base} | 확인 가이드`,
    search_hub: "검색 가이드 | 공식주소·조건 확인",
    search_guide: `${base} | 공식주소·조건 확인`,
    faq_hub: "FAQ | 상담 전 자주 묻는 질문",
    faq: `${base} | FAQ`,
    provider_update: `${base} | 업체 변경 이력`,
    guaranteed: "보증업체 | 공식 코드·도메인 확인",
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
  if (page.kind === "home") d = "코드 확인, 공식주소 확인, 이벤트 조건, 출금 전 확인을 한 흐름으로 정리한 88ST.Cloud 대시보드입니다.";
  if (page.kind === "guaranteed") d = "보증업체별 가입코드와 공식 도메인을 짧게 확인하고, 필요 시 자동화 상담봇으로 조건을 정리합니다.";
  if (page.kind === "consult") d = "가입 전 코드, 공식주소, 이벤트 조건, 출금 전 확인을 자동화 상담봇 기준으로 빠르게 정리합니다.";
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
  if (d.length < 80) d += " 상담 전 필요한 확인 항목과 관련 가이드를 함께 볼 수 있습니다.";
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
function upsertName(txt, name, content) {
  return replaceOrInsert(txt, new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'][^"']*["']\\s*/?>`, "i"), `<meta name="${name}" content="${esc(content)}"/>`);
}
function upsertProp(txt, prop, content) {
  return replaceOrInsert(txt, new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["'][^"']*["']\\s*/?>`, "i"), `<meta property="${prop}" content="${esc(content)}"/>`);
}
function upsertLink(txt, relName, href) {
  return replaceOrInsert(txt, new RegExp(`<link\\s+rel=["']${relName}["']\\s+href=["'][^"']*["']\\s*/?>`, "i"), `<link rel="${relName}" href="${esc(href)}"/>`);
}
function removeOld(txt) {
  return txt
    .replace(/\n?<section class="v31-related-links"[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<section class="v31-topic-hubs"[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<section class="v36-growth-hubs"[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<section class="v36-related-links"[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<section class="v36-conversion-cta"[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<script type="application\/ld\+json" data-v31-schema="[^"]+">[\s\S]*?<\/script>\s*/ig, "\n")
    .replace(/\n?<script type="application\/ld\+json" data-v36-schema="[^"]+">[\s\S]*?<\/script>\s*/ig, "\n");
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
  if (!["blog_article","search_guide","faq","provider_update","tool","consult_result","consult_motive","guaranteed"].includes(page.kind)) return "";
  const start = page.route.replace(/[^a-z0-9가-힣]+/gi, "-").replace(/^-|-$/g, "").slice(0,48) || "home";
  return `<section class="v36-conversion-cta" aria-label="상담 전환"><div><span>CHECK BEFORE ACTION</span><h2>상담 전 필요한 항목만 먼저 확인하세요</h2><p>가입코드, 공식주소, 이벤트 조건, 출금 전 자료를 정리한 뒤 자동화 상담봇으로 연결할 수 있습니다.</p></div><nav><a href="/tools/code-check/">가입코드 확인</a><a href="/search-guides/official-address-impersonation-check.html">공식주소 확인</a><a href="/tools/inquiry-builder/">문의 문구 만들기</a><a class="is-primary" href="${BOT_URL}?start=${start}" target="_blank" rel="nofollow noopener">조건 먼저 확인하기</a></nav></section>`;
}

const detailKinds = new Set(["blog_article","search_guide","faq","provider_update","consult_result","consult_motive","sports","tool"]);
for (const page of pages) {
  let txt = fs.readFileSync(page.file, "utf8");
  txt = removeOld(txt);
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
  txt = txt.replace("</head>", schema(page, txt) + "\n</head>");
  if (!txt.includes("/assets/css/growth-conversion.v36.css")) txt = txt.replace("</head>", `<link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/>\n</head>`);
  if (!txt.includes("/assets/js/growth-conversion.v36.js")) txt = txt.replace("</body>", `<script src="/assets/js/growth-conversion.v36.js?v=${VERSION}" defer></script>\n</body>`);
  if (detailKinds.has(page.kind)) {
    const blocks = hubsBlock(page) + relatedBlock(page) + conversionBlock(page);
    if (txt.includes('<section class="v27-detail-support"')) txt = txt.replace('<section class="v27-detail-support"', blocks + '<section class="v27-detail-support"');
    else txt = txt.includes("</main>") ? txt.replace("</main>", blocks + "\n</main>") : txt.replace("</body>", blocks + "\n</body>");
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
