// Editorial guides: the WordPress-era posts (seed/wp) plus guides written for the content gap of 11/2026
// (Ahrefs US: "how to watch vr porn" / "oculus porn" / "quest 3 porn" ≈ 6k/mo, "best vr porn sites" ≈ 7k/mo,
// "best vr headset for porn" ≈ 3k/mo). Numbers in the copy are computed from the catalogue at build time.
import wpPosts from '../../seed/wp/posts.json';
import { studios, byStudio, byCat, VR_CAMS, STUDIO_SCORE, mins } from './data';

export type Guide = { slug: string; title: string; h1?: string; desc?: string; date: string; modified: string; content: string; faq?: [string, string][] };

const fmt = (n: number) => n.toLocaleString('en-US');
const n = (cat: string) => fmt(byCat.get(cat)?.length ?? 0);
const aff = (slug: string, where: string) => {
	const st = studios.find((s) => s.slug === slug)!;
	return `<a href="${st.aff}" rel="sponsored noopener" target="_blank" data-aff="guide_${where}" data-studio="${slug}">${st.name}</a>`;
};
function studioFacts(slug: string) {
	const list = byStudio.get(slug) ?? [];
	const k8 = list.filter((x) => x.res === '8K' || x.res === '12K').length;
	const avg = list.length ? mins(list.reduce((a, x) => a + (x.len || 0), 0) / list.length) : 0;
	return { count: fmt(list.length), share8k: list.length ? Math.round((100 * k8) / list.length) : 0, avg, newest: list[0]?.d ?? '', trailers: list.filter((x) => x.mp4 || x.emb).length };
}

// ── 1. How to watch VR porn on Meta Quest ──
const quest: Guide = {
	slug: 'how-to-watch-vr-porn-on-quest',
	title: 'How to Watch VR Porn on Meta Quest 3, 3S & Quest 2',
	desc: 'How to watch VR porn on a Meta Quest 3, 3S or Quest 2: in the browser, as downloaded 8K files, in passthrough — plus the privacy settings to change first.',
	date: '2026-11-22T12:00:00', modified: '2026-11-22T12:00:00',
	content: `
<p>There are three ways to watch VR porn on a Quest, from zero setup to best picture: <b>stream it in the Quest browser</b>, <b>download the files and play them in a VR video player</b>, or <b>watch passthrough scenes</b> that put the performer in your own room. All three work on the Quest 3, Quest 3S and Quest 2 without a PC.</p>

<h2>1. In the browser (no install, 30 seconds)</h2>
<p>The Meta Quest Browser plays 180° video directly. Open <a href="/">dudevr.com</a> in the headset, pick any scene and press <b>Enter VR</b> under the player — the trailer switches to full 180° 3D around you. This is the quickest way to check whether a studio's camera angle and lighting suit you before paying for anything.</p>
<ul>
<li>Open a <b>private window</b> first (the tab icon → New private window), so nothing stays in the history.</li>
<li>Use the controller's trigger to drag the view if the scene starts off-center, or recenter with a long press of the Meta button.</li>
<li>Streaming quality depends on your Wi-Fi. Trailers are light; full 8K streams need a strong 5 GHz or Wi-Fi 6 connection near the router.</li>
</ul>

<h2>2. Downloaded files in a VR player (best quality)</h2>
<p>Every studio we list sells downloads in several resolutions. A downloaded file never buffers and looks noticeably sharper than a stream.</p>
<ol>
<li><b>Pick the right file.</b> On a Quest 3 or 3S take the 8K or 6K H.265 (HEVC) version; on a Quest 2 the 5K–6K version usually plays smoother than 8K. Files are named with their layout, for example <code>_180_LR</code> or <code>_SBS</code> (side-by-side 180°).</li>
<li><b>Copy it to the headset.</b> Connect the Quest to a computer with a USB-C cable, accept the "Allow access to data" prompt inside the headset, and drop the file into the <code>Movies</code> or <code>Download</code> folder. You can also download straight in the Quest browser.</li>
<li><b>Play it in a VR video player</b> such as DeoVR, SKYBOX VR or HereSphere from the Meta Horizon Store. They read the layout from the file name; if the picture looks doubled, set the format to 180° side-by-side manually.</li>
</ol>
<p>Storage fills fast: one 40-minute scene in 8K is often 8–15 GB, so a 128 GB Quest 3S holds only a handful. Keep the library on a computer and stream it to the headset over your home network instead — SKYBOX and DeoVR both find a PC or NAS on the same Wi-Fi.</p>

<h2>3. Passthrough: the performer in your room</h2>
<p>The Quest 3 and 3S have color passthrough cameras. <a href="/category/passthrough/">Passthrough VR porn</a> (${n('passthrough')} scenes here) is filmed on a keyed background, so the player can replace it with your real room. Play these files in HereSphere, DeoVR or SKYBOX and switch on passthrough in the player. Most of them come from ${aff('ar-porn', 'quest_arporn')}, the mixed-reality studio of the VR Bangers network. On a Quest 2 the same files play as normal VR on a black background.</p>

<h2>Privacy checklist</h2>
<ul>
<li>Browse in a private window, or clear the browser history after watching.</li>
<li>Turn off casting and check that no one is mirroring the headset to a phone or TV.</li>
<li>Hide the player apps from the library with a separate user account if you share the headset — the Quest supports multiple accounts.</li>
<li>Downloaded files stay in the headset's storage; delete them from the Files app when you are done.</li>
</ul>

<h2>Where to start</h2>
<p>Browse the <a href="/category/free-vr-porn/">free VR porn</a> trailers in the headset, try a few <a href="/category/8k-vr-porn/">8K scenes</a> to see the difference, and when you know which studio you like, compare them in our guide to the <a href="/best-vr-porn-sites/">best VR porn sites</a>. Still choosing hardware? Read <a href="/vr-porn-headset-guide/">the best VR headset for porn</a>.</p>`,
	faq: [
		['Can you watch VR porn on a Quest without a PC?', 'Yes. The Quest browser streams 180° video directly, and downloaded files play in apps like DeoVR or SKYBOX on the headset itself.'],
		['Which resolution should I download for the Quest 3?', 'The 8K or 6K H.265 file. On a Quest 2 the 5K–6K version usually plays smoother.'],
		['Does passthrough porn work on the Quest 2?', 'Only in black and white and without a convincing effect; the files play as normal VR. Color passthrough needs a Quest 3 or 3S.'],
	],
};

