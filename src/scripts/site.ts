// Site-wide client behaviour: age/consent gate, instant search, hover scrub, affiliate tracking, shuffle.
declare global { interface Window { gtag?: (...a: unknown[]) => void; __dvrLoadGa?: () => void } }

const root = document.documentElement;
const store = (k: string, v?: string) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { /* private mode */ } return null; };

// ── Gate ─────────────────────────────────────────────
document.getElementById('gate-ok')?.addEventListener('click', () => {
	store('dvr-age', '1');
	if (root.classList.contains('eu')) { store('dvr-consent', 'granted'); window.__dvrLoadGa?.(); }
	root.classList.remove('need-gate');
});
document.getElementById('gate-no')?.addEventListener('click', () => {
	store('dvr-age', '1'); store('dvr-consent', 'denied'); root.classList.remove('need-gate');
});
document.getElementById('cookie-settings')?.addEventListener('click', () => { root.classList.add('need-gate', 'eu'); });

// ── Affiliate click tracking (capture phase, works on touch) ──
document.addEventListener('click', (e) => {
	const a = (e.target as Element)?.closest?.('a[rel~="sponsored"]') as HTMLAnchorElement | null;
	if (!a) return;
	window.gtag?.('event', 'affiliate_click', {
		placement: a.dataset.aff || 'other', studio: a.dataset.studio || '', scene: a.dataset.scene || '',
		link_domain: (() => { try { return new URL(a.href).hostname; } catch { return ''; } })(),
	});
}, true);

// ── Hover scrub through the 5 gallery frames (desktop only) ──
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
	let active: HTMLElement | null = null;
	document.addEventListener('pointermove', (e) => {
		const th = (e.target as Element)?.closest?.('.th[data-frames]') as HTMLElement | null;
		if (active && active !== th) { active.classList.remove('scrubbing'); (active.querySelector('.bar') as HTMLElement).style.width = '0'; active = null; }
		if (!th) return;
		const frames = (th.dataset.frames || '').split('|').filter(Boolean);
		if (!frames.length) return;
		let img = th.querySelector('img.scrub') as HTMLImageElement | null;
		if (!img) {
			img = document.createElement('img'); img.className = 'scrub'; img.alt = ''; img.decoding = 'async';
			th.insertBefore(img, th.querySelector('.b'));
			frames.forEach((f) => { const p = new Image(); p.src = f; }); // warm the 5 frames
		}
		const r = th.getBoundingClientRect();
		const x = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width));
		const i = Math.floor(x * frames.length);
		if (img.dataset.i !== String(i)) { img.src = frames[i]; img.dataset.i = String(i); }
		th.classList.add('scrubbing');
		(th.querySelector('.bar') as HTMLElement).style.width = `${(x * 100).toFixed(1)}%`;
		active = th;
	}, { passive: true });
}

// ── Search (lazy index, loaded on first focus) ─────────
type Row = [string, string, string, number]; // [path, label, kind s/m/c/st, weight]
let idx: Row[] | null = null, loading: Promise<Row[]> | null = null;
const loadIdx = () => (loading ??= fetch('/search-index.json').then((r) => r.json()).then((d: Row[]) => (idx = d)));
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
function find(q: string, n = 10): Row[] {
	if (!idx) return [];
	const terms = norm(q).split(/\s+/).filter(Boolean);
	if (!terms.length) return [];
	const out: [number, Row][] = [];
	for (const r of idx) {
		const l = norm(r[1]);
		let score = 0, ok = true;
		for (const t of terms) { const p = l.indexOf(t); if (p < 0) { ok = false; break; } score += p === 0 || l[p - 1] === ' ' ? 3 : 1; }
		if (!ok) continue;
		score += r[2] === 's' ? 0 : 4; // terms first
		score += Math.log10(1 + r[3]);
		out.push([score, r]);
	}
	return out.sort((a, b) => b[0] - a[0]).slice(0, n).map((x) => x[1]);
}
const input = document.getElementById('q') as HTMLInputElement | null;
const drop = document.getElementById('search-drop');
const KIND: Record<string, [string, string]> = { s: ['Scene', ''], m: ['Model', 'm'], c: ['Category', 'c'], st: ['Studio', 'c'] };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
if (input && drop) {
	let sel = -1;
	const render = () => {
		const rows = find(input.value);
		sel = -1;
		drop.innerHTML = rows.map((r) => `<a href="${r[0]}" role="option"><span class="kind ${KIND[r[2]][1]}">${KIND[r[2]][0]}</span>${esc(r[1])}${r[2] !== 's' ? `<small>${r[3]} scenes</small>` : ''}</a>`).join('')
			+ (input.value.trim() ? `<a href="/search/?q=${encodeURIComponent(input.value.trim())}"><b>See all results for “${esc(input.value.trim())}”</b></a>` : '');
		drop.classList.toggle('on', !!input.value.trim());
	};
	input.addEventListener('focus', () => { loadIdx().then(render); }, { once: false });
	input.addEventListener('input', () => { if (idx) render(); else loadIdx().then(render); });
	input.addEventListener('keydown', (e) => {
		const items = [...drop.querySelectorAll('a')];
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
			items.forEach((a, i) => a.classList.toggle('sel', i === sel));
		} else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = items[sel].href; }
		else if (e.key === 'Escape') drop.classList.remove('on');
	});
	document.addEventListener('click', (e) => { if (!(e.target as Element).closest('.search')) drop.classList.remove('on'); });
}
document.getElementById('search-toggle')?.addEventListener('click', () => {
	document.getElementById('top')?.classList.toggle('search-open'); input?.focus();
});

// ── Shuffle: random scene from the index (no server needed) ──
document.getElementById('shuffle')?.addEventListener('click', (e) => {
	e.preventDefault();
	loadIdx().then((d) => { const s = d.filter((r) => r[2] === 's'); location.href = s[Math.floor(Math.random() * s.length)][0]; });
});

// ── Search results page ─────────────────────────────
const resBox = document.getElementById('search-results');
if (resBox) {
	const q = new URLSearchParams(location.search).get('q') || '';
	if (input) input.value = q;
	const h = document.getElementById('search-title');
	loadIdx().then(() => {
		const rows = find(q, 200);
		if (h) h.textContent = q ? `${rows.length >= 200 ? '200+' : rows.length} results for “${q}”` : 'Search DudeVR';
		resBox.innerHTML = rows.length
			? rows.map((r) => `<a class="pill${r[2] === 'm' ? ' model-pill' : ''}" href="${r[0]}">${esc(r[1])}${r[2] !== 's' ? ` · ${r[3]}` : ''}</a>`).join('')
			: '<p>Nothing found. Try a model name, a studio or a category like “cosplay”.</p>';
	});
}
export {};
