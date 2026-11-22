/**
 * Catalogue sync for dudevr.com.
 *
 *   node --experimental-strip-types scripts/sync.ts            # fetch feeds, rebuild src/data
 *   node --experimental-strip-types scripts/sync.ts --offline  # reuse data/raw (quick mode)
 *
 * Sources (no keys needed):
 *   - VR Bangers network JSON feeds (vrbangers, arporn, vrconk, blowvr, vrbtrans, vrbgay)
 *   - VRSmash pipe-delimited feed (34k rows; only a curated subset gets its own page)
 *   - seed/wp/*.json  = one-time WordPress export (titles, SEO prose, term texts, dates)
 *   - seed/registry.json = slug registry; every URL that ever existed stays forever
 *
 * Output (gitignored): src/data/{scenes,partner,terms,meta}.json
 * Public repo: never print feed bodies, only counts.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'data/raw');
const OUT = join(ROOT, 'src/data');
const SEED = join(ROOT, 'seed');
const OFFLINE = process.argv.includes('--offline');
mkdirSync(RAW, { recursive: true });
mkdirSync(OUT, { recursive: true });

type Studio = { slug: string; name: string; domain: string; token: string; network: 'vrb' | 'vrsmash' };
export const STUDIOS: Studio[] = [
	{ slug: 'vr-bangers', name: 'VR Bangers', domain: 'vrbangers.com', network: 'vrb', token: 'eyJvZmZlcl9pZCI6IjEiLCJhZmZfaWQiOiI4Nzk1IiwiY2FtcGFpZ25faWQiOiIiLCJsaW5rX2lkIjoiNTAyODIiLCJjbGlja19pZCI6ImEwMzkzYmU4LTgzNTItNDkwZi1iOGQwLTdiYTNhMmQ1OTFjOCIsImNyZWF0aXZlX2lkIjoiNzMiLCJ0eXBlIjoibGFuZGluZyJ9' },
	{ slug: 'ar-porn', name: 'AR Porn', domain: 'arporn.com', network: 'vrb', token: 'eyJvZmZlcl9pZCI6IjI4IiwiYWZmX2lkIjoiODc5NSIsImNhbXBhaWduX2lkIjoiIiwibGlua19pZCI6IjUwMjc2IiwiY2xpY2tfaWQiOiJhMDM5M2IxMS1lOTNiLTQwMTUtOGU3MC03OTgzZTQ2NjE0ZDQiLCJjcmVhdGl2ZV9pZCI6Ijg2IiwidHlwZSI6ImxhbmRpbmcifQ==' },
	{ slug: 'vr-conk', name: 'VR Conk', domain: 'vrconk.com', network: 'vrb', token: 'eyJvZmZlcl9pZCI6IjEyIiwiYWZmX2lkIjoiODc5NSIsImNhbXBhaWduX2lkIjoiIiwibGlua19pZCI6IjUwMjc4IiwiY2xpY2tfaWQiOiJhMDM5M2I2Ny0xNzlhLTQ2ZTMtYWNkZS1jMzliNzNkYTQ3YWQiLCJjcmVhdGl2ZV9pZCI6IjYzIiwidHlwZSI6ImxhbmRpbmcifQ==' },
	{ slug: 'blowvr', name: 'BlowVR', domain: 'blowvr.com', network: 'vrb', token: 'eyJvZmZlcl9pZCI6IjE0IiwiYWZmX2lkIjoiODc5NSIsImNhbXBhaWduX2lkIjoiIiwibGlua19pZCI6IjUwMjc3IiwiY2xpY2tfaWQiOiJhMDM5M2IzZC0wNTc5LTQyYWItYTg4MC1kOWEwMzE0MDUwZGMiLCJjcmVhdGl2ZV9pZCI6IjU4IiwidHlwZSI6ImxhbmRpbmcifQ==' },
	{ slug: 'vrb-gay', name: 'VRB Gay', domain: 'vrbgay.com', network: 'vrb', token: 'eyJvZmZlcl9pZCI6IjUiLCJhZmZfaWQiOiI4Nzk1IiwiY2FtcGFpZ25faWQiOiIiLCJsaW5rX2lkIjoiNTAyODAiLCJjbGlja19pZCI6ImEwMzkzYmE0LWU1MWMtNDc3Ny1hMmZkLWVjM2Y1NWY5YjU3NCIsImNyZWF0aXZlX2lkIjoiNDYiLCJ0eXBlIjoibGFuZGluZyJ9' },
	{ slug: 'vrb-trans', name: 'VRB Trans', domain: 'vrbtrans.com', network: 'vrb', token: 'eyJvZmZlcl9pZCI6IjMiLCJhZmZfaWQiOiI4Nzk1IiwiY2FtcGFpZ25faWQiOiIiLCJsaW5rX2lkIjoiNTAyODEiLCJjbGlja19pZCI6ImEwMzkzYmM0LTdlOTktNDJhNy1hMTE2LTA5Zjg5NThjZDZiNiIsImNyZWF0aXZlX2lkIjoiNTIiLCJ0eXBlIjoibGFuZGluZyJ9' },
	{ slug: 'vrsmash', name: 'VRSmash', domain: 'vrsmash.com', network: 'vrsmash', token: '' },
];

const FEEDS: { studio: string; url: string }[] = [
	{ studio: 'vr-bangers', url: 'https://content.vrbangers.com/api/vrbcash/v1/videos' },
	{ studio: 'ar-porn', url: 'https://content.arporn.com/api/vrbcash/v1/videos' },
	{ studio: 'vr-conk', url: 'https://content.vrconk.com/api/vrbcash/v1/videos' },
	{ studio: 'blowvr', url: 'https://content.blowvr.com/api/vrbcash/v1/videos' },
	{ studio: 'vrb-trans', url: 'https://content.vrbtrans.com/api/vrbcash/v1/videos' },
	{ studio: 'vrb-gay', url: 'https://content.vrbgay.com/api/vrbcash/v1/videos' },
];
const VRSMASH_SINCE = process.env.VRSMASH_SINCE || '2025-07-01';
const VRSMASH_FEED = 'https://www.vrsmash.com/api/content/v1/feed/videos';

// Slugs that must never be used by a scene (they are sections of the site).
const RESERVED = new Set(['category', 'studio', 'model', 'models', 'studios', 'categories', 'vr-porn', 'page', 'search', 'category-archive',
	'dmca', 'affiliate-disclosure', 'privacy-cookies', 'cookie-policy', '2257', 'terms', 'about', 'contact', 'vr-cams', 'wishlist', 'blog', 'feed', 'wp-admin', 'wp-content', 'shuffle', 'tag']);

export const slugify = (s: string) =>
	s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const decode = (s: string) =>
	s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
		.replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, '"').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…');

const toSec = (len: string) => {
	const p = (len || '').trim().split(':').map((x) => parseInt(x, 10) || 0);
	if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
	if (p.length === 2) return p[0] * 60 + p[1];
	return 0;
};

/** Keep only safe prose: p, br, h2, h3, strong, em, ul/ol/li, internal links. */
function cleanProse(html: string): string {
	let h = html || '';
	h = h.replace(/<div class="video-container">[\s\S]*?<\/div>/gi, '')
		.replace(/<div class="video-buttons">[\s\S]*?<\/div>/gi, '')
		.replace(/<div class="video-info">[\s\S]*?<\/div>/gi, '')
		.replace(/<div class="(?:gallery|video-gallery)[\s\S]*?<\/div>/gi, '')
		.replace(/<(script|style|iframe|img|figure|video)[\s\S]*?(<\/\1>|\/?>)/gi, '')
		.replace(/\[[^\]]+\]/g, '');
	// links: keep internal ones (relative or dudevr.com), drop the rest but keep text
	h = h.replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, txt: string) => {
		const internal = href.startsWith('/') || /^https?:\/\/(www\.)?dudevr\.com\//.test(href);
		const path = href.replace(/^https?:\/\/(www\.)?dudevr\.com/, '');
		return internal ? `<a href="${path}">${txt}</a>` : txt;
	});
	h = h.replace(/<(\/?)(p|br|h2|h3|strong|b|em|i|ul|ol|li|a)(\s[^>]*)?>/gi, (m, slash, tag, attrs) => {
		tag = tag.toLowerCase();
		if (tag === 'a' && !slash) return m.replace(/\s(?!href)[a-z-]+=("[^"]*"|'[^']*')/gi, '');
		return `<${slash}${tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag}>`;
	});
	h = h.replace(/<(?!\/?(p|br|h2|h3|strong|em|ul|ol|li|a)[\s>\/])[^>]+>/gi, '');
	h = h.replace(/(<br>\s*){2,}/g, '</p><p>').replace(/<p>\s*<\/p>/g, '').replace(/\n{2,}/g, '\n').trim();
	if (h && !/^<(p|h2|h3|ul|ol)/.test(h)) h = `<p>${h}</p>`;
	return h;
}

