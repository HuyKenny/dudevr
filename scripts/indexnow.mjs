/** IndexNow after a full production deploy: submit URLs of scenes first seen in the last 3 days + hubs. */
import { readFileSync } from 'node:fs';
const KEY = 'e32dcc56797d6a2aa353cf4c19499a86';
const scenes = JSON.parse(readFileSync('src/data/scenes.json', 'utf8'));
const cut = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
const urls = ['/', '/vr-porn/', ...scenes.filter((s) => s.d >= cut).map((s) => `/${s.s}/`)].slice(0, 9000).map((p) => `https://dudevr.com${p}`);
const all = process.argv.includes('--all');
const list = all ? ['/', ...scenes.map((s) => `/${s.s}/`)].map((p) => `https://dudevr.com${p}`) : urls;
for (let i = 0; i < list.length; i += 9000) {
	const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify({ host: 'dudevr.com', key: KEY, keyLocation: `https://dudevr.com/${KEY}.txt`, urlList: list.slice(i, i + 9000) }) });
	console.log(`IndexNow ${r.status} · ${list.slice(i, i + 9000).length} URLs`);
}
