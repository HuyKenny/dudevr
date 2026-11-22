import { urlset, termUrls } from '../lib/sitemap';
export const GET = () => urlset(termUrls().models);