const plain = (html: string) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function fetchText(url: string, file: string): Promise<string | null> {
	const path = join(RAW, file);
	if (!OFFLINE) {
		for (let i = 0; i < 3; i++) {
			try {
				const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DudeVR-sync/1.0)' }, redirect: 'follow', signal: AbortSignal.timeout(180_000) });
				if (!r.ok) throw new Error(String(r.status));
				const t = await r.text();
				const old = existsSync(path) ? readFileSync(path, 'utf8') : '';
				// Guard: a feed that suddenly shrinks below 50 % is treated as broken.
				if (old && t.length < old.length * 0.5) { console.log(`  ${file}: shrank ${old.length}→${t.length}, keeping previous copy`); return old; }
				writeFileSync(path, t);
				return t;
			} catch (e) {
				console.log(`  ${file}: attempt ${i + 1} failed (${(e as Error).message})`);
				await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
			}
		}
	}
	return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

// ─── Category normalisation ───────────────────────────────────────────────
const CAT_SYNONYMS: Record<string, string> = {
	'blond': 'blonde', 'czech': 'czech-girls', 'ar-porn': 'passthrough', 'tattooed': 'tattoo', 'shaved-pussy': 'shaved', 'oral': 'blowjob',
	'4k-shemale-vr-porn': 'trans', '5k-shemale-vr-porn': 'trans', '6k-shemale-vr-porn': 'trans', '8k-shemale-vr-porn': 'trans', 'shemale': 'trans', 'transgender': 'trans',
	'4k-gay-vr-porn': 'gay', '8k-gay-vr-porn': 'gay', 'best-vr-porn-of-2025': 'best-of-2025', 'best-vr-porn-of-2024': 'best-of-2024', 'best-vr-porn-of-2023': 'best-of-2023',
	'best-vr-porn-of-2022': 'best-of-2022', '12k-vr-porn': '12k-camera', 'balls-licking': 'ball-sucking', 'balls-sucking': 'ball-sucking', 'cum-in-pussy': 'creampie',
	'big-boobs': 'big-tits', 'natural-boobs': 'natural-tits', 'small-boobs': 'small-tits', 'boobjob': 'titty-fuck', 'titjob': 'titty-fuck', 'ebony-girls': 'ebony', 'black': 'ebony',
	'stepmother': 'stepmom', 'step-mom': 'stepmom', 'step-sister': 'stepsister', 'step-dad': 'stepdad', '6k': '6k-vr-porn', '8k': '8k-vr-porn', '4k': '4k-vr-porn', '180': '180-vr', '360': '360-vr',
	'passthrough-ar': 'passthrough', 'mixed-reality': 'passthrough', 'cgi': 'cgi-vr-porn', 'red-head': 'redhead', 'ginger': 'redhead', 'ass': 'big-ass', 'pov-blowjob': 'blowjob',
};
// Feed labels that are noise for taxonomy (formats, internal flags).
const CAT_DROP = new Set(['3d', 'hd', 'pov', 'vr', 'vr-porn', 'virtual-reality', 'free-video', 'the-girl-of-the-month', 'vr-bangers', 'braindance', 'uncategorized', 'bonus-videos', 'nude', 'standing', 'sitting', 'laying', 'moaning']);
const normCat = (name: string) => { const s = slugify(name); if (CAT_DROP.has(s)) return ''; return CAT_SYNONYMS[s] ?? s; };

