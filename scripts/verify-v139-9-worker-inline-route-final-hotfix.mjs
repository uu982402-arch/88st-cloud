import fs from "node:fs";
import { execFileSync } from "node:child_process";
const fail=[];
const read=p=>fs.existsSync(p)?fs.readFileSync(p,"utf8"):"";
const worker=read("_worker.js");
if(!worker.includes("V139_9_INLINE_BLOG_HTML")) fail.push("_worker.js missing V139_9 inline blog HTML fallback");
if(!worker.includes("/blog/minigame-streak-exclusion-guide.html")) fail.push("_worker.js missing safe V9 route");
if((worker.match(/V139_9_INLINE_BLOG_HTML/g)||[]).length < 2) fail.push("inline blog const not referenced");
if(worker.includes("V139_4_STALE_BLOG_ROUTE_REDIRECTS")) fail.push("old V139_4 duplicate symbol remains");
if(worker.includes("V139_8_ROUTE_REDIRECTS")) fail.push("old V139_8 redirect map remains");
if(!fs.existsSync("blog/minigame-streak-exclusion-guide.html")) fail.push("safe V9 blog file missing");
const blog=read("blog/index.html");
if(!blog.includes("/blog/minigame-streak-exclusion-guide.html")) fail.push("blog index does not link safe V9 route");
const pkg=JSON.parse(read("package.json"));
if(!pkg.scripts || !String(pkg.scripts.build||"").includes("build-v139-9-cloudflare-pages-safe.mjs")) fail.push("package build does not point to V139-9 safe build");
try { execFileSync(process.execPath,["--check","_worker.js"],{stdio:"pipe"}); } catch(e) { fail.push("_worker.js node --check failed: "+String(e.stderr||e.message)); }
if(fail.length){ console.error("[V139.9 VERIFY FAIL]\n- "+fail.join("\n- ")); process.exit(1);}
console.log("[V139.9 VERIFY PASS] worker inline V9 fallback and upload-safe build OK");
