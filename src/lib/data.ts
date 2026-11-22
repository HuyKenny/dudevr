// Build-time data access. Everything here runs once at `astro build`; nothing ships to the browser.
import scenesRaw from '../data/scenes.json';
import termsRaw from '../data/terms.json';
import partnerRaw from '../data/partner.json';

export type Scene = {
	s: string; t: string; st: string; d: string; len: number; m: string[]; c: string[]; p: string; th: string[];
	mp4?: string; mp4hd?: string; emb?: string; aff: string; ix: boolean; desc: string; res: string; fov: string; pov?: string;
	src: 'vrb' | 'wp' | 'vrsmash'; ext?: string;
};
export type Term = { slug: string; name: string; count: number; desc: string; img?: string };
export type StudioT = Term & { domain: string; aff: string };
export type Partner = { t: string; p: string; aff: string; len: number; d: string; m: string[]; c: string[]; res: string };

export const SITE = 'https://dudevr.com';
export const PER_PAGE = 40; // 8 full rows of 5 on desktop
export const VR_CAMS = 'https://www.sexlikereal.com/vr-cam-girls?a=690b8265580cda31a7057b98';
export const GA4_ID = 'G-7R93X0W1DD';
/** Absolute URL for meta tags, JSON-LD and sitemaps (local images are stored as /path). */
export const abs = (u: string) => (u && u.startsWith('/') ? `https://dudevr.com${u}` : u);

export const scenes = scenesRaw as Scene[];
export const partner = partnerRaw as Partner[];
const terms = termsRaw as { studios: StudioT[]; categories: Term[]; models: Term[] };
export const studios = terms.studios;
export const categories = terms.categories;
export const models = terms.models;

export const sceneBySlug = new Map(scenes.map((s) => [s.s, s]));
export const studioBySlug = new Map(studios.map((s) => [s.slug, s]));
export const catBySlug = new Map(categories.map((c) => [c.slug, c]));
export const modelBySlug = new Map(models.map((m) => [m.slug, m]));

const index = (key: (s: Scene) => string[]) => {
	const m = new Map<string, Scene[]>();
	for (const s of scenes) for (const k of key(s)) { let a = m.get(k); if (!a) m.set(k, (a = [])); a.push(s); }
	return m;
};
export const byStudio = index((s) => [s.st]);
export const byCat = index((s) => s.c);
export const byModel = index((s) => s.m);
// Free VR porn: full free scenes first, then free trailers (newest first within each group).
byCat.get('free-vr-porn')?.sort((a, b) => ((b as any).free ? 1 : 0) - ((a as any).free ? 1 : 0) || (b.d === a.d ? a.s.localeCompare(b.s) : b.d.localeCompare(a.d)));

/** Scenes whose own page carries a real playable trailer — used for hero/featured spots. */
export const playable = scenes.filter((s) => s.mp4);

export function fmtLen(sec: number) {
	if (!sec) return '';
	const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
	return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}
export const isoLen = (sec: number) => `PT${Math.floor(sec / 3600) ? Math.floor(sec / 3600) + 'H' : ''}${Math.floor((sec % 3600) / 60)}M${sec % 60}S`;
export const mins = (sec: number) => Math.round(sec / 60);

export const studioName = (slug: string) => studioBySlug.get(slug)?.name ?? slug;
export const modelName = (slug: string) => modelBySlug.get(slug)?.name ?? slug;
export const catName = (slug: string) => catBySlug.get(slug)?.name ?? slug;

/** Pagination helper for [...page] routes: page 1 = base URL, page N = base/page/N/. */
export function pages<T>(items: T[], per = PER_PAGE) {
	const n = Math.max(1, Math.ceil(items.length / per));
	return Array.from({ length: n }, (_, i) => ({ page: i + 1, total: n, items: items.slice(i * per, (i + 1) * per) }));
}
export const pageParam = (p: number) => (p === 1 ? undefined : `page/${p}`);
export const pageUrl = (base: string, p: number) => (p === 1 ? base : `${base}page/${p}/`);

/** Related scenes: same models first, then studio + shared categories. Deterministic. */
export function related(s: Scene, n = 12) {
	const seen = new Set([s.s]);
	const out: Scene[] = [];
	const push = (x: Scene) => { if (!seen.has(x.s) && out.length < n) { seen.add(x.s); out.push(x); } };
	for (const m of s.m) for (const x of byModel.get(m) ?? []) push(x);
	const pool = (byStudio.get(s.st) ?? []).map((x) => ({ x, score: x.c.filter((c) => s.c.includes(c)).length })).sort((a, b) => b.score - a.score);
	for (const { x } of pool.slice(0, 80)) push(x);
	for (const c of s.c) for (const x of (byCat.get(c) ?? []).slice(0, 20)) push(x);
	return out;
}

