// @ts-check
import { defineConfig } from 'astro/config';

// Pure static build → Cloudflare Workers static assets (no Worker script, $0, unlimited requests).
export default defineConfig({
	site: 'https://dudevr.com',
	output: 'static',
	trailingSlash: 'always', // the old WordPress URLs all end with "/"
	build: { format: 'directory', inlineStylesheets: 'auto', concurrency: 4 },
	compressHTML: true,
	prefetch: false,
	devToolbar: { enabled: false },
});
