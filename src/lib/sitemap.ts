import { scenes, categories, models, studios, byCat, byModel, byStudio, SITE, isoLen, studioName, modelName } from './data';
export const CHUNK = 2500;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const xml = (body: string) => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
export const sceneChunks = () => Math.ceil(scenes.length / CHUNK);
export function urlset(urls: { loc: string; lastmod?: string; extra?: string }[], video = false) {
	return xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${video ? ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"' : ''}>\n${urls
		.map((u) => `<url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}${u.extra || ''}</url>`).join('\n')}\n</urlset>`);
}
export function sceneUrls(n: number) {
	return scenes.slice(n * CHUNK, (n + 1) * CHUNK).map((s) => ({
		loc: `${SITE}/${s.s}/`, lastmod: s.d,
		extra: s.p && (s.mp4 || s.emb) ? `<video:video><video:thumbnail_loc>${esc(s.p)}</video:thumbnail_loc><video:title>${esc(s.t)}</video:title><video:description>${esc(
			`${s.t} — ${s.res} ${s.fov}° VR scene from ${studioName(s.st)}${s.m.length ? ' with ' + s.m.map(modelName).join(', ') : ''}.`)}</video:description>${s.mp4 ? `<video:content_loc>${esc(s.mp4)}</video:content_loc>` : `<video:player_loc>${esc(s.emb!)}</video:player_loc>`}${s.len ? `<video:duration>${Math.min(s.len, 28800)}</video:duration>` : ''}<video:publication_date>${s.d}T00:00:00+00:00</video:publication_date><video:family_friendly>no</video:family_friendly></video:video>` : '',
	}));
}
const latest = (list: { d: string }[] | undefined) => list?.[0]?.d;
export const termUrls = () => ({
	categories: categories.map((c) => ({ loc: `${SITE}/category/${c.slug}/`, lastmod: latest(byCat.get(c.slug)) })),
	models: models.map((m) => ({ loc: `${SITE}/model/${m.slug}/`, lastmod: latest(byModel.get(m.slug)) })),
	studios: studios.filter((s) => s.count).map((s) => ({ loc: `${SITE}/studio/${s.slug}/`, lastmod: latest(byStudio.get(s.slug)) })),
});
