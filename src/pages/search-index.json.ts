import { scenes, categories, models, studios, studioName } from '../lib/data';
// [path, label, kind, weight] — stable URL (no hash) so the CDN can cache it between deploys.
export const GET = () => new Response(JSON.stringify([
	...studios.filter((s) => s.count).map((s) => [`/studio/${s.slug}/`, s.name, 'st', s.count]),
	...categories.filter((c) => c.count).map((c) => [`/category/${c.slug}/`, c.name, 'c', c.count]),
	...models.filter((m) => m.count).map((m) => [`/model/${m.slug}/`, m.name, 'm', m.count]),
	...scenes.map((s) => [`/${s.s}/`, `${s.t} · ${studioName(s.st)}`, 's', 0]),
]), { headers: { 'Content-Type': 'application/json' } });
