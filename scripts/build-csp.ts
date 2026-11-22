/**
 * Content-Security-Policy generated from the BUILT site (postbuild), never copied by hand:
 *  - sha256 hashes of every inline <script> that is executable (JSON-LD is data, not script)
 *  - media/frame hosts taken from the catalogue (trailer CDNs, studio embed players)
 * The policy is appended to dist/_headers for "/*". A new trailer host or inline script updates it automatically.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const DIST = 'dist';
const hashes = new Set<string>();
const walk = (d: string) => {
	for (const f of readdirSync(d)) {
		const p = join(d, f);
		if (statSync(p).isDirectory()) walk(p);
		else if (f.endsWith('.html')) {
			const html = readFileSync(p, 'utf8');
			for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
				if (/type="application\/ld\+json"/.test(m[1]) || !m[2].trim()) continue;
				hashes.add(`'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`);
			}
		}
	}
};
walk(DIST);
const scenes = JSON.parse(readFileSync('src/data/scenes.json', 'utf8')) as { mp4?: string; emb?: string }[];
const host = (u?: string) => { try { return u ? new URL(u).host : ''; } catch { return ''; } };
const media = [...new Set(scenes.map((s) => host(s.mp4)).filter(Boolean))].map((h) => `https://${h}`);
const frames = [...new Set(scenes.map((s) => host(s.emb)).filter(Boolean))].map((h) => `https://${h}`);
if (hashes.size > 40) { console.error(`CSP: ${hashes.size} distinct inline scripts — something generates per-page inline JS`); process.exit(1); }
const csp = [
	"default-src 'self'",
	`script-src 'self' ${[...hashes].join(' ')} https://www.googletagmanager.com`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self'",
	`media-src 'self' blob: ${media.join(' ')}`,
	`frame-src ${frames.join(' ')}`,
	`connect-src 'self' ${media.join(' ')} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`,
	"worker-src 'self' blob:",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	'upgrade-insecure-requests',
].join('; ');
const hp = join(DIST, '_headers');
const h = readFileSync(hp, 'utf8').replace(/^\/\*\n/m, `/*\n  Content-Security-Policy: ${csp}\n`);
writeFileSync(hp, h);
console.log(`CSP: ${hashes.size} inline script hashes, ${media.length} media hosts, ${frames.length} frame hosts`);
