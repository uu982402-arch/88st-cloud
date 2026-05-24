#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
function read(f){ return fs.readFileSync(path.join(ROOT,f),'utf8'); }
function fail(msg){ console.error('[v68-hotfix verify] ' + msg); process.exitCode = 1; }
const required = [
  'assets/css/v68.mobile-title-hotfix.css',
  'assets/js/v68.mobile-title-hotfix.js',
  'guaranteed/index.html',
  'tools/index.html',
  'consult/index.html',
  'index.html'
];
for (const file of required) if (!fs.existsSync(path.join(ROOT,file))) fail('missing ' + file);
const css = read('assets/css/v68.mobile-title-hotfix.css');
if (!css.includes('grid-template-columns:repeat(5,minmax(0,1fr))')) fail('mobile nav five-column override missing');
if (!css.includes('@media (min-width:721px)')) fail('desktop hide media missing');
if (!css.includes('.v68-section-head h1')) fail('top title hide rule missing');
const g = read('guaranteed/index.html');
if ((g.match(/class="v68-mobile-nav"/g)||[]).length !== 1) fail('/guaranteed mobile nav count not 1');
if ((g.match(/class="v68-fab"/g)||[]).length !== 1) fail('/guaranteed fab count not 1');
for (const name of ['SK 홀딩스','여왕벌','ANY BET','UDT BET','땅콩 BET']) if (!g.includes(name)) fail('/guaranteed missing vendor ' + name);
if (!g.includes('v68.mobile-title-hotfix.css')) fail('/guaranteed missing hotfix css');
if (!g.includes('업체명, 보증금액, 도메인, 가입코드만 바로 확인합니다.')) fail('/guaranteed compact intro missing');
const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.includes('generate-v68-mobile-title-hotfix.mjs')) fail('package build missing hotfix generator');
if (!pkg.scripts.verify.includes('verify-v68-mobile-title-hotfix.mjs')) fail('package verify missing hotfix verifier');
if (process.exitCode) process.exit(process.exitCode);
console.log('[v68-hotfix verify] PASS');