// ─── Load seed ────────────────────────────────────────────────────────────
type WpTerm = { id: number; slug: string; name: string; description: string; count: number };
const loadJson = <T>(p: string, d: T): T => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : d);
const wpPosts: any[] = loadJson(join(SEED, 'wp/posts.json'), []);
const wpCats: WpTerm[] = loadJson(join(SEED, 'wp/terms-categories.json'), []);
const wpModels: WpTerm[] = loadJson(join(SEED, 'wp/terms-model.json'), []);
const wpStudios: WpTerm[] = loadJson(join(SEED, 'wp/terms-studio.json'), []);
const wpMedia: Record<string, string> = loadJson(join(SEED, 'wp/media.json'), {});
type RegEntry = { k: string; first: string };
const registry: Record<string, RegEntry> = loadJson(join(SEED, 'registry.json'), {});
const keyToSlug = new Map(Object.entries(registry).map(([s, e]) => [e.k, s]));
const today = new Date().toISOString().slice(0, 10);

const catById = new Map(wpCats.map((t) => [t.id, t]));
const modelById = new Map(wpModels.map((t) => [t.id, t]));
const studioById = new Map(wpStudios.map((t) => [t.id, t]));

export type Scene = {
	s: string; t: string; st: string; d: string; len: number; m: string[]; c: string[]; p: string; th: string[];
	mp4?: string; mp4hd?: string; emb?: string; aff: string; ix: boolean; desc: string; res: string; fov: string; pov?: string; src: 'vrb' | 'wp' | 'vrsmash'; ext?: string;
};

