import { urlset } from '../lib/sitemap';
import { SITE, scenes } from '../lib/data';
import wpPosts from '../../seed/wp/posts.json';
export const GET = () => urlset([
	{ loc: `${SITE}/`, lastmod: scenes[0]?.d }, { loc: `${SITE}/vr-porn/`, lastmod: scenes[0]?.d }, { loc: `${SITE}/category-archive/` }, { loc: `${SITE}/studios/` }, { loc: `${SITE}/models/` },
	...(wpPosts as any[]).filter((p) => !p.studio?.length).map((p) => ({ loc: `${SITE}/${p.slug}/`, lastmod: String(p.modified || p.date).slice(0, 10) })),
	...['about', 'contact', 'affiliate-disclosure', 'dmca', 'privacy-cookies', '2257', 'terms'].map((s) => ({ loc: `${SITE}/${s}/` })),
]);
