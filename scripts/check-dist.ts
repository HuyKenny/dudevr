/**
 * Post-build guard (hard fail):
 *  1. URL parity — every URL from the old WordPress sitemaps exists in dist/ or has a 301 in _redirects.
 *  2. File count stays under the Workers Paid static-assets limit (100 000/version; account f3ab is on Workers Paid,
 *     same as auty.cz) with 5 % headroom.
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
const LIMIT = 95000; // 100k hard limit on Workers Paid, keep 5 % headroom
console.log(`dist: ${files} files, ${(bytes / 1e6).toFixed(1)} MB · old URLs ${old.length}, missing ${missing.length}`);
let fail = false;
if (missing.length) { console.error('Old WordPress URLs without page or redirect:\n' + missing.slice(0, 50).join('\n')); fail = true; }
if (files > LIMIT) { console.error(`Too many files: ${files} > ${LIMIT}`); fail = true; }
// ── SEO guard over every HTML page ──
const seen = { title: new Map<string, string>(), desc: new Map<string, string>() };
const problems: Record<string, string[]> = { dupTitle: [], dupDesc: [], longTitle: [], noCanonical: [], noH1: [], noDesc: [], emptyIndexable: [] };
const noindexPaths = new Set<string>();
const linkTargets = new Map<string, string>(); // internal href → first page that links it
const htmlWalk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) htmlWalk(p); else if (f === 'index.html') check(p); } };
const dec = (x: string) => x.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function check(p: string) {
	const html = readFileSync(p, 'utf8');
	const path = '/' + p.slice(DIST.length + 1).replace(/index\.html$/, '');
	for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) if (!linkTargets.has(m[1])) linkTargets.set(m[1], path);
	if (/<meta name="robots" content="noindex/.test(html)) { noindexPaths.add(path); return; }
	if (path === '/404/') return;
	const t = dec(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '');
	const d = dec(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '');
	if (!/<link rel="canonical"/.test(html)) problems.noCanonical.push(path);
	if (!/<h1[ >]/.test(html)) problems.noH1.push(path);
	if (!d) problems.noDesc.push(path);
	if (t.length > 65) problems.longTitle.push(`${path} (${t.length})`);
	if (seen.title.has(t)) problems.dupTitle.push(`${path} = ${seen.title.get(t)}`); else seen.title.set(t, path);
	if (d && seen.desc.has(d)) problems.dupDesc.push(`${path} = ${seen.desc.get(d)}`); else seen.desc.set(d, path);
	if (/^\/(category|model)\//.test(path) && !html.includes('class="card"')) problems.emptyIndexable.push(path);
}
htmlWalk(DIST);
// every internal link must point at a real file (no internal 404s, no internal redirects)
const broken: string[] = [];
for (const [href, from] of linkTargets) {
	const f = href.endsWith('/') ? join(DIST, decodeURI(href), 'index.html') : join(DIST, decodeURI(href));
	if (!existsSync(f)) broken.push(`${href}  (from ${from})`);
}
if (broken.length) { console.error(`SEO broken internal links: ${broken.length}\n  ${broken.slice(0, 10).join('\n  ')}`); fail = true; }
// noindex pages must not be in any sitemap
const inSitemap: string[] = [];
for (const f of readdirSync(DIST)) if (/^sitemap-.*\.xml$/.test(f)) for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>https:\/\/dudevr\.com([^<]*)<\/loc>/g)) if (noindexPaths.has(m[1])) inSitemap.push(m[1]);
for (const [k, v] of Object.entries(problems)) if (v.length) { console.error(`SEO ${k}: ${v.length}\n  ` + v.slice(0, 8).join('\n  ')); fail = true; }
if (inSitemap.length) { console.error(`SEO noindex pages in sitemap: ${inSitemap.length}\n  ${inSitemap.slice(0, 8).join('\n  ')}`); fail = true; }
console.log(`SEO: ${seen.title.size} indexable pages checked, ${noindexPaths.size} noindex`);
const sample = readFileSync(join(DIST, 'index.html'), 'utf8');
if (/WP_APP_PASSWORD|FTP_PASSWORD|CLOUDFLARE_API_TOKEN|-----BEGIN/.test(sample)) { console.error('credential-like string in dist/index.html'); fail = true; }
if (fail) process.exit(1);
