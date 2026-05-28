import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const required=["bonus-rolling-real-receive-check-2026", "domain-change-official-channel-checklist", "slot-rtp-bonus-condition-read-together", "sports-odds-margin-before-bonus", "guaranteed-vendor-card-before-click-mobile", "telegram-consult-code-domain-template", "minigame-rolling-loss-limit-check", "rust-tools-guaranteed-blog-workflow"];
for (const slug of required) {
  const file=path.join(ROOT,'blog',slug,'index.html');
  if (!fs.existsSync(file)) throw new Error('missing V112 post '+slug);
}
console.log('[V112] SEO content small expansion assets present:', required.length);
