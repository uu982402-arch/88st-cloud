#!/usr/bin/env node
/* V31 Static SEO Intelligence Engine
   Rebuilds meta, canonical, OG, schema, sitemap, topic/related blocks and robots rules.
   Safe for Cloudflare Pages static deploys.
*/
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DOMAIN = "https://88st.cloud";
const TODAY = new Date().toISOString().slice(0, 10);
const VERSION = "static-seo-intelligence-v31";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "__MACOSX") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
function rel(p) { return path.relative(ROOT, p).replaceAll(path.sep, "/"); }
function routeFor(r) {
  if (r === "index.html") return "/";
  if (r.endsWith("/index.html")) return "/" + r.slice(0, -10);
  return "/" + r;
}
function strip(s) { return String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function esc(s) { return String(s || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function titleFromPath(r) {
  const base = path.basename(r, ".html") === "index" ? path.basename(path.dirname(r)) : path.basename(r, ".html");
  return base.replace(/[-_]/g, " ").replace(/\b\w/g, m => m.toUpperCase());
}
function titleOf(txt, r) {
  const m = txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || txt.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return strip(m && m[1]) || titleFromPath(r);
}
function descOf(txt, title) {
  const m = txt.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  let d = strip(m && m[1]);
  if (!d) {
    const p = txt.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    d = strip(p && p[1]);
  }
  if (!d) d = `${title} 정보를 코드, 공식주소, 조건 확인 기준으로 정리했습니다.`;
  if (d.length < 55) d += " 88ST.Cloud에서 상담 전 필요한 확인 흐름을 짧게 정리합니다.";
  return d.length > 155 ? d.slice(0, 152).trim() + "..." : d;
}
function classify(r) {
  if (r === "index.html") return "home";
  if (r.startsWith("admin/") || r.startsWith("ops/")) return "noindex";
  if (r === "blog/index.html") return "blog_hub";
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
  if (r.startsWith("sports-check/") && r.endsWith(".html")) return "sports";
  return "webpage";
}
function words(text) {
  let t = String(text || "").toLowerCase();
  const add = [["출금","payout"],["주소","address"],["조건","condition"],["코드","code"],["보증","provider"],["상담","consult"],["페이백","payback"],["롤링","rolling"],["usdt","usdt"]];
  for (const [a,b] of add) if (t.includes(a.toLowerCase())) t += " " + b;
  return new Set((t.match(/[a-z0-9가-힣]{2,}/g) || []).filter(x => !["html","index","guide","basic","check","88st","cloud","com","https"].includes(x)));
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
function removeV31(txt) {
  return txt
    .replace(/\n?<section class="v31-related-links"[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<section class="v31-topic-hubs"[\s\S]*?<\/section>\s*/ig, "\n")
    .replace(/\n?<script type="application\/ld\+json" data-v31-schema="[^"]+">[\s\S]*?<\/script>\s*/ig, "\n");
}
function schema(page) {
  const parts = page.route.split("/").filter(Boolean);
  const crumbs = [{ "@type":"ListItem", "position":1, "name":"홈", "item":DOMAIN + "/" }];
  let acc = "";
  parts.forEach((part, i) => { acc += "/" + part; crumbs.push({ "@type":"ListItem", "position":i+2, "name":part.replace(".html","").replaceAll("-"," "), "item":DOMAIN+acc }); });
  const graph = [
    { "@type":"Organization", "@id":DOMAIN+"/#organization", "name":"88ST.Cloud", "url":DOMAIN+"/", "logo":DOMAIN+"/img/logo-v24.png" },
    { "@type":"WebSite", "@id":DOMAIN+"/#website", "url":DOMAIN+"/", "name":"88ST.Cloud", "publisher":{"@id":DOMAIN+"/#organization"} },
    { "@type":"BreadcrumbList", "itemListElement":crumbs }
  ];
  if (["blog_article","search_guide","provider_update"].includes(page.kind)) {
    graph.push({ "@type":"Article", "@id":DOMAIN+page.route+"#primary", "url":DOMAIN+page.route, "headline":page.title.slice(0,110), "description":page.desc, "image":DOMAIN+"/assets/img/v24/moonsafe-hero-v24.webp", "dateModified":TODAY, "author":{"@type":"Organization","name":"88ST.Cloud"}, "publisher":{"@id":DOMAIN+"/#organization"}, "mainEntityOfPage":DOMAIN+page.route });
  } else if (page.kind === "faq") {
    graph.push({ "@type":"FAQPage", "@id":DOMAIN+page.route+"#faq", "url":DOMAIN+page.route, "name":page.title, "mainEntity":[{ "@type":"Question", "name":page.title, "acceptedAnswer":{"@type":"Answer", "text":page.desc} }] });
  } else {
    graph.push({ "@type":"WebPage", "@id":DOMAIN+page.route+"#webpage", "url":DOMAIN+page.route, "name":page.title, "description":page.desc, "isPartOf":{"@id":DOMAIN+"/#website"} });
  }
  return `<script type="application/ld+json" data-v31-schema="primary">${JSON.stringify({ "@context":"https://schema.org", "@graph":graph })}</script>`;
}

const htmls = walk(ROOT).filter(p => p.endsWith(".html"));
let pages = htmls.map(file => {
  const r = rel(file);
  const txt = fs.readFileSync(file, "utf8");
  const title = titleOf(txt, r);
  const desc = descOf(txt, title);
  return { file, rel:r, route:routeFor(r), kind:classify(r), title, desc, keywords:words(title + " " + desc + " " + r) };
});
const publicPages = pages.filter(p => p.kind !== "noindex" && !p.route.startsWith("/admin/") && !p.route.startsWith("/ops/"));
const routeSet = new Set(publicPages.map(p => p.route));
const coreLinks = ["/guaranteed/","/tools/code-check/","/tools/inquiry-builder/","/consult/","/blog/"].filter(r => routeSet.has(r));
function relatedFor(page) {
  const scored = [];
  for (const q of publicPages) {
    if (q.route === page.route) continue;
    let score = 0;
    if (q.kind === page.kind) score += 5;
    if (q.route.split("/")[1] === page.route.split("/")[1]) score += 3;
    for (const k of page.keywords) if (q.keywords.has(k)) score += 2;
    if (page.kind === "faq" && q.kind === "search_guide") score += 4;
    if (page.kind === "search_guide" && ["consult_result","tool","guaranteed"].includes(q.kind)) score += 3;
    if (q.route === "/guaranteed/" || q.route === "/tools/code-check/") score += 1;
    if (score > 0) scored.push([score,q]);
  }
  scored.sort((a,b)=>b[0]-a[0] || a[1].route.localeCompare(b[1].route));
  const out = [];
  for (const [,q] of scored) if (!out.find(x => x.route === q.route) && out.length < 4) out.push(q);
  for (const r of coreLinks) {
    const q = publicPages.find(p => p.route === r);
    if (q && !out.find(x => x.route === q.route) && q.route !== page.route && out.length < 4) out.push(q);
  }
  return out;
}
function relatedBlock(page) {
  const cards = relatedFor(page).map(q => `<a href="${q.route}"><span>${q.kind.replaceAll("_"," ")}</span><strong>${esc(q.title)}</strong><small>${esc(q.desc.slice(0,72))}</small></a>`).join("");
  return `<section class="v31-related-links" aria-label="관련 확인"><div class="v31-section-head"><span>RELATED CHECK</span><h2>관련 확인</h2></div><div class="v31-related-grid">${cards}</div></section>`;
}
function topicBlock(page) {
  const text = page.title + " " + page.desc + " " + page.route;
  const map = [
    ["출금", [["출금 전 문의 문구","/search-guides/payout-inquiry-template.html"],["출금 지연 체크","/search-guides/payout-delay-check.html"],["출금 전 확인","/consult-result/payout-before-check.html"]]],
    ["조건", [["조건 비교","/tools/"],["이벤트 조건 확인","/consult-result/event-condition-check.html"],["첫충·롤링 확인","/search-guides/first-charge-rolling.html"]]],
    ["주소", [["공식주소 사칭 확인","/search-guides/official-address-impersonation-check.html"],["가입코드 조회","/tools/code-check/"],["보증업체 게이트웨이","/guaranteed/"]]],
    ["코드", [["가입코드 조회","/tools/code-check/"],["보증업체 바로가기","/guaranteed/"],["문의 문구 만들기","/tools/inquiry-builder/"]]]
  ];
  let matched = map.filter(([topic]) => text.includes(topic)).slice(0,2);
  if (!matched.length && ["blog_article","search_guide","faq","consult_result","provider_update"].includes(page.kind)) matched = map.filter(([topic]) => topic==="조건" || topic==="주소");
  if (!matched.length) return "";
  const blocks = matched.map(([topic,links]) => `<div class="v31-topic-card"><strong>${topic} 허브</strong><div>${links.filter(([,href])=>routeSet.has(href)).map(([label,href])=>`<a href="${href}">${label}</a>`).join("")}</div></div>`).join("");
  return `<section class="v31-topic-hubs" aria-label="키워드별 허브"><div class="v31-section-head"><span>TOPIC HUB</span><h2>키워드별 확인 허브</h2></div><div class="v31-topic-grid">${blocks}</div></section>`;
}
const detailKinds = new Set(["blog_article","search_guide","faq","provider_update","consult_result","consult_motive","sports","tool"]);
for (const page of pages) {
  let txt = fs.readFileSync(page.file, "utf8");
  txt = removeV31(txt);
  let title = page.title.includes("88ST") ? page.title : `${page.title} | 88ST.Cloud`;
  if (title.length > 62) title = title.slice(0,59).trim() + "...";
  txt = txt.match(/<title[^>]*>[\s\S]*?<\/title>/i) ? txt.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`) : txt.replace("</head>", `<title>${esc(title)}</title>\n</head>`);
  txt = upsertName(txt, "description", page.desc);
  txt = upsertName(txt, "robots", page.kind === "noindex" ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large");
  txt = upsertLink(txt, "canonical", DOMAIN + page.route);
  txt = upsertProp(txt, "og:type", ["blog_article","search_guide","provider_update"].includes(page.kind) ? "article" : "website");
  txt = upsertProp(txt, "og:site_name", "88ST.Cloud");
  txt = upsertProp(txt, "og:title", title);
  txt = upsertProp(txt, "og:description", page.desc);
  txt = upsertProp(txt, "og:url", DOMAIN + page.route);
  txt = upsertProp(txt, "og:image", DOMAIN + "/assets/img/v24/moonsafe-hero-v24.webp");
  txt = upsertName(txt, "twitter:card", "summary_large_image");
  txt = upsertName(txt, "twitter:title", title);
  txt = upsertName(txt, "twitter:description", page.desc);
  txt = upsertName(txt, "twitter:image", DOMAIN + "/assets/img/v24/moonsafe-hero-v24.webp");
  txt = txt.replace("</head>", schema(page) + "\n</head>");
  if (!txt.includes("/assets/css/seo-intelligence.v31.css")) txt = txt.replace("</head>", `<link rel="stylesheet" href="/assets/css/seo-intelligence.v31.css?v=${VERSION}"/>\n</head>`);
  if (!txt.includes("/assets/js/seo-intelligence.v31.js")) txt = txt.replace("</body>", `<script src="/assets/js/seo-intelligence.v31.js?v=${VERSION}" defer></script>\n</body>`);
  if (detailKinds.has(page.kind)) {
    const block = topicBlock(page) + relatedBlock(page);
    if (txt.includes('<section class="v27-detail-support"')) txt = txt.replace('<section class="v27-detail-support"', block + '<section class="v27-detail-support"');
    else txt = txt.includes("</main>") ? txt.replace("</main>", block + "\n</main>") : txt.replace("</body>", block + "\n</body>");
  }
  fs.writeFileSync(page.file, txt);
}
function priority(p) {
  if (p.route === "/") return "1.00";
  if (["/blog/","/tools/","/consult/","/guaranteed/","/search-guides/","/faq/"].includes(p.route)) return "0.85";
  return "0.62";
}
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const p of publicPages.sort((a,b)=>a.route.localeCompare(b.route))) {
  xml += `  <url>\n    <loc>${DOMAIN}${p.route}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority(p)}</priority>\n  </url>\n`;
}
xml += `</urlset>\n`;
fs.writeFileSync(path.join(ROOT,"sitemap.xml"), xml);
fs.writeFileSync(path.join(ROOT,"sitemap.txt"), publicPages.sort((a,b)=>a.route.localeCompare(b.route)).map(p=>DOMAIN+p.route).join("\n") + "\n");
const sl = path.join(ROOT,"serverless");
if (fs.existsSync(sl)) {
  fs.writeFileSync(path.join(sl,"sitemap.xml"), xml);
  fs.writeFileSync(path.join(sl,"sitemap.txt"), publicPages.sort((a,b)=>a.route.localeCompare(b.route)).map(p=>DOMAIN+p.route).join("\n") + "\n");
}
fs.writeFileSync(path.join(ROOT,"robots.txt"), `User-agent: *\nDisallow: /admin/\nDisallow: /ops/\nDisallow: /api/\nDisallow: /muktu-police/\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
let dead = [];
const existing = new Set([...htmls.map(p=>"/"+rel(p)), ...htmls.filter(p=>rel(p).endsWith("/index.html")).map(p=>"/"+rel(p).slice(0,-10)), "/"]);
for (const page of pages) {
  const txt = fs.readFileSync(page.file, "utf8");
  for (const m of txt.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const href = m[1].split("#")[0].split("?")[0];
    if (href.startsWith("/") && !href.startsWith("//") && !href.match(/\.(css|js|png|jpe?g|webp|svg|ico|json|txt|xml|webmanifest|pdf|map)$/i)) {
      if (!existing.has(href) && !existing.has(href.replace(/\/$/,"") + "/index.html")) dead.push(`${page.rel} -> ${href}`);
    }
  }
}
fs.writeFileSync(path.join(ROOT,"build.txt"), `${VERSION}\nupdated=${new Date().toISOString()}\nhtml=${pages.length}\nsitemap=${publicPages.length}\ndead_links=${dead.length}\n`);
console.log(`[${VERSION}] html=${pages.length} sitemap=${publicPages.length} dead_links=${dead.length}`);
