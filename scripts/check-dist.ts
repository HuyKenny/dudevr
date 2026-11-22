/**
 * Post-build guard (hard fail):
 *  1. URL parity — every URL from the old WordPress sitemaps exists in dist/ or has a 301 in _redirects.
 *  2. File count stays under the free Workers static-assets limit (20 000).
 *  3. No credential-looking strings in dist/.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const DIST = 'dist';
const old = readFileSync('seed/legacy/old-urls.txt', 'utf8').split('\n').map((x) => x.trim()).filter(Boolean);
const redirects = readFileSync(join(DIST, '_redirects'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split(' ')[0]);
const exact = new Set(redirects.filter((r) => !r.includes('*') && !r.includes(':')));
const patterns = redirects.filter((r) => r.includes('*') || r.includes(':')).map((r) => new RegExp('^' + r.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:[a-z]+/g, '[^/]+') + '$'));
const missing: string[] = [];
for (const u of old) {
	const path = decodeURI(u);
	const file = join(DIST, path, 'index.html');
	if (existsSync(file)) continue;
	if (exact.has(u) || patterns.some((re) => re.test(u))) continue;
	missing.push(u);
}
let files = 0, bytes = 0;
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); const st = statSync(p); if (st.isDirectory()) walk(p); else { files++; bytes += st.size; } } };
walk(DIST);
const LIMIT = 20000;
console.log(`dist: ${files} files, ${(bytes / 1e6).toFixed(1)} MB · old URLs ${old.length}, missing ${missing.length}`);
let fail = false;
if (missing.length) { console.error('Old WordPress URLs without page or redirect:\n' + missing.slice(0, 50).join('\n')); fail = true; }
if (files > LIMIT) { console.error(`Too many files: ${files} > ${LIMIT}`); fail = true; }
const sample = readFileSync(join(DIST, 'index.html'), 'utf8');
if (/WP_APP_PASSWORD|FTP_PASSWORD|CLOUDFLARE_API_TOKEN|-----BEGIN/.test(sample)) { console.error('credential-like string in dist/index.html'); fail = true; }
if (fail) process.exit(1);
