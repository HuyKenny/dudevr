import { urlset } from '../lib/sitemap';
import { SITE, scenes } from '../lib/data';
import { guides } from '../lib/guides';
export const GET = () => urlset([
	{ loc: `${SITE}/`, lastmod: scenes[0]?.d }, { loc: `${SITE}/vr-porn/`, lastmod: scenes[0]?.d }, { loc: `${SITE}/category-archive/` }, { loc: `${SITE}/studios/` }, { loc: `${SITE}/models/` },
	{ loc: `${SITE}/guides/` }, { loc: `${SITE}/vr-cams/` },
	...guides.map((g) => ({ loc: `${SITE}/${g.slug}/`, lastmod: String(g.modified || g.date).slice(0, 10) })),
	...['about', 'contact', 'affiliate-disclosure', 'dmca', 'privacy-cookies', '2257', 'terms'].map((s) => ({ loc: `${SITE}/${s}/` })),
]);
