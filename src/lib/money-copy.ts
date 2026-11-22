// Keyword-led copy for category pages with real search demand.
// Phrases come from Bing (11/2026) and the Ahrefs US content gap vs astalavr / vrphub / vrporn (11/2026):
// the title and H1 start with the exact phrase people type; the lead is written per page, never a template.
export type MoneyCopy = { t: string; h1: string; lead: string; d: string; faq?: [string, string][] };
type Ctx = { N: string; count: number; freeFull: number; share8k: number; avgMin: number };

const fmt = (n: number) => n.toLocaleString('en-US');

export function moneyCopy(slug: string, x: Ctx): MoneyCopy | undefined {
	const { N, count, freeFull, share8k, avgMin } = x;
	switch (slug) {
		case 'free-vr-porn': return { t: `Free VR Porn: ${N} Free Scenes & 180° Trailers`, h1: 'Free VR Porn',
			lead: `${freeFull} full VR porn scenes you can watch for free, plus ${fmt(count - freeFull)} official 180° trailers that play right here — drag to look around, tilt your phone or open the page in your Quest browser and press Enter VR. No sign-up, no download.`,
			d: `Free VR porn: ${freeFull} full free scenes + ${fmt(count - freeFull)} free 180° VR trailers in up to 8K. Watch in the browser, on your phone or in a Quest — no sign-up.` };
		case 'anime': return { t: `VR Hentai: ${N} Anime & 3D Hentai VR Porn Scenes`, h1: 'VR Hentai & Anime VR Porn',
			lead: `${N} hentai VR scenes: fully animated 3D hentai from VRSmash's CGI studios — game and anime heroines from Genshin Impact, Blue Archive, Azur Lane and Hololive — plus live-action anime cosplay parodies from VR Conk. The animated clips are short loops of a few minutes; the cosplay scenes run full length.`,
			d: `VR hentai: ${N} animated 3D hentai and anime VR porn scenes — Genshin, Blue Archive, Hololive parodies and cosplay. Free previews, newest first.`,
			faq: [
				['What is VR hentai?', 'Hentai rendered in stereo 3D for a headset: the characters are CGI models instead of drawings, filmed by a virtual camera at head height, so they stand in front of you at real scale.'],
				['Can I watch VR hentai on a Quest?', 'Yes. Open the scene in the Quest browser and press Enter VR, or download the full file from the studio and play it in Skybox or DeoVR as 180° side-by-side.'],
				['Why are the animated scenes so short?', 'Every second of CGI has to be rendered twice, once per eye, at 6K or 8K. Most hentai VR studios release one- to five-minute loops instead of long scenes.'],
			] };
		case 'trans': return { t: `Trans VR Porn: ${N} TS & Shemale VR Scenes`, h1: 'Trans VR Porn',
			lead: `${N} trans VR porn scenes with trans women from Brazil, Colombia, Thailand and the US — ${fmt(Math.round((count * share8k) / 100))} of them in 8K. The core is VRB Trans, the VR Bangers network's trans studio; VRSmash adds Thai ladyboy and passthrough productions.`,
			d: `Trans VR porn: ${N} TS & shemale VR scenes in up to 8K from VRB Trans, VRSmash and AR Porn. Free 180° trailers, newest first.`,
			faq: [
				['Which studio has the most trans VR porn?', 'On DudeVR it is VRSmash by count and VRB Trans by production value — VRB Trans shoots in 8K with the same crew as VR Bangers.'],
				['Is there trans passthrough (AR) porn?', 'Yes, scenes marked [Passthrough] are filmed on a green or black background so the performer appears in your own room on a Quest 3.'],
			] };
		case 'gay': return { t: `Gay VR Porn: ${N} Scenes in 8K 180° VR`, h1: 'Gay VR Porn',
			lead: `${N} gay VR porn scenes from VRB Gay — the VR Bangers network's gay label — and from VRSmash's gay channels. Twinks, muscle men and bears, ${share8k}% in 8K.`,
			d: `Gay VR porn: ${N} scenes in 8K 180° from VRB Gay and VRSmash — twinks, muscle men and bears. Free trailers, newest first.`,
			faq: [
				['Where does the gay VR porn come from?', 'Two sources: VRB Gay, the gay label of the VR Bangers network, and the gay studios listed on VRSmash.'],
				['Do the scenes work on a phone?', 'Yes — the trailer plays in 180° on any phone (drag or tilt). For full 3D use a headset such as the Quest 3.'],
			] };
		case 'best-vr-porn': return { t: `Best VR Porn: ${N} Award-Winning & Top-Rated Scenes`, h1: 'Best VR Porn',
			lead: `The best VR porn we list, in one place: ${N} scenes picked by the studios for their yearly best-of lists, award winners and the most-watched top 100. ${share8k}% are 8K and the average scene runs ${avgMin} minutes — the longest and best-lit productions of each year.`,
			d: `Best VR porn: ${N} award-winning and top-rated VR scenes from the best-of lists of VR Bangers, VR Conk, AR Porn and VRSmash. Free trailers.`,
			faq: [
				['How is this list made?', 'It collects every scene the studios themselves put on a best-of-the-year list, award-winning scenes and the top 100 of 2025 — no paid placements.'],
				['What makes a VR porn scene good?', 'Sharp 8K video, a camera at real head height, eye contact and a long uncut take. Short cuts and a camera that moves on its own break the illusion.'],
			] };
		case 'passthrough': return { t: `Passthrough VR Porn & AR Porn: ${N} Scenes`, h1: 'Passthrough & AR VR Porn',
			lead: `${N} passthrough scenes — the performer is filmed on a keyed background, so on a Quest 3, Quest 3S or Pico 4 she appears in your own room instead of a studio set. Most come from AR Porn, the VR Bangers network's mixed-reality studio; VRSmash adds AI-passthrough versions of regular scenes.`,
			d: `Passthrough VR porn and AR porn: ${N} mixed-reality scenes for Quest 3 and Pico 4 from AR Porn and VRSmash. Free trailers, newest first.`,
			faq: [
				['What is passthrough porn?', 'A VR scene with the background removed. Your headset\'s cameras fill the empty space with your real room, so the performer looks like she is there with you.'],
				['Which headsets support it?', 'Quest 3, Quest 3S, Quest Pro and Pico 4 in apps such as HereSphere, DeoVR and SKYBOX. Older headsets play the files as normal VR on a black background.'],
				['What is AI passthrough?', 'A regular VR scene whose background was removed by software after filming. It works the same way, with slightly softer edges than a scene shot for passthrough.'],
			] };
		case 'asian': return { t: `Asian VR Porn: ${N} Scenes in 8K VR`, h1: 'Asian VR Porn',
			lead: `${N} Asian VR porn scenes — Japanese, Thai, Chinese and Asian-American performers such as Lulu Chu and Nicole Doshi, ${share8k}% filmed in 8K.`,
			d: `Asian VR porn: ${N} scenes with Japanese, Thai and Asian-American babes in 8K 180° VR. Free trailers from VR Bangers, VRSmash and more.` };
		case 'bbw': return { t: `BBW VR Porn: ${N} Curvy & Chubby VR Scenes`, h1: 'BBW VR Porn',
			lead: `${N} BBW and chubby VR porn scenes — big, soft and curvy women ${share8k}% filmed in 8K, all from VRSmash's studios.`,
			d: `BBW VR porn: ${N} chubby and curvy VR scenes in 8K 180°. Free trailers, then the full videos in your headset.` };
		case 'big-ass': return { t: `Big Ass VR Porn: ${N} Scenes in 8K`, h1: 'Big Ass VR Porn',
			lead: `${N} big ass VR porn scenes. Reverse cowgirl and doggystyle are where 180° VR beats flat video — the camera sits low, so you see everything at real scale.`,
			d: `Big ass VR porn: ${N} big booty VR scenes in 8K 180° — reverse cowgirl, twerking and doggystyle. Free trailers, newest first.` };
		case 'latina': return { t: `Latina VR Porn: ${N} Scenes in 8K 180°`, h1: 'Latina VR Porn',
			lead: `${N} Latina VR porn scenes with performers from Latin America and the US such as Kitana Montana and Agatha Vega — ${share8k}% in 8K.`,
			d: `Latina VR porn: ${N} scenes with Latina babes in 8K 180° VR. Free trailers from VR Bangers and VRSmash.` };
		case 'cosplay': return { t: `VR Cosplay Porn: ${N} Parody & Costume Scenes`, h1: 'VR Cosplay Porn',
			lead: `${N} VR cosplay porn scenes. Half of them are VR Conk parodies — full sets and costumes for Marvel, DC, game and anime characters — the rest come from AR Porn and VRSmash.`,
			d: `VR cosplay porn: ${N} parody and costume scenes — Marvel, DC, games and anime — in 8K 180°. Free trailers from VR Conk and more.` };
		// "jav vr" 7.6k/mo vs "japanese vr porn" 3.4k/mo (Ahrefs US 11/2026) → JAV leads, Japanese stays in the title.
		case 'japanese': return { t: `JAV VR Porn: ${N} Japanese VR Scenes`, h1: 'JAV VR Porn: Japanese VR Scenes',
			lead: `${N} Japanese VR porn scenes with performers from Japan such as Marica Hase, Aizawa Haruka and Mashiro Airi, from VR Bangers and VRSmash's Japanese studios.`,
			d: `JAV VR porn: ${N} Japanese VR scenes with Japanese babes in 180° 3D. From VR Bangers and VRSmash, newest first.` };
		case '4k-vr-porn': return { t: `4K VR Porn: ${N} Scenes in 4K 180° VR`, h1: '4K VR Porn',
			lead: `${N} VR porn scenes mastered in 4K — the earlier VR Bangers catalogue. 4K files are a third of the size of 8K and play smoothly on older headsets and phones; for a sharper picture see <a href="/category/8k-vr-porn/">8K VR porn</a>.`,
			d: `4K VR porn: ${N} scenes in 4K 180° from VR Bangers — small files that play smoothly on any headset or phone. Free trailers.` };
		case 'milf': return { t: `MILF VR Porn: ${N} Scenes in 8K`, h1: 'MILF VR Porn',
			lead: `${N} MILF VR porn scenes with Lexi Luna, Brandi Love, Anissa Kate, Brittany Bardot and other experienced performers — for women 50+ see <a href="/category/mature/">mature VR porn</a>.`,
			d: `MILF VR porn: ${N} scenes with Lexi Luna, Brandi Love and more in 8K 180° VR. Free trailers, newest first.` };
		case 'lesbian': return { t: `Lesbian VR Porn: ${N} Girl-on-Girl VR Scenes`, h1: 'Lesbian VR Porn',
			lead: `${N} lesbian VR porn scenes — two or more women together, ${share8k}% in 8K, from VR Bangers and VRSmash.`,
			d: `Lesbian VR porn: ${N} girl-on-girl VR scenes in 8K 180° from VR Bangers and VRSmash. Free trailers, newest first.` };
		case 'feet': return { t: `VR Feet Porn: ${N} Foot Fetish & Footjob Scenes`, h1: 'VR Feet Porn',
			lead: `${N} foot fetish and footjob VR scenes. In VR the feet come right up to the lens, which is why the genre works so much better than on a flat screen.`,
			d: `VR feet porn: ${N} foot fetish and footjob VR scenes in 8K 180°. Free trailers, newest first.` };
		case 'for-women': return { t: `VR Porn for Women: ${N} Female-Friendly Scenes`, h1: 'VR Porn for Women',
			lead: `${N} VR scenes made with women viewers in mind — slower, more romantic, more eye contact and more of the man in shot. Most are from the VR Bangers "for girls" series.`,
			d: `VR porn for women: ${N} female-friendly VR scenes — romantic, slow and filmed for women viewers. Free 180° trailers.` };
		case 'anal': return { t: `VR Anal Porn: ${N} Anal VR Scenes in 8K`, h1: 'VR Anal Porn',
			lead: `${N} anal VR porn scenes, ${share8k}% in 8K — from VRSmash, VR Bangers, AR Porn and VRB Trans.`,
			d: `VR anal porn: ${N} anal VR scenes in 8K 180° from VRSmash, VR Bangers and AR Porn. Free trailers, newest first.` };
		case 'creampie': return { t: `VR Creampie Porn: ${N} Scenes in 8K`, h1: 'VR Creampie Porn',
			lead: `${N} creampie VR porn scenes. Average length ${avgMin} minutes, so the finish comes after a full scene, not a quick cut.`,
			d: `VR creampie porn: ${N} creampie VR scenes in 8K 180° from VRSmash, VR Bangers and AR Porn. Free trailers.` };
		case 'blowjob': return { t: `VR Blowjob Porn: ${N} POV Blowjob Scenes`, h1: 'VR Blowjob Porn',
			lead: `${N} VR blowjob scenes — the one position where POV VR is at its best. For close-up oral only, see <a href="/studio/blowvr/">BlowVR</a>, the network's blowjob studio.`,
			d: `VR blowjob porn: ${N} POV blowjob VR scenes in 8K 180° — deepthroat, sloppy and close-up. Free trailers from BlowVR and more.` };
		case 'taboo': return { t: `Taboo VR Porn: ${N} Fantasy Role-Play Scenes`, h1: 'Taboo VR Porn',
			lead: `${N} taboo VR porn scenes — step-family and forbidden role-play fantasies with adult performers (all 18+), scripted and staged by VR Bangers, AR Porn and VRSmash.`,
			d: `Taboo VR porn: ${N} role-play fantasy VR scenes with adult performers in 8K 180°. Free trailers, newest first.` };
		case 'compilation': return { t: `VR Porn Compilation: ${N} Best-Of Mixes`, h1: 'VR Porn Compilations',
			lead: `${N} VR porn compilations — studio best-of mixes that cut the strongest moments of many scenes into one long video.`,
			d: `VR porn compilation: ${N} best-of VR mixes in 8K 180° from VRSmash and VR Bangers. Free trailers, newest first.` };
		case 'mature': return { t: `Mature VR Porn: ${N} Older Women Scenes in 8K`, h1: 'Mature VR Porn',
			lead: `${N} mature VR porn scenes with experienced older women — filmed in up to 8K 180° so they look straight at you. Also see our much bigger <a href="/category/milf/">MILF VR porn</a> section.`,
			d: `Mature VR porn: ${N} scenes with older women in 8K 180° VR. Free trailers, then the full videos in your headset.` };
		case '8k-vr-porn': return { t: `8K VR Porn: ${N} Scenes in Full 8K Resolution`, h1: '8K VR Porn',
			lead: `${N} VR porn scenes shot in 8K — the sharpest stereo video you can play on a Quest 3, Pico 4 or PC headset today. Each scene page shows the length, the studio and the camera setup before you get the full 8K file.`,
			d: `8K VR porn: ${N} scenes in full 8K 180° resolution from VR Bangers, VRSmash and more. Watch free trailers first.` };
		case 'ebony': return { t: `Ebony VR Porn: ${N} Black Babes in 8K VR`, h1: 'Ebony VR Porn',
			lead: `${N} ebony and black VR porn scenes with performers such as Kira Noir, Ana Foxxx and Nicole Kitt, in up to 8K 180° stereo.`,
			d: `Ebony VR porn: ${N} scenes with Black babes in 8K 180° VR. Free trailers, newest first.` };
		case 'pov': return { t: `POV VR Porn: ${N} Point-of-View Scenes in 8K`, h1: 'POV VR Porn',
			lead: `${N} POV VR porn scenes — the camera is your eyes, so everything happens right in front of you in 180° 3D.`,
			d: `POV VR porn: ${N} point-of-view scenes in 8K 180° 3D. Free trailers from VR Bangers, VRSmash, BlowVR and more.` };
		case 'parody': return { t: `VR Porn Parody: ${N} Game, Anime & Movie Parodies`, h1: 'VR Porn Parodies',
			lead: `${N} VR porn parodies — game, anime, comic and movie characters played by real performers in full costume, plus animated 3D parodies from VRSmash's CGI studios. Pick a universe below or browse the newest first.`,
			d: `VR porn parodies: ${N} game, anime and movie parody scenes in 8K 180° — Overwatch, Star Wars, Marvel, Genshin and more, newest first.` };
	}
	return undefined;
}

/** Franchise pages (overwatch, star-wars…): "{name} vr porn" is the phrase people type (Ahrefs US 11/2026, KD 0–17). */
export function franchiseCopy(name: string, x: Ctx): MoneyCopy {
	const { N, count, share8k } = x;
	return {
		t: `${name} VR Porn: ${N} Parody Scene${count === 1 ? '' : 's'} in 180° 3D`,
		h1: `${name} VR Porn Parodies`,
		lead: `${N} ${name} VR porn parod${count === 1 ? 'y' : 'ies'} — the characters from the ${name} universe in costume, at life size around you${share8k ? `; ${share8k}% are filmed in 8K or higher` : ''}.`,
		d: `${name} VR porn: ${N} parody scene${count === 1 ? '' : 's'} with ${name} characters in 180° 3D VR, newest first. Full videos in up to 8K from the studios.`,
	};
}
