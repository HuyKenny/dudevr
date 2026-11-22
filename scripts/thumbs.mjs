/**
 * Card thumbnails: network posters are 200–700 kB each; a 36-card grid would weigh ~10 MB.
 * We resize each scene poster ONCE to a 480×270 WebP (~20 kB) and serve it as a static asset (free).
 * Incremental: existing files are kept (CI restores public/t from actions/cache), only new scenes download.
 *
 *   node scripts/thumbs.mjs            # all scenes
 *   node scripts/thumbs.mjs --max 300  # at most N new downloads this run
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';

const OUT = 'public/t';
mkdirSync(OUT, { recursive: true });
const scenes = JSON.parse(readFileSync('src/data/scenes.json', 'utf8'));
const models = JSON.parse(readFileSync('src/data/terms.json', 'utf8')).models;
const maxArg = process.argv.indexOf('--max');
const MAX = maxArg > 0 ? Number(process.argv[maxArg + 1]) : Infinity;
const map = {};
const todo = [];
const want = new Set();
for (const s of scenes) {
	const file = `${s.s}.webp`;
	want.add(file);
	if (existsSync(`${OUT}/${file}`)) map[s.s] = `/t/${file}`;
	else if (s.p) todo.push(s);
}
let done = 0, failed = 0;
const queue = todo.slice(0, MAX);
async function one(s) {
	try {
		let buf;
		if (s.p.startsWith('/')) buf = readFileSync('public' + s.p); // local legacy copy
		else {
			const r = await fetch(s.p, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DudeVR-thumbs/1.0)' }, signal: AbortSignal.timeout(30000) });
			if (!r.ok) throw new Error(String(r.status));
			buf = Buffer.from(await r.arrayBuffer());
		}
		await sharp(buf).resize(480, 270, { fit: 'cover', position: 'attention' }).webp({ quality: 66, effort: 4 }).toFile(`${OUT}/${s.s}.webp`);
		map[s.s] = `/t/${s.s}.webp`;
		done++;
	} catch { failed++; }
}
const CONC = 8;
for (let i = 0; i < queue.length; i += CONC) {
	await Promise.all(queue.slice(i, i + CONC).map(one));
	if (i % 400 === 0 && i) console.log(`  thumbs ${i}/${queue.length}`);
}
// prune thumbnails of scenes that no longer exist (keeps file count honest)
let pruned = 0;
for (const f of readdirSync(OUT)) if (!want.has(f)) { unlinkSync(`${OUT}/${f}`); pruned++; }
writeFileSync('src/data/thumbs.json', JSON.stringify(map));
console.log(`thumbs: ${Object.keys(map).length} ready, ${done} new, ${failed} failed, ${todo.length - queue.length} deferred, ${pruned} pruned`);
