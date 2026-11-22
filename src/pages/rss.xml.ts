import { scenes, SITE, studioName } from '../lib/data';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const GET = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>DudeVR — newest VR scenes</title><link>${SITE}/</link><description>Newest VR porn trailers on DudeVR</description>
${scenes.slice(0, 50).map((s) => `<item><title>${esc(s.t)} – ${esc(studioName(s.st))}</title><link>${SITE}/${s.s}/</link><guid>${SITE}/${s.s}/</guid><pubDate>${new Date(s.d + 'T00:00:00Z').toUTCString()}</pubDate></item>`).join('\n')}
</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
