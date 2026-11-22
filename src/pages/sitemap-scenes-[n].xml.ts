import { urlset, sceneUrls, sceneChunks } from '../lib/sitemap';
export function getStaticPaths() { return Array.from({ length: sceneChunks() }, (_, i) => ({ params: { n: String(i + 1) } })); }
export const GET = ({ params }: { params: { n: string } }) => urlset(sceneUrls(Number(params.n) - 1), true);
