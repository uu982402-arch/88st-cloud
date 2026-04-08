import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const out = resolve(process.cwd(), 'build.txt');
mkdirSync(dirname(out), { recursive: true });
const stamp = new Date().toISOString();
writeFileSync(out, `build=${stamp}\n`, 'utf8');
console.log(`Build shim complete: ${out}`);
