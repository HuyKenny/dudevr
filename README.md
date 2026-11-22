# dudevr.com

VR porn trailer directory. Static Astro site on Cloudflare Workers static assets (no Worker script → $0), built nightly in GitHub Actions from the studios' public feeds.

- `scripts/sync.ts` — feeds (VR Bangers network + VRSmash) + one-time WordPress export (`seed/wp`) + slug registry (`seed/registry.json`, URLs only ever get added) → `src/data/*.json`
- `scripts/thumbs.mjs` — incremental 480×270 WebP card thumbnails (`public/t`, cached in Actions)
- `scripts/build-redirects.ts` — `_redirects` for legacy WordPress URLs + `_headers`
- `scripts/check-dist.ts` — post-build guard: every old WordPress URL exists or redirects; file count under 20 000
- `public/vr/player.js` — 180° stereo WebXR trailer player (three.js r149)

Quick fixes: push to `main` (rebuild from cached feeds, ~3 min). Full run: nightly 01:30 CET or *Run workflow* with quick off.