const scenes = new Map<string, Scene>(); // slug → scene
const modelNames = new Map<string, string>(); // slug → display name
const catNames = new Map<string, string>();
for (const t of wpCats) catNames.set(t.slug, decode(t.name));
for (const t of wpModels) modelNames.set(t.slug, decode(t.name));

function claimSlug(key: string, wanted: string, first: string): string {
	const known = keyToSlug.get(key);
	if (known) return known;
	let base = slugify(wanted) || 'scene';
	if (RESERVED.has(base)) base = `${base}-vr`;
	let s = base, n = 2;
	while (registry[s] && registry[s].k !== key) s = `${base}-${n++}`;
	registry[s] = { k: key, first };
	keyToSlug.set(key, s);
	return s;
}

const resOf = (cats: string[], trailers: Record<string, string> = {}) => {
	const all = [...cats, ...Object.keys(trailers)].join(' ');
	for (const r of ['12K', '8K', '6K', '5K', '4K']) if (new RegExp(`\\b${r}\\b`, 'i').test(all)) return r;
	return '4K';
};
const uploadDate = (url: string) => { const m = /\/uploads\/(20\d\d)\/(\d\d)\//.exec(url || ''); return m ? `${m[1]}-${m[2]}-01` : ''; };
const stripToken = (u: string) => (u || '').replace(/\?secure=[^/]*\/?$/, '').replace(/\/$/, '');

// ─── 1. WordPress posts (baseline: every old URL keeps existing) ─────────
const wpBySlug = new Map<string, any>();
for (const p of wpPosts) {
	if (!p.studio?.length) continue; // guides etc. are handled as pages
	wpBySlug.set(p.slug, p);
	// Pre-claim every WordPress slug so no new scene can ever take an old URL.
	if (!registry[p.slug]) { registry[p.slug] = { k: `wp:${p.id}`, first: p.date.slice(0, 10) }; keyToSlug.set(`wp:${p.id}`, p.slug); }
}
for (const p of wpPosts) if (!p.studio?.length && !registry[p.slug]) registry[p.slug] = { k: `page:${p.id}`, first: p.date.slice(0, 10) };

// ─── 2. VR Bangers network feeds ─────────────────────────────────────────
const stats: Record<string, number> = {};
const feedUrlToWp = new Map<string, any>();
for (const p of wpBySlug.values()) {
	const m = /href="https:\/\/(?:www\.)?([a-z]+\.com)\/video\/([^/?"]+)/.exec(p.content || '');
	if (m) feedUrlToWp.set(`${m[1]}/${m[2]}`, p);
}
const matchedWp = new Set<number>();

