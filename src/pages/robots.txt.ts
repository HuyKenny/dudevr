export const GET = () => new Response(`User-agent: *
Allow: /
Disallow: /search/
Disallow: /shuffle/
Disallow: /*?

User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Bytespider
Disallow: /

Sitemap: https://dudevr.com/sitemap_index.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
