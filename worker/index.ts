/**
 * 404 fallback for dudevr.com. Static assets are served first (free, no Worker run);
 * this script only runs when NO asset matched. It 301-redirects old/unknown URLs to the most relevant
 * real page (scene → model → category) and answers true junk (probes, missing files) with the 404 page.
 * Cost: a few hundred invocations a day, < 1 ms CPU each.
 */
import data from '../src/data/fallback.json';

type Fallback = { cats: [string, number][]; syn: Record<string, string>; models: string[]; studios: string[]; scenes: string[]; feed: Record<string, string> };
const D = data as Fallback;
const CATS = new Map(D.cats);
const MODELS = new Set(D.models);
const STUDIOS = new Set(D.studios);
const SCENES = new Set(D.scenes);
const STOP = new Set(['category', 'categories', 'tag', 'tags', 'model', 'models', 'pornstar', 'pornstars', 'studio', 'studios', 'video', 'videos', 'watch', 'page',
	'vr', 'porn', 'xxx', 'the', 'a', 'an', 'of', 'and', 'with', 'in', 'on', 'for', 'to', 'my', 'your', 'her', 'his', 'pt', 'part', 'vol', 'remastered', 'scene', 'free']);
const catTokens = D.cats.map(([slug, n]) => ({ slug, n, t: slug.split('-').filter((x) => !/^\d+$/.test(x) && x !== 'vr' && x !== 'porn') }));
const modelTokens = D.models.map((slug) => ({ slug, t: slug.split('-') })).filter((m) => m.t.length >= 2);

const tokensOf = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x && !STOP.has(x) && !/^\d+$/.test(x));

function bestCategory(tok: Set<string>): string | null {
	let best: { slug: string; score: number; n: number } | null = null;
	for (const c of catTokens) {
		if (!c.t.length || !c.t.every((x) => tok.has(x))) continue;
		const score = c.t.length;
		if (!best || score > best.score || (score === best.score && c.n > best.n)) best = { slug: c.slug, score, n: c.n };
	}
	return best?.slug ?? null;
}
function bestModel(tok: Set<string>): string | null {
	for (const m of modelTokens) if (m.t.every((x) => tok.has(x))) return m.slug;
	return null;
}
function guess(slug: string): string {
	const tok = new Set(tokensOf(slug));
	const m = bestModel(tok); if (m) return `/model/${m}/`;
	const c = bestCategory(tok); if (c) return `/category/${c}/`;
	return '/category-archive/';
}

function target(path: string): string | null {
	const seg = path.toLowerCase().split('/').filter(Boolean);
	const last = seg.at(-1) ?? '';
	if (last.includes('.')) return null; // missing file or probe (.php, .env, images) → real 404
	if (['wp-admin', 'wp-json', 'wp-includes', 'wp-content', 'api', 'cgi-bin', 'cdn-cgi', '.git', 'vendor', 'ipfs'].includes(seg[0])) return null;
	const [a, b] = seg;
	const cat = (x: string) => (CATS.has(x) ? x : D.syn[x] && CATS.has(D.syn[x]) ? D.syn[x] : null);
	if ((a === 'category' || a === 'tag' || a === 'categories') && b) { const c = cat(b); return c ? `/category/${c}/` : guess(b); }
	if ((a === 'model' || a === 'pornstar' || a === 'pornstars' || a === 'performer') && b) {
		if (MODELS.has(b)) return `/model/${b}/`; // e.g. pagination past the last page
		return bestModel(new Set(tokensOf(b))) ? `/model/${bestModel(new Set(tokensOf(b)))}/` : '/models/';
	}
	if (a === 'studio' && b) return STUDIOS.has(b) ? `/studio/${b}/` : '/studio/vrsmash/'; // VRSmash sub-studios
	if (a === 'vr-porn' || a === 'page') return '/vr-porn/';
	const slug = (a === 'video' || a === 'videos' || a === 'watch') && b ? b : seg.length === 1 ? a : seg.join('-');
	if (!slug) return null;
	if (SCENES.has(slug)) return `/${slug}/`;
	if (D.feed[slug]) return `/${D.feed[slug]}/`;
	return guess(slug);
}

export default {
	async fetch(req: Request, env: { ASSETS: Fetcher }): Promise<Response> {
		const url = new URL(req.url);
		const to = req.method === 'GET' || req.method === 'HEAD' ? target(url.pathname) : null;
		if (to && to !== url.pathname) return new Response(null, { status: 301, headers: { Location: `https://dudevr.com${to}`, 'Cache-Control': 'public, max-age=86400' } });
		const page = await env.ASSETS.fetch(new Request(`${url.origin}/404.html`));
		return new Response(page.body, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=600', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } });
	},
};
