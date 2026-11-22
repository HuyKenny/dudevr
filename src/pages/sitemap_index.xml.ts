import { xml, sceneChunks } from '../lib/sitemap';
import { scenes, SITE } from '../lib/data';
export const GET = () => {
	const lm = scenes[0]?.d;
	const maps = ['sitemap-pages.xml', ...Array.from({ length: sceneChunks() }, (_, i) => `sitemap-scenes-${i + 1}.xml`), 'sitemap-categories.xml', 'sitemap-studios.xml', 'sitemap-models.xml'];
	return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps.map((m) => `<sitemap><loc>${SITE}/${m}</loc><lastmod>${lm}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>`);
};
