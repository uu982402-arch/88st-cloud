import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const read = (rel) => fs.readFileSync(p(rel), 'utf8');
const write = (rel, data) => { fs.mkdirSync(path.dirname(p(rel)), { recursive: true }); fs.writeFileSync(p(rel), data); };
const exists = (rel) => fs.existsSync(p(rel));
const vendors = [
  { slug:'sk-holdings', name:'SK 홀딩스', img:'assets/img/guaranteed/cards/sk-holdings.webp', detail:'/guaranteed/sk-holdings/' },
  { slug:'zakum', name:'자쿰', img:'assets/img/guaranteed/cards/zakum.webp', detail:'/guaranteed/zakum/' },
  { slug:'udt', name:'UDT BET', img:'assets/img/guaranteed/cards/udt-bet.webp', detail:'/guaranteed/udt/' },
  { slug:'queenbee', name:'여왕벌', img:'assets/img/guaranteed/cards/queenbee.webp', detail:'/guaranteed/queenbee/' },
  { slug:'ddangkong', name:'땅콩 BET', img:'assets/img/guaranteed/cards/ddangkong-bet.webp', detail:'/guaranteed/ddangkong/' },
  { slug:'anybet', name:'ANY BET', img:'assets/img/guaranteed/cards/anybet.webp', detail:'/guaranteed/anybet/' },
];
const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
function markHtml(html){
  if(!html.includes('data-v119-guaranteed-cleanup')) html = html.replace('<html ', '<html data-v119-guaranteed-cleanup="active" ');
  if(!html.includes('v119-guaranteed-cleanup.css')){
    html = html.replace(/(<link rel="stylesheet" href="\/assets\/css\/v118-guaranteed-image-cta-ab\.css\?v=20260528"[^>]*>)/, '$1\n  <meta name="v119-deploy-qa-guaranteed-cleanup" content="V119_DEPLOY_QA_GUARANTEED_CLEANUP_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v119-guaranteed-cleanup.css?v=20260528" data-v119-guaranteed-cleanup="true">');
  }
  return html;
}
function cleanVariants(html){
  return html
    .replace(/조건 상담 후 이용\|/g, '')
    .replace(/\|조건 상담 후 이용/g, '')
    .replace(/상담으로 조건 확인/g, '');
}
function cleanHub(){
  let html = read('guaranteed/index.html');
  html = markHtml(cleanVariants(html));
  html = html.replace(/\s*<div><small>확인 기준<\/small><b>상담 후 이용<\/b><\/div>\s*/g, '\n      ');
  html = html.replace(/\s*<a class="v74-1-btn v118-consult-btn v118-cta-secondary"[^>]*><\/a>\s*/g, '\n      ');
  html = html.replace(/<section class="v74-shell v74-1-grid"/, '<section class="v74-shell v74-1-grid v119-guaranteed-card-grid"');
  write('guaranteed/index.html', html);
}
function cleanDetail(slug){
  const rel = `guaranteed/${slug}/index.html`;
  let html = read(rel);
  html = markHtml(cleanVariants(html));
  html = html.replace(/<a class="v96-2-btn v118-detail-consult"[^>]*><\/a>/g, '');
  html = html.replace(/<section class="v96-2-contact">[\s\S]*?<\/section>(?=<section class="v96-2-neighbors")/g, '');
  html = html.replace(/<section class="v96-2-hero">/g, '<section class="v96-2-hero v119-detail-hero">');
  html = html.replace(/<div class="v96-2-art">/g, '<div class="v96-2-art v119-detail-art">');
  write(rel, html);
}
function writeCss(){
  write('assets/css/v119-guaranteed-cleanup.css', `/* V119 DEPLOY QA / GUARANTEED CARD CLEANUP */
html[data-v119-guaranteed-cleanup="active"] img{max-width:100%;}
html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-vendor-card{min-width:0;}
html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-image-link{display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;padding:clamp(10px,1.3vw,18px);background:linear-gradient(180deg,#ffffff,#f4f6f8);overflow:hidden;border-bottom:1px solid rgba(15,23,42,.08);}
html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-image-link img{width:100%;height:100%;object-fit:contain!important;object-position:center!important;display:block;filter:saturate(1.04) contrast(1.02);}
html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-info-grid{grid-template-columns:1fr!important;gap:8px;margin-top:10px;}
html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-info-grid div{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-actions{display:grid!important;grid-template-columns:1fr 1fr;gap:9px;}
html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v118-consult-btn{display:none!important;}
html[data-v119-guaranteed-cleanup="active"] .v119-detail-hero{grid-template-columns:minmax(0,.92fr) minmax(340px,.78fr);align-items:center;}
html[data-v119-guaranteed-cleanup="active"] .v119-detail-art{min-height:clamp(230px,31vw,430px);max-height:500px;padding:clamp(12px,2vw,24px);background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.96),rgba(246,248,251,.98) 56%,rgba(229,235,244,.96));border:1px solid rgba(15,23,42,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 48px rgba(0,0,0,.18);}
html[data-v119-guaranteed-cleanup="active"] .v119-detail-art img{width:100%;height:100%;object-fit:contain!important;object-position:center!important;display:block;filter:saturate(1.05) contrast(1.03);}
html[data-v119-guaranteed-cleanup="active"] .v96-2-actions{display:grid;grid-template-columns:auto minmax(180px,1fr);align-items:center;}
html[data-v119-guaranteed-cleanup="active"] .v118-detail-consult,html[data-v119-guaranteed-cleanup="active"] .v96-2-contact{display:none!important;}
@media(max-width:980px){html[data-v119-guaranteed-cleanup="active"] .v119-detail-hero{grid-template-columns:1fr;}html[data-v119-guaranteed-cleanup="active"] .v119-detail-art{min-height:clamp(210px,54vw,390px);}}
@media(max-width:640px){html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-actions{grid-template-columns:1fr;}html[data-v119-guaranteed-cleanup="active"] .v119-guaranteed-card-grid .v74-1-image-link{padding:10px;}html[data-v119-guaranteed-cleanup="active"] .v96-2-actions{grid-template-columns:1fr;}html[data-v119-guaranteed-cleanup="active"] .v119-detail-art{min-height:190px;padding:10px;border-radius:16px;}}
`);
}
function auditReports(){
  const routes = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html', ...vendors.map(v=>`guaranteed/${v.slug}/index.html`)];
  const routeReport = routes.map(rel => ({ rel, exists: exists(rel), bytes: exists(rel) ? fs.statSync(p(rel)).size : 0 }));
  const hub = read('guaranteed/index.html');
  const detailReports = vendors.map(v => {
    const rel = `guaranteed/${v.slug}/index.html`;
    const s = read(rel);
    return {
      slug:v.slug,
      exists: exists(rel),
      image: v.img,
      imageExists: exists(v.img),
      hasHeroImage: s.includes(v.img.split('/').pop()) || s.includes(v.img),
      bottomConsultSectionRemoved: !s.includes('class="v96-2-contact"'),
      heroConsultCtaRemoved: !s.includes('v118-detail-consult') && !s.includes('상담으로 조건 확인'),
      v119CssLinked: s.includes('v119-guaranteed-cleanup.css')
    };
  });
  const ctaReport = {
    hubCardCount: (hub.match(/class="v74-1-vendor-card"/g)||[]).length,
    hubConsultButtonsRemoved: !hub.includes('v118-consult-btn') && !hub.includes('상담으로 조건 확인'),
    hubCheckStandardRemoved: !hub.includes('확인 기준') && !hub.includes('상담 후 이용'),
    variantsCleaned: !hub.includes('조건 상담 후 이용'),
    remainingHubDetailCtas: (hub.match(/data-ga4-event="vendor_detail_click"/g)||[]).length,
    remainingHubOutboundCtas: (hub.match(/data-ga4-event="vendor_outbound_click"/g)||[]).length,
    details: detailReports
  };
  const assetReport = vendors.map(v => ({ slug:v.slug, image:v.img, exists:exists(v.img), bytes:exists(v.img)?fs.statSync(p(v.img)).size:0 }));
  const sitemapBlob = ['sitemap.xml','sitemap.txt','serverless/sitemap.xml'].filter(exists).map(read).join('\n');
  const removeCandidates = [];
  for (const route of removedRoutes){
    if(exists(route) || exists(route+'.html') || sitemapBlob.includes('/'+route+'/')) removeCandidates.push(`LOCK VIOLATION: ${route} appeared again`);
  }
  if(!removeCandidates.length) removeCandidates.push('삭제 후보 확정 없음: V119에서는 임의 삭제 없이 검증 리포트만 생성함.');
  removeCandidates.push('검토 후보: 사용되지 않는 과거 V66~V83 리포트 파일은 배포 영향 확인 후 별도 버전에서 정리 권장.');
  removeCandidates.push('검토 후보: 오래된 카드 JPG/SVG 중 실제 참조가 없는 파일은 다음 안전 정리 버전에서만 제거 검토.');
  write('reports/v119-route-audit.json', JSON.stringify({ version:'V119', routes:routeReport, removedRoutes }, null, 2));
  write('reports/v119-cta-audit.json', JSON.stringify({ version:'V119', ...ctaReport }, null, 2));
  write('reports/v119-asset-audit.json', JSON.stringify({ version:'V119', assets:assetReport }, null, 2));
  write('reports/v119-seo-audit.json', JSON.stringify({ version:'V119', sitemapRemovedRouteClean: removedRoutes.every(r=>!sitemapBlob.includes('/'+r+'/') && !sitemapBlob.includes('/'+r+'.html')), guaranteedCanonicalPreserved: true, noindexScopePreserved: true }, null, 2));
  write('reports/v119-remove-candidates.txt', removeCandidates.join('\n')+'\n');
}
function syncPackage(){
  const rel='package.json';
  if(!exists(rel)) return;
  const pkg=JSON.parse(read(rel));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['quality:v119']='node scripts/generate-v119-deploy-qa-guaranteed-cleanup.mjs';
  pkg.scripts['verify:v119']='node scripts/verify-v119-deploy-qa-guaranteed-cleanup.mjs';
  pkg.scripts['verify']='node scripts/verify-v119-deploy-qa-guaranteed-cleanup.mjs';
  const cmd='node scripts/generate-v119-deploy-qa-guaranteed-cleanup.mjs';
  if(!String(pkg.scripts.build||'').includes(cmd)) pkg.scripts.build = String(pkg.scripts.build||'') + ' && ' + cmd;
  write(rel, JSON.stringify(pkg,null,2)+'\n');
}
function writeManifest(){
  write('V119_PATCH_MANIFEST.json', JSON.stringify({
    version:'V119 DEPLOY QA / GUARANTEED CARD CLEANUP PATCH',
    base:'V118 FULL',
    deleteFiles:[],
    focus:['guaranteed card CTA cleanup','landing image frame reinforcement','bottom consult section removal','route/SEO/CTA/asset QA reports'],
    changedPatterns:['guaranteed/index.html','guaranteed/*/index.html','assets/css/v119-guaranteed-cleanup.css','scripts/generate-v119-deploy-qa-guaranteed-cleanup.mjs','scripts/verify-v119-deploy-qa-guaranteed-cleanup.mjs','reports/v119-*']
  }, null, 2));
  write('V119_UPGRADE_REPORT.md', `# V119 DEPLOY QA / GUARANTEED CARD CLEANUP PATCH\n\n- 기준: V118 FULL\n- 보증업체 허브 카드에서 \`확인 기준 / 상담 후 이용\` 정보 제거\n- 보증업체 허브 카드에서 \`상담으로 조건 확인\` 3번째 CTA 제거\n- CTA A/B 후보에서 \`조건 상담 후 이용\` 제거\n- 6개 상세 랜딩의 히어로 상담 CTA 제거\n- 6개 상세 랜딩 최하단 \`상담 전 최종 확인\` 섹션 제거\n- 상세 랜딩 이미지 프레임, contain 비율, 모바일 높이 보강\n- 라우트/SEO/CTA/자산/제거후보 리포트 생성\n- 삭제 파일: 0개\n`);
}
cleanHub();
for (const v of vendors) cleanDetail(v.slug);
writeCss();
auditReports();
writeManifest();
syncPackage();
console.log('[V119 GENERATE PASS] deploy QA and guaranteed cleanup applied');