// ── 2. Best VR porn sites (studios compared) ──
function sitesGuide(): Guide {
	const F = Object.fromEntries(studios.map((s) => [s.slug, studioFacts(s.slug)]));
	const row = (slug: string, bestFor: string) => {
		const st = studios.find((s) => s.slug === slug)!, f = F[slug];
		return `<tr><td>${aff(slug, 'table_' + slug)}</td><td>${bestFor}</td><td>${f.count}</td><td>${f.share8k}%</td><td>${f.avg} min</td><td>${STUDIO_SCORE[slug]}</td></tr>`;
	};
	const sec = (slug: string, h: string, body: string) => {
		const f = F[slug];
		return `<h2>${h}</h2>${body}<p><b>On DudeVR:</b> ${f.count} scenes, ${f.share8k}% in 8K, average ${f.avg} minutes${f.newest ? `, newest from ${f.newest}` : ''}. <a href="/studio/${slug}/">Browse all ${studios.find((s) => s.slug === slug)!.name} trailers</a> or go to ${aff(slug, 'sec_' + slug)} →</p>`;
	};
	return {
		slug: 'best-vr-porn-sites',
		title: 'Best VR Porn Sites in 2026: 7 Studios Compared',
		desc: 'The best VR porn sites compared: VR Bangers, AR Porn, VR Conk, BlowVR, VRB Trans, VRB Gay and VRSmash — scene counts, 8K share, length and who each is for.',
		date: '2026-11-22T12:00:00', modified: '2026-11-22T12:00:00',
		content: `
<p>We index every trailer these studios publish, so we can compare them on numbers instead of impressions: how many scenes, how many are 8K, how long a scene runs. The table is rebuilt from the catalogue every night. <i>We earn a commission when you join a studio through our links — it does not change the order; see the <a href="/affiliate-disclosure/">affiliate disclosure</a>.</i></p>
<table><thead><tr><th>Site</th><th>Best for</th><th>Scenes</th><th>8K</th><th>Avg length</th><th>Our score</th></tr></thead><tbody>
${row('vr-bangers', 'Overall quality, star cast')}
${row('ar-porn', 'Passthrough on Quest 3')}
${row('vr-conk', 'Cosplay & parodies')}
${row('blowvr', 'Close-up oral')}
${row('vrb-trans', 'Trans VR')}
${row('vrb-gay', 'Gay VR')}
${row('vrsmash', 'Biggest library, niches')}
</tbody></table>
${sec('vr-bangers', '1. VR Bangers — best overall', `<p>The flagship of the network and the studio most others are measured against: 8K 180° productions with big-name performers, real sets and long, uncut takes. If you only join one VR porn site, this is the safe choice. Its <a href="/category/best-vr-porn/">best-of lists and award winners</a> are a good first watch.</p>`)}
${sec('ar-porn', '2. AR Porn — best for passthrough', `<p>Shot for mixed reality: the background is keyed out, so on a Quest 3, 3S or Pico 4 the performer appears in your own room. It feels very different from regular VR — try a <a href="/category/passthrough/">passthrough trailer</a> first. On older headsets the scenes play on a black background.</p>`)}
${sec('vr-conk', '3. VR Conk — best for cosplay and parodies', `<p>Full costume productions of game, film and comic characters — Marvel, DC, anime and video-game parodies with matching sets. The biggest source of <a href="/category/cosplay/">VR cosplay porn</a> we list.</p>`)}
${sec('blowvr', '4. BlowVR — best for oral', `<p>One thing done well: close-up POV <a href="/category/blowjob/">blowjob scenes</a> with the camera placed for maximum depth. Shorter scenes and a smaller library, priced accordingly.</p>`)}
${sec('vrb-trans', '5. VRB Trans — best trans VR site', `<p>The network's trans label, filmed with the same crew and 8K cameras as VR Bangers. Combined with VRSmash's trans channels it makes up our <a href="/category/trans/">trans VR porn</a> section.</p>`)}
${sec('vrb-gay', '6. VRB Gay — best gay VR site', `<p>Gay VR from the same network, shot in 180° 3D. The library is smaller; see all <a href="/category/gay/">gay VR porn</a> including VRSmash studios.</p>`)}
${sec('vrsmash', '7. VRSmash — biggest library', `<p>A marketplace of dozens of VR studios under one account, with tens of thousands of scenes. It is where the niches are: <a href="/category/anime/">VR hentai</a>, <a href="/category/bbw/">BBW</a>, <a href="/category/feet/">feet</a> and Japanese studios. Quality varies by studio, so watch the trailer before you buy.</p>`)}
<h2>And live VR cams?</h2>
<p>For live shows instead of recorded scenes, <a href="${VR_CAMS}" rel="sponsored noopener" target="_blank" data-aff="guide_sites_vrcams">SexLikeReal's VR cam girls</a> stream in 180° 3D to the same headsets — more in our <a href="/vr-cams/">VR cams guide</a>.</p>
<h2>How to choose</h2>
<ul>
<li><b>Picture first:</b> pick a studio with a high 8K share if you have a Quest 3, Pico 4 or a PC headset.</li>
<li><b>Try before you pay:</b> every scene here has its official trailer — open it in your headset and press Enter VR.</li>
<li><b>Watch the length:</b> a long average means longer, uncut scenes rather than many short clips.</li>
</ul>
<p>New to VR? Start with <a href="/how-to-watch-vr-porn-on-quest/">how to watch VR porn on a Quest</a>.</p>`,
		faq: [
			['What is the best VR porn site?', 'For most people VR Bangers: the highest production quality and a large 8K library. AR Porn is the best choice for passthrough on a Quest 3, VRSmash for the largest selection.'],
			['Are there free VR porn sites?', 'Every studio publishes free trailers, and some give away full scenes — we collect them on our free VR porn page.'],
		],
	};
}