for (const f of FEEDS) {
	const txt = await fetchText(f.url, `${f.studio}.json`);
	if (!txt) { console.log(`  ${f.studio}: no data`); continue; }
	let items: any[] = [];
	try { items = JSON.parse(txt); } catch { console.log(`  ${f.studio}: invalid JSON`); continue; }
	const studio = STUDIOS.find((s) => s.slug === f.studio)!;
	stats[f.studio] = items.length;
	for (const v of items) {
		const feedSlug = String(v.url || '').replace(/\/$/, '').split('/').pop() || '';
		if (!feedSlug) continue;
		const key = `${studio.domain}/${feedSlug}`;
		const wp = feedUrlToWp.get(key) ?? (wpBySlug.get(feedSlug)?.studio?.length ? wpBySlug.get(feedSlug) : undefined);
		const wpStudioOk = wp && wp.studio.some((id: number) => studioById.get(id)?.slug === studio.slug);
		const w = wpStudioOk ? wp : undefined;
		if (w) matchedWp.add(w.id);
		const date = w ? w.date.slice(0, 10) : registry[keyToSlug.get(key) ?? '']?.first || uploadDate(v.video_poster || v.thumbnails?.[0]) || today;
		let slug: string;
		if (w) { slug = w.slug; registry[slug] = { k: key, first: registry[slug]?.first || date }; keyToSlug.set(key, slug); } // WP slug stays canonical
		else slug = claimSlug(key, feedSlug, date);
		if (scenes.has(slug)) continue;
		const cats = new Set<string>();
		for (const c of v.category || []) { const s = normCat(c); if (s) { cats.add(s); if (!catNames.has(s)) catNames.set(s, decode(c)); } }
		if (w) for (const id of w.categories) { const t = catById.get(id); if (t && t.slug !== 'uncategorized') cats.add(t.slug); }
		const models = new Set<string>();
		for (const n of v.models || []) { const s = slugify(n); if (s) { models.add(s); if (!modelNames.has(s)) modelNames.set(s, decode(n).trim()); } }
		if (w) for (const id of w.model) { const t = modelById.get(id); if (t) models.add(t.slug); }
		const tr: Record<string, string> = v.trailers || {};
		const pick = (re: RegExp) => stripToken(Object.entries(tr).find(([k]) => re.test(k))?.[1] || '');
		const mp4 = pick(/HQ/) || pick(/HD/) || Object.values(tr).map(stripToken)[0] || '';
		const mp4hd = pick(/4K/) || pick(/5K/) || '';
		const embM = /src='([^']+)'/.exec(v.embed_link || '') || /src="([^"]+)"/.exec(v.embed_link || '');
		const desc = w ? cleanProse(w.content) : cleanProse(v.description || '');
		const poster = v.video_poster || v.slider_image || v.thumbnails?.[0] || (w && wpMedia[w.featured_media]) || '';
		scenes.set(slug, {
			s: slug, t: decode(w?.title || v.name || '').trim(), st: studio.slug, d: date || today, len: toSec(v.length),
			m: [...models], c: [...cats], p: poster, th: (v.thumbnails || []).slice(0, 5),
			...(mp4 ? { mp4 } : {}), ...(mp4hd ? { mp4hd } : {}), ...(embM ? { emb: embM[1].replace(/\/$/, '') + '/' } : {}),
			aff: `https://${studio.domain}/video/${feedSlug}/?link_data=${studio.token}`,
			ix: true, desc, res: resOf(v.category || [], tr), fov: String(v.degrees?.[0] || '180'), pov: v.POV || undefined, src: 'vrb',
		});
	}
}