/** Cheap stable hash → used to vary copy and pick "scene of the day". */
export function hash(str: string) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/** Card thumbnail: local WebP when generated at build, else the network's own image. */
import thumbMap from '../data/thumbs.json';
const tm = thumbMap as Record<string, string>;
export const thumb = (s: { s?: string; p: string }) => (s.s && tm[s.s]) || s.p;

/** Sorts used by archive pages. */
export const newest = (a: Scene, b: Scene) => (b.d === a.d ? a.s.localeCompare(b.s) : b.d.localeCompare(a.d));

/** Money pages that get extra internal links everywhere (Bing traffic drivers). */
export const MONEY = [
	{ href: '/category/free-vr-porn/', label: 'Free VR Porn' },
	{ href: '/category/anime/', label: 'Anime VR Porn' },
];

export const TOP_CATS = ['blowjob', 'passthrough', 'milf', 'teen', 'cosplay', 'parody', 'anal', 'big-tits', 'asian', 'latina', 'threesome', 'creampie', 'ebony', 'lesbian',
	'trans', 'gay', 'redhead', 'stockings', 'lingerie', 'anime', 'free-vr-porn', '8k-vr-porn', 'pov', 'massage', 'squirt', 'japanese', 'interracial', 'hentai'];

/** Scene description fallback for scenes without their own prose (VRSmash): factual, varied, no fluff. */
export function autoDesc(s: Scene): string {
	const who = s.m.map(modelName);
	const names = who.length > 1 ? `${who.slice(0, -1).join(', ')} and ${who.at(-1)}` : who[0] || 'the cast';
	const tags = s.c.slice(0, 5).map(catName).map((t) => t.toLowerCase());
	const h = hash(s.s);
	const openers = [
		`${names} star in “${s.t}”, a ${mins(s.len)}-minute ${s.res} VR scene shot in ${s.fov}° stereo.`,
		`“${s.t}” runs ${mins(s.len)} minutes and puts you face to face with ${names} in ${s.res} ${s.fov}° VR.`,
		`In “${s.t}” you get ${mins(s.len)} minutes of ${s.res} virtual reality with ${names}, filmed for ${s.fov}° headsets.`,
	];
	const mid = tags.length ? ` Expect ${tags.slice(0, -1).join(', ')}${tags.length > 1 ? ' and ' : ''}${tags.at(-1)}.` : '';
	const close = [
		` The full scene streams and downloads on ${studioName(s.st)}; the preview below shows the look and the camera position.`,
		` Watch the full video on ${studioName(s.st)} in your headset — Quest 3, Pico or PC VR all work.`,
		` ${studioName(s.st)} hosts the full-length version in up to ${s.res}.`,
	];
	return `<p>${openers[h % 3]}${mid}${close[(h >> 3) % 3]}</p>`;
}

export const STUDIO_SCORE: Record<string, string> = { 'vr-bangers': '9.8', 'ar-porn': '9.5', 'vr-conk': '9.2', blowvr: '8.9', 'vrb-trans': '8.7', 'vrb-gay': '8.5', vrsmash: '8.8' };
export const STUDIO_COLOR: Record<string, string> = { 'vr-bangers': '#ff6b5a', 'ar-porn': '#6be3b5', 'vr-conk': '#7cc4ff', blowvr: '#ffd23f', 'vrb-trans': '#f7a1d6', 'vrb-gay': '#b69cff', vrsmash: '#ff9f43' };
export const STUDIO_TAGLINE: Record<string, string> = {
	'vr-bangers': 'Flagship 8K studio, big-name stars',
	'ar-porn': 'Passthrough & mixed reality for Quest 3',
	'vr-conk': 'Cosplay and parody productions',
	blowvr: 'Close-up POV oral scenes',
	'vrb-trans': 'Trans VR from the VRB network',
	'vrb-gay': 'Gay VR from the VRB network',
	vrsmash: 'Huge multi-studio VR library',
};
/** Pick the first scene image for a term tile. */
export const termImage = (list: Scene[] | undefined) => (list && list[0] ? thumb(list[0]) : '/mascot-sticker.png');
export const jsonCrumbs = (items: { name: string; path: string }[]) => ({
	'@context': 'https://schema.org', '@type': 'BreadcrumbList',
	itemListElement: [{ name: 'Home', path: '/' }, ...items].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE + c.path })),
});
export const jsonItemList = (list: Scene[]) => ({
	'@context': 'https://schema.org', '@type': 'ItemList',
	itemListElement: list.slice(0, 30).map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/${s.s}/`, name: s.t })),
});

// Model avatar = the small local WebP of their newest scene (never the 2 MB gallery frame).
for (const m of models) { const first = byModel.get(m.slug)?.[0]; if (first) m.img = thumb(first); }