// ── WordPress-era guide, retitled for the query people actually type ──
const OVERRIDES: Record<string, Partial<Guide> & { intro?: string; outro?: string }> = {
	'vr-porn-headset-guide': {
		title: 'Best VR Headset for Porn (2026): Quest 3 vs 3S',
		h1: 'Best VR Headset for Porn (2026): Quest 3 vs 3S vs PS VR2',
		desc: 'The best VR headset for porn in 2026: Meta Quest 3 for the sharpest picture, Quest 3S for the lowest price, PS VR2 only for PS5 owners. What to skip and why.',
		modified: '2026-11-22T12:00:00',
		intro: `<p><b>Short answer:</b> the best VR headset for porn is the <b>Meta Quest 3</b> — sharp pancake lenses, color passthrough for <a href="/category/passthrough/">AR scenes</a> and no PC needed. The <b>Quest 3S</b> is the budget pick. Details and alternatives below.</p>`,
		outro: `<h2>Next step</h2><p>Got the headset? Read <a href="/how-to-watch-vr-porn-on-quest/">how to watch VR porn on a Quest</a> and compare the <a href="/best-vr-porn-sites/">best VR porn sites</a>.</p>`,
	},
};

const wpGuides: Guide[] = (wpPosts as any[]).filter((p) => !p.studio?.length).map((p) => {
	const o = OVERRIDES[p.slug] ?? {};
	return { slug: p.slug, title: o.title ?? p.title, h1: o.h1, desc: o.desc, date: p.date, modified: o.modified ?? p.modified ?? p.date,
		content: (o.intro ?? '') + String(p.content) + (o.outro ?? '') };
});

export const guides: Guide[] = [...wpGuides, quest, sitesGuide()];
