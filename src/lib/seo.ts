// SEO helpers: one place for titles, descriptions and the "is this page indexable" rule.
// Every template and the sitemap read from here so they can never disagree.
import { scenes, type Scene, studioName, modelName, catName, mins, categories, models, byCat, byModel } from './data';
import { TECH } from './scene-copy';

export const TITLE_MAX = 60;
export const DESC_MAX = 155;
const BRAND = ' | DudeVR';

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const cutWords = (s: string, max: number) => {
	if (s.length <= max) return s;
	const cut = s.slice(0, max - 1).replace(/[\s,;:–-]+\S*$/, '');
	return (cut || s.slice(0, max - 1)) + '…';
};

/** First variant that fits; the last resort shortens the main part on a word boundary (never mid-word). */
export function fitTitle(main: string, ...suffixes: string[]): string {
	for (const sfx of suffixes) { const t = clean(main + sfx); if (t.length <= TITLE_MAX) return t; }
	const last = suffixes.at(-1) ?? BRAND;
	return cutWords(clean(main), TITLE_MAX - last.length) + last;
}

/** Lead always; optional parts only while they fit together with the tail. Nothing is cut mid-sentence. */
export function fitDescription(lead: string, optional: string[] = [], tail = ''): string {
	let out = clean(lead);
	for (const o of optional) {
		const cand = clean(`${out} ${o}`);
		if ((cand + (tail ? ' ' + tail : '')).length <= DESC_MAX) out = cand;
	}
	if (tail && (out + ' ' + tail).length <= DESC_MAX) out += ' ' + tail;
	return out.length > DESC_MAX ? cutWords(out, DESC_MAX) : out;
}

const sentences = (html: string) =>
	clean(html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')).split(/(?<=[.!?])\s+/).filter((s) => s.length > 30 && s.length < 150);

const names = (list: string[]) => (list.length > 1 ? `${list.slice(0, -1).join(', ')} & ${list.at(-1)}` : list[0] ?? '');

// ── Scenes: titles + descriptions, made unique across the whole catalogue at build time ──
function sceneTitleBase(s: Scene, extra = '') {
	// The disambiguator lives in the suffix, so shortening a long title never cuts it off.
	const st = studioName(s.st);
	return fitTitle(s.t, `${extra} VR Porn – ${st}${BRAND}`, `${extra} – ${st} VR${BRAND}`, `${extra} VR Porn${BRAND}`, `${extra}${BRAND}`);
}
const sceneTitles = new Map<string, string>();
{
	const first = new Map<string, Scene[]>();
	for (const s of scenes) { const t = sceneTitleBase(s); (first.get(t) ?? first.set(t, []).get(t)!).push(s); }
	const used = new Set<string>();
	for (const [t, list] of first) {
		if (list.length === 1) { sceneTitles.set(list[0].s, t); used.add(t); continue; }
		list.forEach((s, i) => {
			const tries = [
				s.c.includes('passthrough') && /passthrough/.test(s.s) ? ' Passthrough' : '',
				s.m[0] ? ` · ${modelName(s.m[0])}` : '',
				` (${s.d.slice(0, 4)})`,
				` (${studioName(s.st)})`,
				` #${i + 1}`,
			].filter(Boolean);
			let pick = '';
			for (const x of tries) { const c = sceneTitleBase(s, x); if (!used.has(c)) { pick = c; break; } }
			if (!pick) pick = fitTitle(s.t, ` #${s.s.length}${BRAND}`);
			sceneTitles.set(s.s, pick); used.add(pick);
		});
	}
}
export const sceneTitle = (s: Scene) => sceneTitles.get(s.s)!;

const sceneDescs = new Map<string, string>();
{
	const used = new Set<string>();
	for (const s of scenes) {
		const who = names(s.m.slice(0, 3).map(modelName));
		const facts = `${s.len ? `${mins(s.len)}-min ` : ''}${s.res} ${s.fov}° VR scene from ${studioName(s.st)}`;
		const lead = who ? `${who} in “${s.t}”: ${facts}.` : `“${s.t}”: ${facts}.`;
		const tags = s.c.filter((c) => !TECH.has(c)).slice(0, 3).map((c) => catName(c).toLowerCase());
		const opt = [...sentences(s.desc).slice(0, 2), tags.length ? `Tags: ${tags.join(', ')}.` : ''].filter(Boolean);
		const tail = s.mp4 || s.emb ? 'Free 180° trailer.' : 'Full scene on the studio site.';
		let d = fitDescription(lead, opt, tail);
		if (used.has(d)) d = fitDescription(`${lead} Released ${s.d}.`, opt, tail);
		sceneDescs.set(s.s, d); used.add(d);
	}
}
export const sceneDesc = (s: Scene) => sceneDescs.get(s.s)!;

// ── Indexability (templates + sitemap share it) ──
export const modelIndexable = (slug: string) => (byModel.get(slug)?.length ?? 0) > 0;
export const catIndexable = (slug: string) => {
	const c = categories.find((x) => x.slug === slug);
	const n = byCat.get(slug)?.length ?? 0;
	return n >= 3 || (n > 0 && !!c?.desc && c.desc.replace(/<[^>]+>/g, '').length > 300);
};
export const indexableModels = () => models.filter((m) => modelIndexable(m.slug));
export const indexableCats = () => categories.filter((c) => catIndexable(c.slug));
