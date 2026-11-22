// Data-driven scene copy for scenes whose feed has no prose (all VRSmash scenes, ~75 % of the site).
// Every sentence is built from facts we hold (cast, studio, tags, length, other scenes of the cast),
// so two pages never read the same and nothing is invented.
import { type Scene, byModel, byStudio, scenes, catName, modelName, studioName, mins, hash, franchises } from './data';

// Tags that describe the file, not the scene — never listed as "what happens".
export const TECH = new Set(['180-vr', '360-vr', '8k-vr-porn', '6k-vr-porn', '4k-vr-porn', '5k-vr-porn', '12k-camera', '8k-vr-blowjob', '6k-vr-blowjob', '4k-vr-blowjob',
	'free-vr-porn', 'free-video', 'free-toy-scripts', 'remastered', 'bonus-videos', 'best-vr-porn', 'award-winning', '2025-top-100-videos', 'non-pov', 'pov', 'male-pov',
	'badoinkvr', '18vr', 'wetvr', 'kinkvr', 'vrcosplayx', 'virtual-taboo', 'passthrough', 'ai-passthrough', 'movie', 'perfect']);
const NATION = new Set(['american', 'european', 'czech-girls', 'slavic', 'canadian', 'british', 'brazilian', 'brazil', 'german', 'japanese', 'thai', 'chinese', 'russian',
	'ukrainian', 'italian', 'australian', 'arab', 'latina', 'latino', 'asian', 'ebony']);
const POSITION = ['cowgirl', 'reverse-cowgirl', 'doggystyle', 'missionary', 'prone-bone', 'spooning', '69', 'standing', 'riding'];
const POS = new Set(POSITION);
const FR = new Set(franchises);
// What the performer looks like — its own sentence, so the "what happens" list stays about the action.
const LOOK = new Set(['blonde', 'brunette', 'redhead', 'blue-eyes', 'colored-hair', 'babe', 'natural-tits', 'big-tits', 'small-tits', 'big-ass', 'tattoo', 'piercing',
	'shaved', 'trimmed-pussy', 'hairy', 'hairy-pussy', 'skinny', 'curvy', 'fitness', 'muscle', 'tan-lines', 'glasses', 'teen', 'teen-18', 'milf', 'mature', 'bbw', 'chubby']);
// Catalogue frequency: rarer tags say more about a scene than "blowjob" (on half the site), so they lead.
const tagFreq = new Map<string, number>();
for (const s of scenes) for (const c of s.c) tagFreq.set(c, (tagFreq.get(c) || 0) + 1);

// Length percentile per resolution, computed once per build.
const lenByRes = new Map<string, number[]>();
for (const s of scenes) if (s.len) { let a = lenByRes.get(s.res); if (!a) lenByRes.set(s.res, (a = [])); a.push(s.len); }
for (const a of lenByRes.values()) a.sort((x, y) => x - y);
function lenPercentile(s: Scene) {
	const a = lenByRes.get(s.res);
	if (!a || a.length < 30 || !s.len) return 0;
	let lo = 0, hi = a.length;
	while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < s.len) lo = m + 1; else hi = m; }
	return Math.round((lo / a.length) * 100);
}

const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0] || '');
const low = (slug: string) => {
	const n = catName(slug);
	return /^[A-Z0-9]{2,}/.test(n) ? n : n.toLowerCase(); // keep "BBW", "POV", "69"
};
const link = (href: string, text: string) => `<a href="${href}">${text}</a>`;

/** Ordinal of this scene in the performer's catalogue (newest = highest), plus the studios they shoot for. */
function castFacts(s: Scene) {
	const m = s.m[0];
	if (!m) return null;
	const all = byModel.get(m) ?? [];
	const studios = [...new Set(all.map((x) => x.st))].filter((st) => st !== s.st);
	return { m, n: all.length, studios };
}