// ─── 3. WordPress scenes no longer in any feed: keep them (archived) ─────
let archived = 0;
for (const w of wpBySlug.values()) {
	if (matchedWp.has(w.id)) continue;
	const key = `wp:${w.id}`;
	const slug = claimSlug(key, w.slug, w.date.slice(0, 10));
	if (scenes.has(slug)) continue;
	const st = studioById.get(w.studio[0])?.slug || 'vr-bangers';
	const studio = STUDIOS.find((s) => s.slug === st) ?? STUDIOS[0];
	const c = w.content || '';
	const ifr = /<iframe[^>]+src="([^"]+)"/.exec(c)?.[1] || '';
	const aff = /class="btn-unlock"[^>]*href="([^"]+)"/.exec(c)?.[1] || /href="(https:\/\/[^"]+link_data=[^"]+)"/.exec(c)?.[1]
		|| `https://${studio.domain}/video/${w.slug}/?link_data=${studio.token}`;
	const len = /Length:<\/strong>\s*([\d:]+)/.exec(c)?.[1] || '';
	const isMp4 = /\.mp4/.test(ifr);
	scenes.set(slug, {
		s: slug, t: decode(w.title).trim(), st, d: w.date.slice(0, 10), len: toSec(len),
		m: w.model.map((id: number) => modelById.get(id)?.slug).filter(Boolean), c: w.categories.map((id: number) => catById.get(id)?.slug).filter((x: string) => x && x !== 'uncategorized'),
		p: wpMedia[w.featured_media] || '', th: [], ...(isMp4 ? { mp4: stripToken(ifr) } : ifr ? { emb: ifr } : {}),
		aff: aff.replace(/&amp;/g, '&'), ix: true, desc: cleanProse(c), res: /8k/i.test(c) ? '8K' : '4K', fov: '180', src: 'wp',
	});
	archived++;
}

