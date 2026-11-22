/**
 * public/_redirects + public/_headers generator (prebuild).
 * Every old WordPress URL must either exist in dist/ or be 301-redirected here (checked by check-dist.ts).
 * Cloudflare silently drops rules over 2 000 → hard guard. Paths are percent-encoded (ecamx trap 116).
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const rules: string[] = [
	'# legacy WordPress sections',
	'/wishlist/ / 301',
	'/blog/* / 301',
	'/blog/ / 301',
	'/homepage/ / 301',
	'/feed/ /rss.xml 301',
	'/feed/* /rss.xml 301',
	'/comments/feed/ /rss.xml 301',
	'/category/*/feed/ /rss.xml 301',
	'/model/*/feed/ /rss.xml 301',
	'/studio/*/feed/ /rss.xml 301',
	'/*/feed/ /:splat/ 301',
	'/*/amp/ /:splat/ 301',
	'/tag/:t/ /category/:t/ 301',
	'/category/uncategorized/ /vr-porn/ 301',
	'/category/guides/ /vr-porn-headset-guide/ 301',
	'/sitemap.xml /sitemap_index.xml 301',
	'/wp-sitemap.xml /sitemap_index.xml 301',
	'/post-sitemap.xml /sitemap_index.xml 301',
	...Array.from({ length: 30 }, (_, i) => `/post-sitemap${i + 1}.xml /sitemap_index.xml 301`),
	'/page-sitemap.xml /sitemap_index.xml 301',
	'/blog-sitemap.xml /sitemap_index.xml 301',
	'/category-sitemap.xml /sitemap_index.xml 301',
	'/studio-sitemap.xml /sitemap_index.xml 301',
	...Array.from({ length: 10 }, (_, i) => `/model-sitemap${i + 1}.xml /sitemap_index.xml 301`),
	'/model-sitemap.xml /sitemap_index.xml 301',
	'/offerexpiration-sitemap.xml /sitemap_index.xml 301',
	'/wp-login.php / 301',
	'/wp-admin/* / 301',
	'/xmlrpc.php / 301',
	'/category-archive/page/* /category-archive/ 301',
	'/page/:n/ /vr-porn/page/:n/ 301',
];
// Categories/models that existed in WordPress but no longer get a page (should be none; parity check proves it).
const extra = 'seed/legacy/redirects.txt';
if (existsSync(extra)) for (const l of readFileSync(extra, 'utf8').split('\n')) if (l.trim() && !l.startsWith('#')) rules.push(l.trim());
const enc = rules.map((r) => r.startsWith('#') ? r : r.split(' ').map((p, i) => (i < 2 ? encodeURI(decodeURI(p)) : p)).join(' '));
const count = enc.filter((r) => !r.startsWith('#')).length;
if (count > 2000) { console.error(`_redirects has ${count} rules (>2000) — Cloudflare would silently drop the rest`); process.exit(1); }
writeFileSync('public/_redirects', enc.join('\n') + '\n');

writeFileSync('public/_headers', `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Cross-Origin-Opener-Policy: same-origin
  X-Permitted-Cross-Domain-Policies: none
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self), gyroscope=(self), accelerometer=(self)
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/vr/*
  Cache-Control: public, max-age=2592000
/t/*
  Cache-Control: public, max-age=31536000, immutable
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/search-index.json
  Cache-Control: public, max-age=3600
${process.env.DVR_STAGING ? '/*\n  X-Robots-Tag: noindex, nofollow\n' : ''}`);
console.log(`_redirects: ${count} rules`);