export function sceneCopy(s: Scene): string {
	const h = hash(s.s);
	const who = s.m.map(modelName);
	const animated = s.c.includes('anime') || s.c.includes('hentai') || s.c.includes('cgi-vr-porn');
	const names = list(who) || (animated ? 'animated 3D characters' : s.c.includes('trans') ? 'a trans performer' : 'the performer');
	const min = mins(s.len);
	const acts = s.c.filter((c) => !TECH.has(c) && !NATION.has(c) && !POS.has(c) && !FR.has(c) && !LOOK.has(c) && c !== 'parody' && c !== 'trans' && c !== 'anime')
		.sort((x, y) => (tagFreq.get(x) || 0) - (tagFreq.get(y) || 0)).slice(0, 5);
	const look = s.c.filter((c) => LOOK.has(c)).slice(0, 4);
	const pos = POSITION.filter((p) => s.c.includes(p)).slice(0, 4);
	const nat = s.c.filter((c) => NATION.has(c)).slice(0, 2);
	const fr = s.c.find((c) => FR.has(c));
	const parody = /\bparody\b/i.test(s.t) || s.c.includes('parody');
	const out: string[] = [];

	const len = min ? `${min}-minute ` : '';
	out.push([
		`${names} ${who.length > 1 || (!who.length && animated) ? 'star' : 'stars'} in “${s.t}”, a ${len}${s.res} VR scene shot in ${s.fov}° stereo.`,
		`“${s.t}” ${min ? `runs ${min} minutes and ` : ''}puts you face to face with ${names} in ${s.res} ${s.fov}° VR.`,
		`In “${s.t}” you get ${min ? `${min} minutes of ` : ''}${s.res} virtual reality with ${names}, filmed for ${s.fov}° headsets.`,
	][h % 3]);

	if (parody && fr) out.push(`It is a porn parody from the ${link(`/category/${fr}/`, catName(fr))} universe — costumes, props and the characters you know, at life size.`);
	else if (parody) out.push(`It is a ${link('/category/parody/', 'VR porn parody')}: familiar characters, costumes and props, at life size around you.`);

	if (acts.length) out.push([
		`The scene centres on ${list(acts.map(low))}.`,
		`On the menu: ${list(acts.map(low))}.`,
		`Expect ${list(acts.map(low))}.`,
	][(h >>> 2) % 3]);
	if (pos.length >= 2) out.push(`Positions include ${list(pos.map(low))}${(h >>> 4) % 2 ? ', with the camera at head height for each.' : '.'}`);
	if (who.length === 1 && (look.length >= 2 || nat.length)) {
		const bits = [...nat.map((c) => catName(c).replace(/ girls$/i, '')), ...look.map(low)];
		out.push(`${who[0]} is tagged ${list(bits)}.`);
	}

	const cf = castFacts(s);
	if (cf && cf.n > 1) {
		const more = cf.studios.slice(0, 2).map(studioName);
		out.push(`${link(`/model/${cf.m}/`, modelName(cf.m))} has ${cf.n} VR scenes on DudeVR${more.length ? `, also for ${list(more)}` : ''}.`);
	}
	const pct = lenPercentile(s);
	if (pct >= 70) out.push(`At ${min} minutes it is longer than ${pct} % of the ${s.res} scenes we list.`);
	else if (pct && pct <= 20 && min) out.push(`At ${min} minutes it is one of the shorter ${s.res} scenes — a quick watch.`);

	out.push([
		s.mp4 || s.emb ? ` The full scene streams and downloads on ${studioName(s.st)}; the free preview above shows the look and the camera position.` : ` The full scene streams and downloads on ${studioName(s.st)}.`,
		` Watch the full video on ${studioName(s.st)} in your headset — Quest 3, Pico or PC VR all work.`,
		` ${studioName(s.st)} hosts the full-length version in up to ${s.res}.`,
	][(h >>> 6) % 3].trim());
	return `<p>${out.join(' ')}</p>`;
}

/** Content tags for VideoObject.keywords (no file-format tags). */
export const contentTags = (s: Scene) => s.c.filter((c) => !TECH.has(c)).slice(0, 10).map(catName);

/** "Up next" rail: same studio, most shared tags, never a scene already in the main grid. */
export function upNext(s: Scene, exclude: Set<string>, n = 10) {
	const pool = (byStudio.get(s.st) ?? []).slice(0, 400)
		.filter((x) => x.s !== s.s && !exclude.has(x.s) && !x.m.some((m) => s.m.includes(m)))
		.map((x) => ({ x, score: x.c.filter((c) => s.c.includes(c)).length * 10 - (hash(s.s + x.s) % 7) }))
		.sort((a, b) => b.score - a.score);
	return pool.slice(0, n).map((p) => p.x);
}