// ─── 4. VRSmash (curated subset gets a page, the rest is partner-only) ────
const partner: { t: string; p: string; aff: string; len: number; d: string; m: string[]; c: string[]; res: string }[] = [];
let vsIx = 0;
const vsTxt = await fetchText(VRSMASH_FEED, 'vrsmash.txt');
if (vsTxt) {
	const rows = vsTxt.split('\n');
	stats.vrsmash = rows.length;
	for (const line of rows) {
		const f = line.split('| ');
		if (f.length < 10) continue;
		const [id, , url, len, date, title, tags, models, poster] = f;
		const m = /\/video\/([^/?]+)/.exec(url);
		if (!m || !/^https:\/\/(www\.)?vrsmash\.com\//.test(url)) continue;
		const tagList = tags.split(',').map((x) => x.trim()).filter(Boolean);
		const modelList = models.split(',').map((x) => x.trim()).filter(Boolean);
		const cats = [...new Set(tagList.map(normCat).filter(Boolean))];
		const res = resOf(tagList);
		const t = decode(title).trim();
		const lowQuality = /\bPMV\b|compilation|music video/i.test(t) || tagList.includes('PMV') || (tagList.includes('CGI') && !modelList.length);
		const key = `vrsmash.com/${m[1]}`;
		// Never shadow a VRB scene (VRSmash re-lists some of them; the VRB copy has a real trailer).
		const dup = scenes.has(m[1]) && !keyToSlug.get(key);
		// Curated: recent (since 07/2025), 8K+, a named performer, 25+ minutes → ~4k pages. Tune VRSMASH_SINCE to grow it slowly.
		const indexable = !dup && !lowQuality && date.slice(0, 10) >= VRSMASH_SINCE && (res === '8K' || res === '12K') && modelList.length > 0 && toSec(len) >= 1500 && !!poster;
		if (indexable) {
			const slug = claimSlug(key, m[1], date.slice(0, 10));
			for (const n of modelList) { const s = slugify(n); if (s && !modelNames.has(s)) modelNames.set(s, n); }
			for (const tg of tagList) { const s = normCat(tg); if (s && !catNames.has(s)) catNames.set(s, decode(tg)); }
			scenes.set(slug, {
				s: slug, t, st: 'vrsmash', d: date.slice(0, 10), len: toSec(len), m: modelList.map(slugify), c: cats, p: poster.trim(), th: [],
				aff: url.trim(), ix: true, desc: '', res, fov: tagList.includes('360') ? '360' : '180', src: 'vrsmash', ext: id,
			});
			vsIx++;
		} else if (!dup && !lowQuality && poster) {
			partner.push({ t, p: poster.trim(), aff: url.trim(), len: toSec(len), d: date.slice(0, 10), m: modelList.slice(0, 3), c: cats.slice(0, 6), res });
		}
	}
}

// ─── 5. Taxonomies ────────────────────────────────────────────────────────
const all = [...scenes.values()].sort((a, b) => (b.d === a.d ? a.s.localeCompare(b.s) : b.d.localeCompare(a.d)));
const catCount = new Map<string, number>(), modelCount = new Map<string, number>();
for (const s of all) { for (const c of s.c) catCount.set(c, (catCount.get(c) || 0) + 1); for (const m of s.m) modelCount.set(m, (modelCount.get(m) || 0) + 1); }
const wpCatSet = new Set(wpCats.map((t) => t.slug)), wpModelSet = new Set(wpModels.map((t) => t.slug));
const catPages = [...catCount.keys(), ...wpCatSet].filter((c, i, a) => a.indexOf(c) === i && c !== 'uncategorized' && c !== 'guides')
	.filter((c) => wpCatSet.has(c) || (catCount.get(c) || 0) >= 12);
const modelPages = [...new Set([...modelCount.keys(), ...wpModelSet])].filter((m) => wpModelSet.has(m) || (modelCount.get(m) || 0) >= 2);
const catKeep = new Set(catPages), modelKeep = new Set(modelPages);
for (const s of all) { s.c = s.c.filter((c) => catKeep.has(c)); s.m = s.m.filter((m) => modelKeep.has(m)); }

const terms = {
	studios: STUDIOS.map((s) => ({ slug: s.slug, name: s.name, domain: s.domain, aff: s.token ? `https://${s.domain}/?link_data=${s.token}` : `https://www.vrsmash.com/`,
		count: all.filter((x) => x.st === s.slug).length, desc: cleanProse(wpStudios.find((w) => w.slug === s.slug)?.description || '') })),
	categories: catPages.map((slug) => { const w = wpCats.find((t) => t.slug === slug);
		return { slug, name: decode(w?.name || catNames.get(slug) || slug), count: catCount.get(slug) || 0, desc: cleanProse(w?.description || '') }; })
		.sort((a, b) => b.count - a.count),
	models: modelPages.map((slug) => { const w = wpModels.find((t) => t.slug === slug);
		const first = all.find((x) => x.m.includes(slug));
		return { slug, name: decode(w?.name || modelNames.get(slug) || slug), count: modelCount.get(slug) || 0, desc: cleanProse(w?.description || ''),
			img: first?.th?.[1] || first?.th?.[0] || first?.p || '' }; })
		.sort((a, b) => b.count - a.count),
};

// ─── 6. Write ─────────────────────────────────────────────────────────────
writeFileSync(join(OUT, 'scenes.json'), JSON.stringify(all));
writeFileSync(join(OUT, 'partner.json'), JSON.stringify(partner.sort((a, b) => b.d.localeCompare(a.d))));
writeFileSync(join(OUT, 'terms.json'), JSON.stringify(terms));
writeFileSync(join(OUT, 'meta.json'), JSON.stringify({ built: new Date().toISOString(), stats, scenes: all.length, archived, vrsmashIndexed: vsIx, partner: partner.length }));
// Registry only grows; sort for stable diffs.
writeFileSync(join(SEED, 'registry.json'), JSON.stringify(Object.fromEntries(Object.entries(registry).sort(([a], [b]) => a.localeCompare(b))), null, 0).replace(/},"/g, '},\n"') + '\n');

console.log('feeds', stats);
console.log(`scenes ${all.length} (archived WP ${archived}, VRSmash pages ${vsIx}) · partner cards ${partner.length} · categories ${catPages.length} · models ${modelPages.length}`);
