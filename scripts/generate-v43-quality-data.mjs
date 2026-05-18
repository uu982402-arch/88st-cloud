#!/usr/bin/env node
import fs from "fs";
import path from "path";
const ROOT = process.cwd();
const DOMAIN = "https://88st.cloud";
const VERSION = "static-growth-conversion-v43";
function walk(dir,out=[]){for(const name of fs.readdirSync(dir)){if(["node_modules",".git","__MACOSX"].includes(name))continue;const p=path.join(dir,name);const st=fs.statSync(p);if(st.isDirectory())walk(p,out);else out.push(p);}return out;}
function rel(p){return path.relative(ROOT,p).replaceAll(path.sep,"/");}
function route(r){if(r==="index.html")return "/"; if(r.endsWith("/index.html"))return "/"+r.slice(0,-10); return "/"+r;}
function strip(s){return String(s||"").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function meta(html,name){const m=html.match(new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*\\bcontent=["']([^"']*)["'][^>]*>`,"i"));return m?m[1]:"";}
function title(html){const m=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);return strip(m&&m[1]);}
const files=walk(ROOT);
const htmlFiles=files.filter(f=>f.endsWith(".html"));
const pages=htmlFiles.map(file=>{const r=rel(file);const html=fs.readFileSync(file,"utf8");const text=strip(html);const isBlog=r.startsWith("blog/")&&r!=="blog/index.html"&&r.endsWith(".html");return {route:route(r),file:r,title:title(html),description:meta(html,"description"),bytes:Buffer.byteLength(html),words:text.split(/\s+/).filter(Boolean).length,isBlog,hasSchema:/data-v36-schema="primary"|data-v31-schema="primary"/i.test(html),hasCanonical:/<link\b(?=[^>]*rel=["']canonical["'])/i.test(html),hasMetaKeywords:/<meta\b(?=[^>]*name=["']keywords["'])/i.test(html),hasConversionCta:/v36-conversion-cta|CHECK BEFORE ACTION|상담 전 필요한 항목만 먼저 확인하세요/.test(html),hasGuard:/v43-blog-visual-guard/i.test(html)};});
const titleMap=new Map(), descMap=new Map();
for(const p of pages){titleMap.set(p.title,(titleMap.get(p.title)||0)+1);descMap.set(p.description,(descMap.get(p.description)||0)+1);}
const duplicateTitles=[...titleMap].filter(([k,v])=>k&&v>1).map(([title,count])=>({title,count}));
const duplicateDescriptions=[...descMap].filter(([k,v])=>k&&v>1).map(([description,count])=>({description,count}));
const blogPosts=pages.filter(p=>p.isBlog);
const indexingPriority=["/","/blog/","/guaranteed/","/tools/","/consult/",...blogPosts.sort((a,b)=>{
  const aScore=(/world-cup|kbo|online-slot|online-casino|minigame|official-address|rtp|volatility/i.test(a.route)?10:0)+Math.min(a.words/100,10);
  const bScore=(/world-cup|kbo|online-slot|online-casino|minigame|official-address|rtp|volatility/i.test(b.route)?10:0)+Math.min(b.words/100,10);
  return bScore-aScore || a.route.localeCompare(b.route);
}).slice(0,45).map(p=>p.route)].map(path=>DOMAIN+path);
const imageFiles=files.filter(f=>/\.(png|jpe?g|webp|svg|ico)$/i.test(f));
const assetBytes=imageFiles.reduce((n,f)=>n+fs.statSync(f).size,0);
const audit={version:VERSION,generatedAt:new Date().toISOString(),counts:{html:pages.length,blog:blogPosts.length,images:imageFiles.length,imageBytes:assetBytes},seo:{duplicateTitleGroups:duplicateTitles.length,duplicateDescriptionGroups:duplicateDescriptions.length,missingSchema:pages.filter(p=>!p.hasSchema).length,missingCanonical:pages.filter(p=>!p.hasCanonical).length,metaKeywords:pages.filter(p=>p.hasMetaKeywords).length,blogConversionCta:blogPosts.filter(p=>p.hasConversionCta).length,thinPages:pages.filter(p=>p.words<120).length},quality:{blogDetailsWithGuard:blogPosts.filter(p=>p.hasGuard).length,averageBlogWords:Math.round(blogPosts.reduce((n,p)=>n+p.words,0)/Math.max(1,blogPosts.length))},samples:{duplicateTitles:duplicateTitles.slice(0,10),duplicateDescriptions:duplicateDescriptions.slice(0,10),thinPages:pages.filter(p=>p.words<120).slice(0,20).map(p=>p.route)},indexingPriority};
fs.mkdirSync(path.join(ROOT,"assets/data"),{recursive:true});
fs.writeFileSync(path.join(ROOT,"assets/data/v43.quality.audit.json"),JSON.stringify(audit,null,2));
fs.writeFileSync(path.join(ROOT,"assets/data/indexing.priority.v43.json"),JSON.stringify({version:VERSION,generatedAt:audit.generatedAt,urls:indexingPriority},null,2));
fs.writeFileSync(path.join(ROOT,"assets/data/asset.inventory.v43.json"),JSON.stringify({version:VERSION,generatedAt:audit.generatedAt,images:imageFiles.map(f=>({path:"/"+rel(f),bytes:fs.statSync(f).size})).sort((a,b)=>b.bytes-a.bytes).slice(0,120)},null,2));
console.log(`[${VERSION}] quality audit: html=${pages.length} blog=${blogPosts.length} images=${imageFiles.length}`);
