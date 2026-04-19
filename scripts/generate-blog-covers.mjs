import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const postsPath = path.join(root, 'assets/data/posts.index.v1.20260318.json');
const outDir = path.join(root, 'img/blog');
const obj = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const posts = obj.posts || [];
const esc = (v='') => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const charWeight = (ch='') => ch.charCodeAt(0) < 128 ? 1 : 1.65;
const wrapKorean = (text='', width=14) => {
  const raw = String(text).trim();
  if (!raw) return [];
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    const lines = []; let buf = ''; let count = 0;
    for (const ch of [...raw]) {
      const w = charWeight(ch);
      if (count + w > width && buf) { lines.push(buf); buf = ch; count = w; }
      else { buf += ch; count += w; }
    }
    if (buf) lines.push(buf);
    return lines;
  }
  const lines = []; let buf = ''; let count = 0;
  for (const word of words) {
    const wsum = [...word].reduce((acc, ch) => acc + charWeight(ch), 0);
    const add = wsum + (buf ? 1 : 0);
    if (count + add > width && buf) { lines.push(buf); buf = word; count = wsum; }
    else { buf = `${buf} ${word}`.trim(); count += add; }
  }
  if (buf) lines.push(buf);
  return lines;
};
const themeFor = (post) => {
  const text = [post.kicker, post.slug, post.title, ...(post.keywords || [])].join(' ');
  if (/증거|제보|캡처|입금|proof|evidence|report/i.test(text)) return 'evidence';
  if (/검색|조회|도메인|주소|네임서버|asn|ip|search|domain|telegram/i.test(text)) return 'search';
  if (/메이저|보증업체|안전놀이터|guaranteed|major|safe/i.test(text)) return 'trust';
  if (/실전|운영|이용|출금|롤링|routine|withdraw|rolling/i.test(text)) return 'practice';
  return 'risk';
};
const THEMES = { risk:{bg1:'#f7fafc',bg2:'#eef4f9',ink:'#0f172a',muted:'#516174',accent:'#1f4f7a',accent2:'#7aa8d3',pill:'#e8f1f8'}, search:{bg1:'#f7fbff',bg2:'#eef5fb',ink:'#102236',muted:'#50657b',accent:'#245b84',accent2:'#97b9d4',pill:'#e8f2fb'}, trust:{bg1:'#f9fbfd',bg2:'#eef3f8',ink:'#102033',muted:'#56677a',accent:'#214c70',accent2:'#8fb3ce',pill:'#ebf1f7'}, evidence:{bg1:'#f9fbff',bg2:'#edf3fa',ink:'#102236',muted:'#596b7d',accent:'#235878',accent2:'#8db2c9',pill:'#e8f2f8'}, practice:{bg1:'#fafbfd',bg2:'#eef3f7',ink:'#0f1f30',muted:'#5b6a7a',accent:'#285577',accent2:'#92b5cc',pill:'#edf2f7'} };
const motif = (themeKey, post) => {
  const t = THEMES[themeKey];
  if (themeKey === 'search') return `<circle cx="1245" cy="440" r="120" fill="none" stroke="${t.accent}" stroke-width="22" opacity="0.92"/><path d="M1320 515 L1410 605" stroke="${t.accent}" stroke-width="28" stroke-linecap="round" opacity="0.9"/>`;
  if (themeKey === 'trust') return `<path d="M1240 250 L1385 320 L1360 520 Q1315 635 1240 690 Q1165 635 1120 520 L1095 320 Z" fill="none" stroke="${t.accent}" stroke-width="22" opacity="0.88"/><path d="M1178 445 L1235 505 L1328 392" fill="none" stroke="${t.accent}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>`;
  if (themeKey === 'evidence') return `<rect x="1080" y="290" width="310" height="360" rx="30" fill="rgba(255,255,255,0.45)" stroke="${t.accent}" stroke-width="18"/><path d="M1145 370 H1320" stroke="${t.accent}" stroke-width="14" stroke-linecap="round" opacity="0.88"/>`;
  if (themeKey === 'practice') return `<path d="M1080 590 C1150 500 1205 490 1268 530 C1312 557 1360 565 1415 498" fill="none" stroke="${t.accent}" stroke-width="18" stroke-linecap="round" opacity="0.9"/><circle cx="1090" cy="590" r="20" fill="${t.accent}" opacity="0.95"/>`;
  return `<path d="M1240 250 L1400 540 H1080 Z" fill="rgba(255,255,255,0.45)" stroke="${t.accent}" stroke-width="20"/><path d="M1240 355 V485" stroke="${t.accent}" stroke-width="24" stroke-linecap="round"/>`;
};
fs.mkdirSync(outDir, { recursive: true });
for (const post of posts) {
  const t = THEMES[themeFor(post)];
  const titleLines = wrapKorean(post.title, 13).slice(0, 3);
  const excerptLines = wrapKorean(post.excerpt, 31).slice(0, 2);
  let y = 250;
  const titleSvg = titleLines.map(line => { const out = `<text x="110" y="${y}" font-size="68" font-weight="800" fill="${t.ink}" letter-spacing="-1.8">${esc(line)}</text>`; y += 84; return out; }).join('');
  let ey = y + 18;
  const excerptSvg = excerptLines.map(line => { const out = `<text x="112" y="${ey}" font-size="28" font-weight="500" fill="${t.muted}">${esc(line)}</text>`; ey += 44; return out; }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.bg1}"/><stop offset="100%" stop-color="${t.bg2}"/></linearGradient></defs><rect width="1600" height="900" rx="36" fill="url(#bg)"/><rect x="60" y="56" width="1480" height="788" rx="34" fill="rgba(255,255,255,0.55)" stroke="#dbe4ed"/><text x="112" y="136" font-size="22" font-weight="800" fill="${t.accent}" letter-spacing="3">RAVEN BLOG</text><rect x="112" y="158" width="206" height="46" rx="23" fill="white" fill-opacity="0.88" stroke="#d7e1eb"/><text x="215" y="187" text-anchor="middle" font-size="20" font-weight="700" fill="${t.accent}">${esc(post.kicker)}</text>${titleSvg}${excerptSvg}<text x="112" y="792" font-size="20" font-weight="700" fill="${t.muted}">88st.cloud</text>${motif(themeFor(post), post)}</svg>`;
  fs.writeFileSync(path.join(outDir, `${post.slug}.svg`), svg);
}
console.log(`generated ${posts.length} covers`);
