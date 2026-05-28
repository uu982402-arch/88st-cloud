import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const pages=['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'].map(s=>`guaranteed/${s}/index.html`);
for(const p of pages){let f=path.join(ROOT,p); if(!fs.existsSync(f)) throw new Error(`missing ${p}`); let h=fs.readFileSync(f,'utf8'); if(!h.includes('data-v113-guaranteed-detail-depth="true"')) h=h.replace('<body ','<body data-v113-guaranteed-detail-depth="true" '); if(!h.includes('/assets/css/v113-guaranteed-detail-content-depth.css')) h=h.replace('</head>','  <meta name="v113-guaranteed-detail-content-depth" content="V113_GUARANTEED_DETAIL_CONTENT_DEPTH_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v113-guaranteed-detail-content-depth.css?v=v113-guaranteed-detail-content-depth-20260528" data-v113-guaranteed-detail-depth="true">\n  <script defer src="/assets/js/v113-guaranteed-detail-content-depth.js?v=v113-guaranteed-detail-content-depth-20260528" data-v113-guaranteed-detail-depth="true"></script>\n</head>'); fs.writeFileSync(f,h);}
fs.writeFileSync(path.join(ROOT,'build.txt'),'88ST.Cloud build V113 GUARANTEED DETAIL CONTENT DEPTH PATCH\n2026-05-28T00:00:00.000Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'),"window.__RUST_BUILD_VERSION__ = 'V113-GUARANTEED-DETAIL-CONTENT-DEPTH-20260528';\nwindow.__RUST_BUILD_LABEL__ = 'V113 GUARANTEED DETAIL CONTENT DEPTH PATCH';\n");
console.log('[V113] guaranteed detail content depth assets checked');
