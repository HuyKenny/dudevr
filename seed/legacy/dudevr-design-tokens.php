<?php
/**
 * DudeVR Premium Redesign — Tokens, Video Grid, Homepage, Archives, Footer
 * Auto-loaded as must-use plugin (no activation needed).
 * Plugin Name: DudeVR Design Tokens
 */

defined('ABSPATH') || exit;

/* ════════════════════════════════════════════════
   STUDIO MAP — affiliate fallback (100% coverage)
   slug => [domain, link_data token (aff_id 8795)]
   ════════════════════════════════════════════════ */
function dvr_studio_map() {
    return [
        'vr-bangers' => ['vrbangers.com', 'eyJvZmZlcl9pZCI6IjEiLCJhZmZfaWQiOiI4Nzk1IiwiY2FtcGFpZ25faWQiOiIiLCJsaW5rX2lkIjoiNTAyODIiLCJjbGlja19pZCI6ImEwMzkzYmU4LTgzNTItNDkwZi1iOGQwLTdiYTNhMmQ1OTFjOCIsImNyZWF0aXZlX2lkIjoiNzMiLCJ0eXBlIjoibGFuZGluZyJ9'],
        'ar-porn'    => ['arporn.com', 'eyJvZmZlcl9pZCI6IjI4IiwiYWZmX2lkIjoiODc5NSIsImNhbXBhaWduX2lkIjoiIiwibGlua19pZCI6IjUwMjc2IiwiY2xpY2tfaWQiOiJhMDM5M2IxMS1lOTNiLTQwMTUtOGU3MC03OTgzZTQ2NjE0ZDQiLCJjcmVhdGl2ZV9pZCI6Ijg2IiwidHlwZSI6ImxhbmRpbmcifQ=='],
        'vr-conk'    => ['vrconk.com', 'eyJvZmZlcl9pZCI6IjEyIiwiYWZmX2lkIjoiODc5NSIsImNhbXBhaWduX2lkIjoiIiwibGlua19pZCI6IjUwMjc4IiwiY2xpY2tfaWQiOiJhMDM5M2I2Ny0xNzlhLTQ2ZTMtYWNkZS1jMzliNzNkYTQ3YWQiLCJjcmVhdGl2ZV9pZCI6IjYzIiwidHlwZSI6ImxhbmRpbmcifQ=='],
        'blowvr'     => ['blowvr.com', 'eyJvZmZlcl9pZCI6IjE0IiwiYWZmX2lkIjoiODc5NSIsImNhbXBhaWduX2lkIjoiIiwibGlua19pZCI6IjUwMjc3IiwiY2xpY2tfaWQiOiJhMDM5M2IzZC0wNTc5LTQyYWItYTg4MC1kOWEwMzE0MDUwZGMiLCJjcmVhdGl2ZV9pZCI6IjU4IiwidHlwZSI6ImxhbmRpbmcifQ=='],
        'vrb-gay'    => ['vrbgay.com', 'eyJvZmZlcl9pZCI6IjUiLCJhZmZfaWQiOiI4Nzk1IiwiY2FtcGFpZ25faWQiOiIiLCJsaW5rX2lkIjoiNTAyODAiLCJjbGlja19pZCI6ImEwMzkzYmE0LWU1MWMtNDc3Ny1hMmZkLWVjM2Y1NWY5YjU3NCIsImNyZWF0aXZlX2lkIjoiNDYiLCJ0eXBlIjoibGFuZGluZyJ9'],
        'vrb-trans'  => ['vrbtrans.com', 'eyJvZmZlcl9pZCI6IjMiLCJhZmZfaWQiOiI4Nzk1IiwiY2FtcGFpZ25faWQiOiIiLCJsaW5rX2lkIjoiNTAyODEiLCJjbGlja19pZCI6ImEwMzkzYmM0LTdlOTktNDJhNy1hMTE2LTA5Zjg5NThjZDZiNiIsImNyZWF0aXZlX2lkIjoiNTIiLCJ0eXBlIjoibGFuZGluZyJ9'],
    ];
}

/* Build affiliate URL for a post (from content, else studio-map fallback) */
function dvr_affiliate_url($id) {
    $raw = get_post_field('post_content', $id);
    if (preg_match('#class="btn-unlock"[^>]*href="([^"]+)"#', $raw, $m)) return $m[1];
    if (preg_match('#class="btn-download"[^>]*href="([^"]+)"#', $raw, $m)) return $m[1];
    if (preg_match('#href="(https://[^"]+link_data=[^"]+)"#', $raw, $m)) return $m[1];
    $terms = get_the_terms($id, 'studio');
    if ($terms && !is_wp_error($terms)) {
        $map = dvr_studio_map();
        if (isset($map[$terms[0]->slug])) {
            list($domain, $token) = $map[$terms[0]->slug];
            return 'https://' . $domain . '/video/' . get_post_field('post_name', $id) . '/?link_data=' . $token;
        }
    }
    return '';
}

/* ════════════════════════════════════════════════
   SECURITY / TECH HARDENING
   ════════════════════════════════════════════════ */
add_action('send_headers', 'dvr_security_headers');
function dvr_security_headers() {
    if (is_admin()) return;
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    @header_remove('X-Powered-By');
}
// Hide WP version
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');

// Force REHub dark mode — its mobile media queries set `body:not(.dark_body){background:#fff!important}`
// which made mobile white/illegible. Opting in via dark_body keeps mobile = desktop (dark).
add_filter('body_class', function ($c) { $c[] = 'dark_body'; return $c; });
// Strip ?ver= from front-end assets (less fingerprinting)
add_filter('style_loader_src', 'dvr_strip_ver', 15);
add_filter('script_loader_src', 'dvr_strip_ver', 15);
function dvr_strip_ver($src) {
    if (is_admin()) return $src;
    return $src ? remove_query_arg('ver', $src) : $src;
}

/* ════════════════════════════════════════════════
   SEO — Rank Math title/description filters
   ════════════════════════════════════════════════ */
add_filter('rank_math/frontend/title', 'dvr_seo_title', 20);
function dvr_seo_title($title) {
    if (is_singular('post')) {
        $id = get_queried_object_id();
        $studio = '';
        $terms = get_the_terms($id, 'studio');
        if ($terms && !is_wp_error($terms)) $studio = ' – ' . $terms[0]->name;
        return get_the_title($id) . ' VR Porn' . $studio . ' | DudeVR';
    }
    if (is_tax('studio')) {
        $t = get_queried_object();
        if ($t && !is_wp_error($t)) {
            return sprintf('%s Review: %d VR Porn Scenes in 8K | DudeVR', $t->name, (int)$t->count);
        }
    }
    if (is_tax('model')) {
        $t = get_queried_object();
        if ($t && !is_wp_error($t)) {
            return sprintf('%s VR Porn: %d Scenes in 8K 180° | DudeVR', $t->name, (int)$t->count);
        }
    }
    return $title;
}
add_filter('rank_math/frontend/description', 'dvr_seo_desc', 20);
function dvr_seo_desc($desc) {
    if (is_tax('studio')) {
        $t = get_queried_object();
        $cnt = ($t && !is_wp_error($t)) ? (int)$t->count : 0;
        $meta = [
            'vr-bangers' => "VR Bangers review: stream %d exclusive 8K VR porn scenes from the industry's top studio. Watch free trailers on DudeVR, then dive into full immersive 180° VR.",
            'ar-porn'    => "AR Porn review: %d AI passthrough & mixed-reality VR porn scenes optimised for Meta Quest 3. Preview free trailers on DudeVR and watch in full immersive AR.",
            'vr-conk'    => "VR Conk review: %d cosplay & parody VR porn scenes in 8K. Superheroes, gaming & movie parodies — free trailers on DudeVR, full scenes in immersive VR.",
            'blowvr'     => "BlowVR review: %d immersive POV blowjob VR porn scenes in 180° 3D. Preview free trailers on DudeVR and stream the full close-up experience in VR.",
            'vrb-trans'  => "VRB Trans review: %d premium trans VR porn scenes in 8K from the VR Bangers network. Free trailers on DudeVR, full immersive virtual reality video.",
            'vrb-gay'    => "VRB Gay review: %d gay VR porn scenes in 8K from the VR Bangers network. Watch free trailers on DudeVR, then stream the full immersive VR experience.",
        ];
        if ($t && isset($meta[$t->slug])) return sprintf($meta[$t->slug], $cnt);
    }
    if (is_category() || is_tax()) {
        $t = get_queried_object();
        if ($t && !is_wp_error($t)) {
            $n = $t->name;
            $label = (stripos($n, 'porn') !== false || stripos($n, ' vr') !== false) ? $n : $n . ' VR porn';
            return sprintf('Watch %d %s scenes on DudeVR — free VR trailers from VR Bangers, AR Porn, VR Conk & more, then stream the full immersive video in up to 8K.',
                (int) $t->count, $label);
        }
    }
    if (is_singular('post')) {
        $id = get_queried_object_id();
        $ex = wp_strip_all_tags(get_post_field('post_content', $id));
        $ex = trim(preg_replace('/\s+/', ' ', $ex));
        if (strlen($ex) > 155) $ex = substr($ex, 0, 152) . '…';
        if ($ex) return $ex;
    }
    return $desc;
}

/* ════════════════════════════════════════════════
   SEO — Schema (VideoObject + Breadcrumb on scenes)
   ════════════════════════════════════════════════ */
function dvr_iso_duration($len) {
    // "1:07:56" or "47:14" -> ISO 8601 PT#H#M#S
    $p = array_map('intval', explode(':', $len));
    if (count($p) === 3) list($h,$m,$s) = $p;
    elseif (count($p) === 2) { $h=0; list($m,$s) = $p; }
    else return '';
    $out = 'PT';
    if ($h) $out .= $h.'H';
    $out .= $m.'M'.$s.'S';
    return $out;
}
add_action('wp_head', 'dvr_scene_schema', 20);
function dvr_scene_schema() {
    if (!is_singular('post')) return;
    $id = get_queried_object_id();
    $raw = get_post_field('post_content', $id);
    $poster = get_the_post_thumbnail_url($id, 'large') ?: get_the_post_thumbnail_url($id, 'full');
    $thumbs = [];
    if ($poster) $thumbs[] = $poster;
    if (preg_match_all('#<img[^>]+src="(https://content\.[^"]+\.jpg)"#', $raw, $mm)) {
        foreach ($mm[1] as $u) { $thumbs[] = $u; if (count($thumbs) >= 4) break; }
    }
    $trailer = '';
    if (preg_match('#(https://trailers\.[^\s"\']+\.mp4[^\s"\']*)#', $raw, $m)) $trailer = $m[1];
    if (!$trailer && preg_match('#src=[\'"]?(https://[^\s"\'>]+/embed/[^\s"\'>]+)#', $raw, $m)) $trailer = $m[1];
    $dur = '';
    if (preg_match('#Length:</strong>\s*([0-9:]+)#', $raw, $m)) $dur = dvr_iso_duration($m[1]);
    $desc = trim(preg_replace('/\s+/', ' ', wp_strip_all_tags($raw)));
    if (strlen($desc) > 300) $desc = substr($desc, 0, 297) . '…';

    $video = [
        '@context' => 'https://schema.org',
        '@type' => 'VideoObject',
        'name' => get_the_title($id) . ' - VR Porn',
        'description' => $desc ?: get_the_title($id),
        'thumbnailUrl' => $thumbs ?: [$poster],
        'uploadDate' => get_the_date('c', $id),
        'contentUrl' => get_permalink($id),
        'genre' => 'Adult',
    ];
    if ($trailer) $video['embedUrl'] = $trailer;
    if ($dur) $video['duration'] = $dur;
    $video['publisher'] = ['@type'=>'Organization','name'=>'DudeVR','url'=>'https://dudevr.com'];

    // Breadcrumb
    $crumbs = [['@type'=>'ListItem','position'=>1,'name'=>'Home','item'=>'https://dudevr.com/']];
    $terms = get_the_terms($id, 'studio');
    if ($terms && !is_wp_error($terms)) {
        $crumbs[] = ['@type'=>'ListItem','position'=>2,'name'=>$terms[0]->name,'item'=>get_term_link($terms[0])];
        $crumbs[] = ['@type'=>'ListItem','position'=>3,'name'=>get_the_title($id),'item'=>get_permalink($id)];
    } else {
        $crumbs[] = ['@type'=>'ListItem','position'=>2,'name'=>get_the_title($id),'item'=>get_permalink($id)];
    }
    $bc = ['@context'=>'https://schema.org','@type'=>'BreadcrumbList','itemListElement'=>$crumbs];

    echo "\n<script type=\"application/ld+json\">" . wp_json_encode($video) . "</script>\n";
    echo "<script type=\"application/ld+json\">" . wp_json_encode($bc) . "</script>\n";
}

/* ════════════════════════════════════════════════
   SCENE PARSER + studio score (for custom single template)
   ════════════════════════════════════════════════ */
function dvr_studio_score($slug) {
    $s = ['vr-bangers'=>'9.8','ar-porn'=>'9.5','vr-conk'=>'9.2','blowvr'=>'8.9','vrb-trans'=>'8.7','vrb-gay'=>'8.5'];
    return isset($s[$slug]) ? $s[$slug] : '9.0';
}

// Editorial Review schema on studio archives (DudeVR reviews the studio) → potential ⭐ rich snippet.
add_action('wp_head', 'dvr_studio_review_schema', 22);
function dvr_studio_review_schema() {
    if (!is_tax('studio')) return;
    $t = get_queried_object();
    if (!$t || is_wp_error($t)) return;
    $score = (float) dvr_studio_score($t->slug);           // out of 10
    $review = [
        '@context' => 'https://schema.org',
        '@type'    => 'Review',
        'itemReviewed' => [
            '@type' => 'Product',
            'name'  => $t->name . ' (VR Porn)',
            'description' => wp_trim_words(wp_strip_all_tags(term_description($t)), 40, '…'),
        ],
        'reviewRating' => [
            '@type' => 'Rating',
            'ratingValue' => number_format($score, 1),
            'bestRating'  => '10',
            'worstRating' => '1',
        ],
        'name'   => $t->name . ' Review',
        'author' => ['@type' => 'Organization', 'name' => 'DudeVR'],
        'publisher' => ['@type' => 'Organization', 'name' => 'DudeVR', 'url' => home_url('/')],
    ];
    echo '<script type="application/ld+json">' . wp_json_encode($review) . '</script>' . "\n";
}

function dvr_parse_scene($id) {
    $raw = get_post_field('post_content', $id);
    $d = ['trailer_html'=>'','trailer_mp4'=>'','length'=>'','fov'=>'','desc'=>'','gallery'=>'','aff'=>dvr_affiliate_url($id),'aff_download'=>''];

    // Trailer block (iframe container)
    if (preg_match('#<div class="video-container">.*?</div>#s', $raw, $m)) $d['trailer_html'] = $m[0];

    // Raw .mp4 URL (for the in-page WebXR 180° player). Only VR Bangers network ships mp4 trailers.
    if (preg_match('#<iframe[^>]+src="([^"]+\.mp4[^"]*)"#i', $raw, $m)) $d['trailer_mp4'] = html_entity_decode($m[1]);
    elseif (preg_match('#(https://trailers\.[^\s"\'<>]+\.mp4[^\s"\'<>]*)#i', $raw, $m)) $d['trailer_mp4'] = html_entity_decode($m[1]);

    // Download link (secondary)
    if (preg_match('#class="btn-download"[^>]*href="([^"]+)"#', $raw, $m)) $d['aff_download'] = $m[1];

    // Length / FOV
    if (preg_match('#Length:</strong>\s*([0-9:]+)#', $raw, $m)) $d['length'] = $m[1];
    if (preg_match('#FOV:</strong>\s*([0-9]+)#', $raw, $m)) $d['fov'] = $m[1];

    // Gallery
    if (preg_match('#<div class="vr-gallery">.*?</div>#s', $raw, $m)) $d['gallery'] = $m[0];

    // Description = content minus trailer/buttons/info/gallery
    $desc = $raw;
    $desc = preg_replace('#<div class="video-container">.*?</div>#s', '', $desc);
    $desc = preg_replace('#<div class="video-buttons">.*?</div>#s', '', $desc);
    $desc = preg_replace('#<div class="video-info">.*?</div>#s', '', $desc);
    $desc = preg_replace('#<div class="vr-gallery">.*?</div>#s', '', $desc);
    $d['desc'] = trim($desc);

    return $d;
}

// Sticky mobile CTA on scenes
add_action('wp_footer', 'dvr_sticky_cta', 6);
function dvr_sticky_cta() {
    if (!is_singular('post')) return;
    $id  = get_queried_object_id();
    $aff = dvr_affiliate_url($id);
    if (!$aff) return;
    $st = get_the_terms($id, 'studio');
    $sslug = ($st && !is_wp_error($st)) ? $st[0]->slug : '';
    echo '<a class="dvr-sticky-cta" href="' . esc_url($aff) . '" target="_blank" rel="sponsored nofollow noopener"'
       . ' data-aff-placement="sticky" data-aff-studio="' . esc_attr($sslug) . '" data-aff-scene="' . esc_attr(get_post_field('post_name', $id)) . '">▶ Watch Full Scene in VR →</a>';
}

/* ════════════════════════════════════════════════
   PERFORMANCE — resource hints + async fonts (non-blocking)
   ════════════════════════════════════════════════ */
add_action('wp_head', 'dvr_perf_head', 1);
function dvr_perf_head() {
    // Preload self-hosted variable fonts (render-critical, same-origin → no extra connection)
    echo '<link rel="preload" href="/wp-content/uploads/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossorigin>' . "\n";
    echo '<link rel="preload" href="/wp-content/uploads/fonts/spacegrotesk-var-latin.woff2" as="font" type="font/woff2" crossorigin>' . "\n";
    // DNS-prefetch for trailer + image CDNs used across the site
    foreach (['trailers.vrbangers.com','content.vrbangers.com','content.arporn.com','content.blowvr.com'] as $h) {
        echo '<link rel="dns-prefetch" href="//' . $h . '">' . "\n";
    }
}

/* ════════════════════════════════════════════════
   ASSETS — Fonts, CSS tokens, hover-play JS
   ════════════════════════════════════════════════ */
add_action('wp_enqueue_scripts', 'dudevr_enqueue_assets', 100);
function dudevr_enqueue_assets() {
    // Fonts are self-hosted via @font-face in dudevr_css() + preloaded in dvr_perf_head() — no external Google request
    wp_register_style('dudevr-tokens', false);
    wp_enqueue_style('dudevr-tokens');
    wp_add_inline_style('dudevr-tokens', dudevr_css());
    wp_register_script('dudevr-js', false, [], null, true);
    wp_enqueue_script('dudevr-js');
    wp_add_inline_script('dudevr-js', dudevr_js());
    // In-page 180° WebXR trailer preview (scenes only; lazy-loads three.js on click)
    if (is_singular('post')) {
        wp_enqueue_script('dvr-vr-player', content_url('uploads/vr/dvr-vr-player-r3.js'), [], null, true);
    }
}

/* ════════════════════════════════════════════════
   SINGLE CARD RENDERER (shared by grid + archives)
   ════════════════════════════════════════════════ */
function dvr_render_card($id) {
    $permalink = get_permalink($id);
    $title     = get_the_title($id);
    $poster    = get_the_post_thumbnail_url($id, 'mediumgrid');
    if (!$poster) $poster = get_the_post_thumbnail_url($id, 'medium');
    if (!$poster) $poster = get_the_post_thumbnail_url($id, 'large');
    if (!$poster) $poster = 'https://dudevr.com/wp-content/uploads/2020/10/magnify.png';

    $raw = get_post_field('post_content', $id);

    // Trailer mp4 (VR Bangers network)
    $trailer = '';
    if (preg_match('#(https://trailers\.[^\s"\']+\.mp4[^\s"\']*)#', $raw, $m)) $trailer = $m[1];

    // Length + FOV
    $length = '';
    if (preg_match('#Length:</strong>\s*([0-9:]+)#', $raw, $m)) $length = $m[1];
    $fov = '';
    if (preg_match('#FOV:</strong>\s*([0-9]+)#', $raw, $m)) $fov = $m[1];

    // Studio term + slug
    $studio_name = ''; $studio_slug = '';
    $terms = get_the_terms($id, 'studio');
    if ($terms && !is_wp_error($terms)) { $studio_name = $terms[0]->name; $studio_slug = $terms[0]->slug; }

    // Affiliate link from content, else build from studio map (100% coverage)
    $aff = '';
    if (preg_match('#class="btn-unlock"[^>]*href="([^"]+)"#', $raw, $m)) {
        $aff = $m[1];
    } elseif (preg_match('#class="btn-download"[^>]*href="([^"]+)"#', $raw, $m)) {
        $aff = $m[1];
    } elseif (preg_match('#href="(https://[^"]+link_data=[^"]+)"#', $raw, $m)) {
        $aff = $m[1];
    } elseif ($studio_slug) {
        $map = dvr_studio_map();
        if (isset($map[$studio_slug])) {
            list($domain, $token) = $map[$studio_slug];
            $aff = 'https://' . $domain . '/video/' . get_post_field('post_name', $id) . '/?link_data=' . $token;
        }
    }

    $out  = '<div class="dvr-vid">';
    $out .= '<a class="dvr-vid-thumb" href="' . esc_url($permalink) . '"' . ($trailer ? ' data-trailer="' . esc_url($trailer) . '"' : '') . '>';
    $out .= '<img src="' . esc_url($poster) . '" width="336" height="220" loading="lazy" decoding="async" alt="' . esc_attr($title) . '">';
    $out .= '<video muted loop playsinline preload="none"></video>';
    if ($studio_name) $out .= '<span class="dvr-vid-studio">' . esc_html($studio_name) . '</span>';
    if ($fov)         $out .= '<span class="dvr-vid-res">' . esc_html($fov) . '° · 8K</span>';
    if ($length)      $out .= '<span class="dvr-vid-dur">' . esc_html($length) . '</span>';
    $out .= '<span class="dvr-vid-play"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>';
    $out .= '</a>';
    $out .= '<h3 class="dvr-vid-title"><a href="' . esc_url($permalink) . '">' . esc_html($title) . '</a></h3>';
    $out .= '</div>';
    return $out;
}

/* ════════════════════════════════════════════════
   VIDEO GRID — helper + shortcode (NEW WP_Query)
   ════════════════════════════════════════════════ */
function dvr_render_video_grid($atts) {
    $a = shortcode_atts([
        'count' => 12, 'studio' => '', 'category' => '', 'orderby' => 'date', 'offset' => 0, 'exclude' => '',
    ], $atts);

    $args = [
        'post_type' => 'post', 'post_status' => 'publish',
        'posts_per_page' => intval($a['count']), 'offset' => intval($a['offset']),
        'ignore_sticky_posts' => true, 'no_found_rows' => true,
    ];
    $args['orderby'] = ($a['orderby'] === 'rand') ? 'rand' : 'date';
    if ($a['orderby'] !== 'rand') $args['order'] = 'DESC';
    if (!empty($a['studio']))   $args['tax_query'][] = ['taxonomy'=>'studio','field'=>'slug','terms'=>$a['studio']];
    if (!empty($a['category'])) $args['category_name'] = $a['category'];
    if (!empty($a['exclude']))  $args['post__not_in'] = array_map('intval', (array) $a['exclude']);

    $q = new WP_Query($args);
    if (!$q->have_posts()) { wp_reset_postdata(); return ''; }
    $out = '<div class="dvr-grid">';
    while ($q->have_posts()) { $q->the_post(); $out .= dvr_render_card(get_the_ID()); }
    $out .= '</div>';
    wp_reset_postdata();
    return $out;
}
add_shortcode('dvr_videos', 'dvr_render_video_grid');

/* ── Categories shortcode (for Category index page) ── */
function dvr_render_categories($atts) {
    $terms = get_terms(['taxonomy'=>'category','hide_empty'=>true,'orderby'=>'count','order'=>'DESC','number'=>80]);
    if (is_wp_error($terms) || !$terms) return '';
    $out = '<div class="dvr-pills dvr-pills-wrap">';
    foreach ($terms as $t) {
        $out .= '<a class="cat-pill" href="' . esc_url(get_term_link($t)) . '">' . esc_html($t->name) . ' <span class="dvr-pill-count">' . intval($t->count) . '</span></a>';
    }
    $out .= '</div>';
    return $out;
}
add_shortcode('dvr_categories', 'dvr_render_categories');

/* ════════════════════════════════════════════════
   HOMEPAGE RENDERER
   ════════════════════════════════════════════════ */
add_filter('the_content', 'dvr_homepage_content', 99);
function dvr_homepage_content($content) {
    if (!is_front_page() || !in_the_loop() || !is_main_query()) return $content;
    return dvr_build_homepage();
}

function dvr_build_homepage() {
    $studios = [
        ['slug'=>'vr-bangers','name'=>'VR Bangers'],
        ['slug'=>'ar-porn','name'=>'AR Porn'],
        ['slug'=>'vr-conk','name'=>'VR Conk'],
    ];
    ob_start(); ?>
    <section class="dvr-hero"><div class="dvr-container">
      <span class="dvr-eyebrow">VR PORN · 8K · 180° IMMERSIVE</span>
      <h1 class="dvr-hero-h1">Watch the Best VR Porn Trailers</h1>
      <p class="dvr-hero-sub">2,100+ scenes from the world's top studios. Preview the trailer, then dive in.</p>
      <form role="search" method="get" class="dvr-search" action="https://dudevr.com/">
        <input type="text" name="s" placeholder="Search scenes, studios, models…" autocomplete="off">
        <button type="submit">Search</button>
      </form>
    </div></section>

    <div class="dvr-trust-bar"><div class="dvr-container dvr-trust-inner">
      <span>🎬 2,154 Scenes</span><span>⭐ 6 Premium Studios</span><span>📺 Up to 8K</span><span>🔄 Updated Daily</span>
    </div></div>

    <section class="dvr-section"><div class="dvr-container">
      <div class="dvr-row-head"><h2>Latest VR Scenes</h2><a href="/vr-porn/" class="dvr-viewall">View all →</a></div>
      <?php echo dvr_render_video_grid(['count'=>12,'orderby'=>'date']); ?>
    </div></section>

    <section class="dvr-section dvr-section-dark"><div class="dvr-container">
      <div class="dvr-section-header"><span class="dvr-label">MOST POPULAR</span><h2>Trending VR Porn Right Now</h2></div>
      <div class="dvr-feature-tiles">
        <a class="dvr-feature-tile" href="/category/free-vr-porn/">
          <span class="dvr-feature-emoji">🆓</span>
          <strong>Free VR Porn</strong>
          <span class="dvr-feature-desc">Free VR porn trailers in 180° 3D from the top studios — preview now, then watch the full scene in your headset.</span>
          <span class="dvr-feature-cta">Watch free VR porn →</span>
        </a>
        <a class="dvr-feature-tile" href="/category/anime/">
          <span class="dvr-feature-emoji">🎌</span>
          <strong>Anime VR Porn</strong>
          <span class="dvr-feature-desc">Anime, hentai &amp; cosplay characters brought to life in immersive 8K virtual reality.</span>
          <span class="dvr-feature-cta">Watch anime VR porn →</span>
        </a>
      </div>
    </div></section>

    <?php foreach ($studios as $s): ?>
    <section class="dvr-section dvr-section-dark"><div class="dvr-container">
      <div class="dvr-row-head"><h2><?php echo esc_html($s['name']); ?></h2><a href="/studio/<?php echo esc_attr($s['slug']); ?>/" class="dvr-viewall">View all →</a></div>
      <?php echo dvr_render_video_grid(['count'=>8,'studio'=>$s['slug'],'orderby'=>'date']); ?>
    </div></section>
    <?php endforeach; ?>

    <section class="dvr-section"><div class="dvr-container">
      <div class="dvr-section-header"><span class="dvr-label">BROWSE BY</span><h2>Find Your VR Experience</h2></div>
      <div class="dvr-cat-group"><p class="dvr-cat-group-label">Resolution</p><div class="dvr-pills">
        <a href="/category/4k-vr-porn/" class="cat-pill">🎥 4K VR</a>
        <a href="/category/6k-vr-porn/" class="cat-pill">🎥 6K VR</a>
        <a href="/category/8k-vr-porn/" class="cat-pill">🎥 8K VR</a>
        <a href="/category/ai-passthrough/" class="cat-pill">🥽 AI Passthrough</a>
        <a href="/category/360-vr/" class="cat-pill">🌐 360° VR</a>
      </div></div>
      <div class="dvr-cat-group"><p class="dvr-cat-group-label">Mood &amp; Theme</p><div class="dvr-pills">
        <a href="/category/fantasy/" class="cat-pill">✨ Fantasy</a>
        <a href="/category/cosplay/" class="cat-pill">🎭 Cosplay</a>
        <a href="/category/milf/" class="cat-pill">💋 MILF</a>
        <a href="/category/lesbian/" class="cat-pill">💜 Lesbian</a>
        <a href="/category/free-vr-porn/" class="cat-pill dvr-pill-accent">🆓 Free VR</a>
        <a href="/category/anime/" class="cat-pill dvr-pill-accent">🎌 Anime VR</a>
        <a href="/category/award-winning/" class="cat-pill">🏆 Award-Winning</a>
        <a href="/category/gay/" class="cat-pill">🏳️‍🌈 Gay VR</a>
      </div></div>
    </div></section>

    <section class="dvr-section dvr-section-dark"><div class="dvr-container">
      <div class="dvr-section-header"><span class="dvr-label">TOP RATED</span><h2>Best VR Porn Studios 2025</h2></div>
      <div class="dvr-studios-strip">
      <?php
      $cmp = [
        ['VR Bangers','vr-bangers','9.8','8K · 917 scenes'],['AR Porn','ar-porn','9.5','AI Passthrough · 514'],
        ['VR Conk','vr-conk','9.2','Cosplay · 248'],['BlowVR','blowvr','8.9','POV · 210'],
        ['VRB Trans','vrb-trans','8.7','Trans · 216'],['VRB Gay','vrb-gay','8.5','Gay · 49'],
      ];
      foreach ($cmp as $c) {
        echo '<a class="dvr-studio-mini" href="/studio/'.esc_attr($c[1]).'/"><div class="dvr-score-sm">'.esc_html($c[2]).'</div><div class="dvr-studio-mini-info"><strong>'.esc_html($c[0]).'</strong><span>'.esc_html($c[3]).'</span></div></a>';
      }
      ?>
      </div>
    </div></section>

    <!-- ── HOMEPAGE SEO TEXT ── -->
    <section class="dvr-section"><div class="dvr-container">
      <div class="dvr-seo-body dvr-home-seo">
        <h2>DudeVR — Your Guide to the Best VR Porn</h2>
        <p>Welcome to <strong>DudeVR</strong>, the internet's most trusted hub for <strong>VR porn</strong>. We track, preview and review thousands of immersive virtual reality scenes so you always know where to find the best <strong>8K VR porn</strong> before you spend a cent. Browse free trailers in your browser, then dive into the full experience on your headset.</p>
        <h2>Why watch porn in VR?</h2>
        <p>Virtual reality changes everything. Instead of watching a flat screen, a <a href="/category/180-vr/">180° VR</a> scene wraps around your field of view in true stereoscopic 3D, putting you right in the room with the performer. In a headset, eye contact, depth and scale feel astonishingly real — an experience traditional video simply can't match. The higher the resolution, the stronger the illusion, which is why <a href="/category/8k-vr-porn/">8K VR porn</a> and the new wave of <a href="/category/ai-passthrough/">AI passthrough</a> mixed-reality scenes are the gold standard.</p>
        <h2>The top VR porn studios, reviewed</h2>
        <p>We follow every major studio so you don't have to. <a href="/studio/vr-bangers/">VR Bangers</a> leads the pack with the largest 8K library and award-winning production; <a href="/studio/ar-porn/">AR Porn</a> pioneered passthrough mixed reality for Meta Quest 3; <a href="/studio/vr-conk/">VR Conk</a> owns the <a href="/category/cosplay/">cosplay</a> and <a href="/category/parody/">parody</a> niche; and <a href="/studio/blowvr/">BlowVR</a> specialises in immersive POV scenes. Prefer something specific? Explore <a href="/studio/vrb-trans/">VRB Trans</a> and <a href="/studio/vrb-gay/">VRB Gay</a> too.</p>
        <h2>Find exactly what you want</h2>
        <p>With over 2,000 scenes indexed across 140+ categories — from <a href="/category/milf/">MILF</a> and <a href="/category/teen/">teen</a> to <a href="/category/threesome/">threesome</a>, <a href="/category/lesbian/">lesbian</a> and <a href="/category/cosplay/">cosplay</a> — DudeVR makes it easy to discover your next favourite VR porn video. Want to try before you commit? Start with our <a href="/category/free-vr-porn/">free VR porn</a> trailers or dive into <a href="/category/anime/">anime VR porn</a>. New scenes are added every single day, so there's always something fresh to watch — browse our <a href="/vr-porn/">latest VR scenes</a> or every <a href="/category-archive/">category</a>.</p>
      </div>
    </div></section>
    <?php
    return ob_get_clean();
}

/* ════════════════════════════════════════════════
   ARCHIVE TEMPLATE OVERRIDE (category/studio/tag/search)
   ════════════════════════════════════════════════ */
add_filter('template_include', 'dvr_archive_template', 99);
function dvr_archive_template($template) {
    if (is_admin()) return $template;
    if (is_singular('post')) {
        $single = WPMU_PLUGIN_DIR . '/dudevr/dudevr-single.php';
        if (file_exists($single)) return $single;
    }
    if (is_category() || is_tag() || is_tax('studio') || is_tax('model') || is_search() || (is_home() && !is_front_page())) {
        $custom = WPMU_PLUGIN_DIR . '/dudevr/dudevr-archive.php';
        if (file_exists($custom)) return $custom;
    }
    return $template;
}

/* ════════════════════════════════════════════════
   CUSTOM FOOTER (hide REHub footer, inject premium)
   ════════════════════════════════════════════════ */
add_action('wp_footer', 'dvr_render_footer', 5);
function dvr_render_footer() {
    ?>
    <footer class="dvr-footer"><div class="dvr-container">
      <div class="dvr-footer-grid">
        <div class="dvr-footer-col dvr-footer-brand">
          <div class="dvr-footer-logo">Dude<span>VR</span></div>
          <p>The internet's most trusted guide to VR adult entertainment. Honest reviews, premium trailers, real recommendations.</p>
        </div>
        <div class="dvr-footer-col">
          <h4>Browse</h4>
          <a href="/vr-porn/">All VR Scenes</a>
          <a href="/category/8k-vr-porn/">8K VR Porn</a>
          <a href="/category/free-vr-porn/">Free VR Porn</a>
          <a href="/category/anime/">Anime VR Porn</a>
          <a href="/category/award-winning/">Award-Winning</a>
          <a href="/category-archive/">All Categories</a>
        </div>
        <div class="dvr-footer-col">
          <h4>Studios</h4>
          <a href="/studio/vr-bangers/">VR Bangers</a>
          <a href="/studio/ar-porn/">AR Porn</a>
          <a href="/studio/vr-conk/">VR Conk</a>
          <a href="/studio/blowvr/">BlowVR</a>
          <a href="/studio/vrb-trans/">VRB Trans</a>
          <a href="/studio/vrb-gay/">VRB Gay</a>
        </div>
        <div class="dvr-footer-col">
          <h4>Legal</h4>
          <a href="/privacy-cookies/">Privacy &amp; Cookies</a>
          <a href="#" onclick="if(window.cmplz_show_banner)cmplz_show_banner();return false;">Cookie Settings</a>
          <a href="/dmca/">DMCA / Content</a>
          <a href="/affiliate-disclosure/">Affiliate Disclosure</a>
        </div>
      </div>
      <div class="dvr-footer-bottom">
        <p><strong>18+ ONLY.</strong> This website contains adult content and is intended for adults aged 18 or older. All performers depicted were at least 18 years of age at the time of production. DudeVR is an affiliate showcase of trailers — full videos are hosted by their respective studios.</p>
        <p>© <?php echo esc_html(date('Y')); ?> DudeVR.com — All rights reserved. <a href="https://www.rtalabel.org/" target="_blank" rel="noopener">RTA Labeled</a></p>
      </div>
    </div></footer>
    <?php
}

/* ════════════════════════════════════════════════
   CSS
   ════════════════════════════════════════════════ */
function dudevr_css() {
    return <<<CSS
@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url('/wp-content/uploads/fonts/inter-var-latin.woff2') format('woff2');}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;src:url('/wp-content/uploads/fonts/spacegrotesk-var-latin.woff2') format('woff2');}
:root {
  --bg-obsidian:#0D0D0F; --bg-surface:#16161A; --bg-glass:rgba(255,255,255,0.05);
  --accent-cyan:#00E5FF; --accent-magenta:#E040FB;
  --text-primary:#F0F0F5; --text-muted:#8A8A9A;
  --border-glass:rgba(0,229,255,0.15); --radius-card:12px; --blur-glass:blur(12px);
}
body { background:var(--bg-obsidian) !important; color:var(--text-primary) !important; }
h1,h2,h3,h4,h5,h6 { font-family:"Space Grotesk",sans-serif !important; }
body,p,a,span,div,li { font-family:"Inter",sans-serif; }
.rh_wrapper,#wrapper,.main_wrapper,#content,.container_inner { background:var(--bg-obsidian) !important; }

/* ─── Header (force dark) ─── */
#main_header,#main_header.white_style,header#main_header {
  background:rgba(13,13,15,0.92) !important; border-bottom:1px solid rgba(0,229,255,0.1) !important; box-shadow:none !important;
}
.logo_section_wrap,.logo-section,.header_logo_clean { background:transparent !important; padding-top:14px !important; padding-bottom:6px !important; }
/* Main nav bar — kill REHub white_style */
.main-nav,.main-nav.white_style,#main_header .main-nav { background:rgba(13,13,15,0.96) !important; border-top:1px solid rgba(255,255,255,0.05) !important; box-shadow:none !important; }
.main-nav .rh-container { background:transparent !important; }
.main-nav.white_style a,.main-nav .menu li a,#main_header.white_style a,#main_header .menu li a,#main_header .rh-flex-center a,#main_header .menu_part a { color:var(--text-primary) !important; }
.main-nav .menu li a,#main_header .menu li a { font-weight:600 !important; letter-spacing:.02em !important; transition:color .2s !important; }
.main-nav .menu li a:hover,.main-nav .menu li.current-menu-item>a,#main_header .menu li a:hover,#main_header .menu li.current-menu-item>a { color:var(--accent-cyan) !important; }
.main-nav .menu>li>a::after { content:""; display:block; height:2px; width:0; background:var(--accent-cyan); transition:width .25s; margin-top:3px; box-shadow:0 0 8px rgba(0,229,255,.6); }
.main-nav .menu>li:hover>a::after,.main-nav .menu>li.current-menu-item>a::after { width:100%; }
#main_header.fixed,#main_header.sticky_header,.sticky_div.fixed,header.fixed {
  background:rgba(13,13,15,0.9) !important; backdrop-filter:blur(16px) !important; -webkit-backdrop-filter:blur(16px) !important;
  border-bottom:1px solid rgba(0,229,255,0.12) !important; box-shadow:0 4px 24px rgba(0,0,0,0.5) !important;
}
#main_header .sub-menu,#main_header ul ul { background:#16161A !important; border:1px solid var(--border-glass) !important; box-shadow:0 8px 30px rgba(0,0,0,.5) !important; }
#main_header .sub-menu li a:hover { background:rgba(0,229,255,.08) !important; }
.rh-search-trigger,#search_icon,.search_icon,.header-search a { color:var(--text-primary) !important; }

/* ─── Logo swap (neon) ─── */
.logo_image img,.logo_image_mobile img,a.logo_image img { display:none !important; }
a.logo_image,.logo_image {
  display:inline-block !important; width:190px !important; height:52px !important;
  background:url('https://dudevr.com/wp-content/uploads/2026/06/dudevr-logo-neon.png') center/contain no-repeat !important;
}
.logo_image_mobile {
  display:inline-block !important; width:150px !important; height:42px !important;
  background:url('https://dudevr.com/wp-content/uploads/2026/06/dudevr-logo-neon.png') left center/contain no-repeat !important;
}

/* ─── Buttons ─── */
.btn-neon { background:transparent !important; border:2px solid var(--accent-cyan) !important; color:var(--accent-cyan) !important;
  border-radius:6px !important; padding:12px 28px !important; font-weight:700 !important; letter-spacing:.05em !important;
  text-transform:uppercase !important; font-size:13px !important; display:inline-block; text-decoration:none; transition:all .25s !important; }
.btn-neon:hover { background:var(--accent-cyan) !important; color:#000 !important; box-shadow:0 0 20px rgba(0,229,255,.5) !important; }

/* ─── Layout ─── */
.dvr-container { max-width:1280px; margin:0 auto; padding:0 20px; }
.dvr-section { padding:50px 0; }
.dvr-section-dark { background:rgba(255,255,255,0.02); }
.dvr-row-head { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:24px; }
.dvr-row-head h2 { font-size:clamp(20px,2.4vw,28px); color:var(--text-primary); margin:0; }
.dvr-viewall { color:var(--accent-cyan); font-size:13px; font-weight:600; text-decoration:none; white-space:nowrap; }
.dvr-viewall:hover { text-shadow:0 0 10px rgba(0,229,255,.5); }
.dvr-section-header { text-align:center; margin-bottom:32px; }
.dvr-section-header h2 { font-size:clamp(24px,3vw,34px); color:var(--text-primary); margin:6px 0 0; }
.dvr-label { display:inline-block; font-size:10px; font-weight:700; letter-spacing:.18em; color:var(--accent-cyan); text-transform:uppercase; }

/* ─── Hero ─── */
.dvr-hero { padding:70px 0 50px; text-align:center;
  background:radial-gradient(ellipse at 70% 30%,rgba(0,229,255,.07) 0%,transparent 55%),
             radial-gradient(ellipse at 20% 90%,rgba(224,64,251,.08) 0%,transparent 55%),var(--bg-obsidian); }
.dvr-eyebrow { display:inline-block; font-size:11px; font-weight:700; letter-spacing:.2em; color:var(--accent-cyan); text-transform:uppercase; margin-bottom:14px; }
.dvr-hero-h1 { font-size:clamp(32px,5vw,52px); font-weight:700; line-height:1.1; color:var(--text-primary); margin:0 0 14px; }
.dvr-hero-sub { font-size:17px; color:var(--text-muted); margin:0 auto 28px; max-width:560px; }
.dvr-search { display:flex; max-width:560px; margin:0 auto; }
.dvr-search input { flex:1; background:rgba(255,255,255,0.06); border:1px solid var(--border-glass); border-right:none;
  border-radius:8px 0 0 8px; padding:14px 18px; color:var(--text-primary); font-size:15px; outline:none; }
.dvr-search input::placeholder { color:var(--text-muted); }
.dvr-search input:focus { border-color:var(--accent-cyan); }
.dvr-search button { background:var(--accent-cyan); color:#000; border:none; border-radius:0 8px 8px 0; padding:0 28px;
  font-weight:700; cursor:pointer; font-size:14px; text-transform:uppercase; letter-spacing:.05em; }
.dvr-search button:hover { box-shadow:0 0 20px rgba(0,229,255,.5); }

/* ─── Trust bar ─── */
.dvr-trust-bar { background:rgba(0,229,255,.04); border-top:1px solid var(--border-glass); border-bottom:1px solid var(--border-glass); padding:16px 0; }
.dvr-trust-inner { display:flex; justify-content:center; gap:40px; flex-wrap:wrap; font-size:14px; font-weight:600; color:var(--text-muted); }

/* ─── VIDEO GRID ─── */
.dvr-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }
.dvr-vid { position:relative; display:block; }
.dvr-vid-thumb { position:relative; display:block; aspect-ratio:16/9; border-radius:10px; overflow:hidden;
  background:var(--bg-surface); border:1px solid rgba(255,255,255,0.06); transition:transform .25s,border-color .25s,box-shadow .25s; }
.dvr-vid:hover .dvr-vid-thumb { transform:translateY(-4px); border-color:var(--accent-cyan); box-shadow:0 10px 36px rgba(0,229,255,.18); }
.dvr-vid-thumb img,.dvr-vid-thumb video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.dvr-vid-thumb video { opacity:0; transition:opacity .3s; }
.dvr-vid-thumb.is-playing video { opacity:1; }
.dvr-vid-thumb.is-playing img { opacity:0; }
.dvr-vid-thumb img { transition:opacity .3s,transform .4s; }
.dvr-vid:hover .dvr-vid-thumb img { transform:scale(1.05); }
.dvr-vid-studio { position:absolute; top:8px; left:8px; z-index:2; background:rgba(13,13,15,.82);
  border:1px solid var(--accent-magenta); color:var(--accent-magenta); font-size:10px; font-weight:700;
  padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:.05em; }
.dvr-vid-res { position:absolute; top:8px; right:8px; z-index:2; background:var(--accent-cyan); color:#000; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; }
.dvr-vid-dur { position:absolute; bottom:8px; right:8px; z-index:2; background:rgba(13,13,15,.85); color:#fff; font-size:11px; font-weight:600; padding:3px 8px; border-radius:4px; }
.dvr-vid-play { position:absolute; inset:0; z-index:2; display:flex; align-items:center; justify-content:center; color:#fff; opacity:.85; transition:opacity .25s; pointer-events:none; }
.dvr-vid-play svg { background:rgba(0,229,255,.85); color:#000; border-radius:50%; padding:12px; width:46px; height:46px; box-shadow:0 4px 20px rgba(0,0,0,.5); }
.dvr-vid:hover .dvr-vid-play,.dvr-vid-thumb.is-playing .dvr-vid-play { opacity:0; }
.dvr-vid-title { font-size:14px; font-weight:600; margin:10px 2px 6px; line-height:1.4; }
.dvr-vid-title a { color:var(--text-primary); text-decoration:none; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.dvr-vid:hover .dvr-vid-title a { color:var(--accent-cyan); }
/* Always-visible buy CTA (mobile-critical) */
.dvr-vid-buy { display:block; text-align:center; background:var(--accent-magenta); color:#fff !important;
  font-size:13px; font-weight:700; padding:9px 12px; border-radius:6px; text-decoration:none; letter-spacing:.02em;
  transition:box-shadow .2s,transform .2s,filter .2s; }
.dvr-vid-buy:hover { box-shadow:0 0 22px rgba(224,64,251,.55); transform:translateY(-1px); filter:brightness(1.08); }

/* ─── SINGLE SCENE PAGE (custom template) ─── */
/* hide REHub single leftovers */
.single .title_single_area,.single .wpsm_score_box,.single .rh-300-sidebar,.single #breadcrumb { display:none !important; }
.dvr-single { padding:24px 0 40px; }
.dvr-single-title { font-size:clamp(26px,4vw,40px); color:var(--text-primary); margin:14px 0 12px; line-height:1.15; }
.dvr-single-meta { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:26px; }
.dvr-single-studio { background:rgba(224,64,251,.12); border:1px solid var(--accent-magenta); color:var(--accent-magenta) !important;
  font-size:12px; font-weight:700; padding:5px 12px; border-radius:6px; text-decoration:none; text-transform:uppercase; letter-spacing:.04em; }
.dvr-single-tag { background:rgba(0,229,255,.1); border:1px solid var(--border-glass); color:var(--accent-cyan); font-size:12px; font-weight:700; padding:5px 12px; border-radius:6px; }
.dvr-single-date { color:var(--text-muted); font-size:13px; }
/* hero: player + sticky buy card */
.dvr-single-hero { display:grid; grid-template-columns:1fr 360px; gap:28px; align-items:start; margin-bottom:30px; }
.dvr-single-player .video-container { border-radius:14px; overflow:hidden; border:1px solid var(--border-glass); box-shadow:0 12px 50px rgba(0,0,0,.5); margin:0; }
.dvr-single-player .video-container iframe { display:block; width:100%; aspect-ratio:16/9; border:0; }
/* ── 180° WebXR preview ── */
.dvr-vrwrap { position:relative; }
.dvr-vr-launch { position:absolute; left:50%; bottom:14px; transform:translateX(-50%); z-index:5;
  display:inline-flex; align-items:center; gap:8px; background:rgba(13,13,15,.82); backdrop-filter:blur(6px);
  border:1px solid var(--accent-cyan); color:var(--accent-cyan); font-weight:700; font-size:14px;
  padding:11px 20px; border-radius:50px; cursor:pointer; transition:background .2s,box-shadow .2s,color .2s; }
.dvr-vr-launch:hover { background:var(--accent-cyan); color:#000; box-shadow:0 0 22px rgba(0,229,255,.5); }
.dvr-vrwrap.dvr-vr-active { aspect-ratio:16/9; }
.dvr-vr-stage { position:relative; width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden;
  border:1px solid var(--border-glass); box-shadow:0 12px 50px rgba(0,0,0,.5); background:#000; touch-action:none; }
.dvr-vr-stage canvas { display:block; width:100% !important; height:100% !important; cursor:grab; }
.dvr-vr-stage canvas:active { cursor:grabbing; }
.dvr-vr-enter { position:absolute; right:14px; bottom:14px; z-index:6; background:var(--accent-magenta); color:#fff;
  border:0; font-weight:800; font-size:14px; padding:11px 20px; border-radius:50px; cursor:pointer;
  box-shadow:0 6px 24px rgba(224,64,251,.45); }
.dvr-vr-enter:hover { filter:brightness(1.08); }
.dvr-vr-hint { position:absolute; left:14px; bottom:16px; z-index:6; color:#fff; font-size:12px; font-weight:600;
  background:rgba(0,0,0,.45); padding:6px 12px; border-radius:8px; pointer-events:none; transition:opacity .6s; }
.dvr-vr-hint.fade { opacity:0; }
.dvr-player-actions { display:flex; gap:12px; margin-top:14px; }
.dvr-btn-magenta { flex:1; text-align:center; background:var(--accent-magenta); color:#fff !important; font-weight:800; font-size:15px; padding:15px; border-radius:10px; text-decoration:none; box-shadow:0 6px 26px rgba(224,64,251,.35); transition:transform .2s,box-shadow .2s; }
.dvr-btn-magenta:hover { transform:translateY(-2px); box-shadow:0 8px 36px rgba(224,64,251,.6); }
.dvr-btn-ghost-cyan { text-align:center; background:transparent; border:2px solid var(--accent-cyan); color:var(--accent-cyan) !important; font-weight:700; font-size:15px; padding:13px 24px; border-radius:10px; text-decoration:none; transition:all .2s; }
.dvr-btn-ghost-cyan:hover { background:var(--accent-cyan); color:#000 !important; box-shadow:0 0 20px rgba(0,229,255,.5); }
.dvr-single-buy { position:sticky; top:90px; }
.dvr-buy-card { background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:14px; overflow:hidden; box-shadow:0 10px 40px rgba(0,0,0,.4); }
.dvr-buy-poster { height:150px; background-size:cover; background-position:center; }
.dvr-buy-body { padding:20px; }
.dvr-buy-studio { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
.dvr-buy-studio span { font-family:"Space Grotesk"; font-weight:700; font-size:18px; color:var(--text-primary); }
.dvr-buy-studio b { background:linear-gradient(135deg,var(--accent-cyan),#0090a8); color:#000; font-size:15px; font-weight:800; padding:3px 10px; border-radius:7px; }
.dvr-buy-spec { color:var(--accent-cyan); font-size:13px; font-weight:600; margin-bottom:14px; }
.dvr-buy-benes { list-style:none; margin:0 0 18px; padding:0; }
.dvr-buy-benes li { color:var(--text-muted); font-size:14px; padding:4px 0; }
.dvr-buy-benes li::before { content:"✓ "; color:var(--accent-cyan); font-weight:800; }
.dvr-buy-cta { display:block; text-align:center; background:var(--accent-magenta); color:#fff !important; font-weight:800; font-size:16px; padding:15px; border-radius:10px; text-decoration:none; box-shadow:0 6px 26px rgba(224,64,251,.4); transition:transform .2s,box-shadow .2s; }
.dvr-buy-cta:hover { transform:translateY(-2px); box-shadow:0 8px 38px rgba(224,64,251,.65); }
.dvr-buy-cta2 { display:block; text-align:center; margin-top:10px; background:transparent; border:1px solid var(--border-glass); color:var(--text-primary) !important; font-weight:700; font-size:14px; padding:11px; border-radius:10px; text-decoration:none; transition:border-color .2s; }
.dvr-buy-cta2:hover { border-color:var(--accent-cyan); color:var(--accent-cyan) !important; }
.dvr-buy-trust { margin-top:14px; text-align:center; color:var(--text-muted); font-size:11px; }
/* meta pills */
.dvr-single-pills { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 30px; }
.dvr-pill-model { border-color:rgba(224,64,251,.35) !important; color:var(--accent-magenta) !important; }
/* description */
.dvr-single-desc { color:var(--text-muted); font-size:16px; line-height:1.85; max-width:860px; margin:0 0 36px; }
.dvr-single-desc p { margin:0 0 16px; }
.dvr-single-desc h2,.dvr-single-desc h3 { color:var(--text-primary); margin:28px 0 12px; }
.dvr-single-desc h2 { font-size:24px; } .dvr-single-desc h3 { font-size:19px; }
.dvr-single-desc a { color:var(--accent-cyan); text-decoration:none; }
.dvr-single-desc a:hover { text-decoration:underline; }
.dvr-single-desc strong { color:var(--text-primary); }
.dvr-single-desc ul { color:var(--text-muted); padding-left:20px; }
/* gallery */
.dvr-single-gallery { margin:0 0 36px; }
.dvr-single-gallery h2 { font-size:22px; color:var(--text-primary); margin:0 0 16px; }
.dvr-single-gallery .vr-gallery { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; }
.dvr-single-gallery .vr-gallery img { width:100%; aspect-ratio:16/10; object-fit:cover; border-radius:10px; border:1px solid rgba(255,255,255,0.06); transition:transform .25s,border-color .25s; }
.dvr-single-gallery .vr-gallery img:hover { transform:scale(1.03); border-color:var(--accent-cyan); }

/* ─── Scene page conversion ─── */
.dvr-scene-cta { background:linear-gradient(135deg,rgba(224,64,251,.12),rgba(0,229,255,.08)); border:1px solid var(--accent-magenta);
  border-radius:14px; padding:28px; margin:30px 0; text-align:center; }
.dvr-scene-cta-head { font-family:"Space Grotesk"; font-size:clamp(20px,3vw,28px); font-weight:700; color:var(--text-primary); margin-bottom:16px; }
.dvr-scene-cta-head span { color:var(--accent-cyan); }
.dvr-scene-cta-benes { display:flex; flex-wrap:wrap; justify-content:center; gap:14px 24px; margin-bottom:22px; color:var(--text-muted); font-size:14px; font-weight:600; }
.dvr-scene-cta-btn { display:inline-block; background:var(--accent-magenta); color:#fff !important; font-size:17px; font-weight:800;
  padding:16px 40px; border-radius:10px; text-decoration:none; letter-spacing:.02em; box-shadow:0 6px 30px rgba(224,64,251,.35); transition:transform .2s,box-shadow .2s; }
.dvr-scene-cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 40px rgba(224,64,251,.6); }
.dvr-related { margin:40px 0 20px; }
/* Sticky mobile CTA */
.dvr-sticky-cta { display:none; }
@media (max-width:768px) {
  .dvr-sticky-cta { display:block; position:fixed; left:0; right:0; bottom:0; z-index:9999; text-align:center;
    background:var(--accent-magenta); color:#fff !important; font-size:16px; font-weight:800; padding:15px;
    text-decoration:none; box-shadow:0 -4px 24px rgba(0,0,0,.5); }
  body.single { padding-bottom:60px; }
}

/* ─── Category pills ─── */
.dvr-cat-group { margin-bottom:22px; }
.dvr-cat-group-label { font-size:11px; font-weight:700; letter-spacing:.12em; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px; }
.dvr-pills { display:flex; flex-wrap:wrap; gap:10px; }
.dvr-pills-wrap { gap:8px; }
.cat-pill { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:50px;
  border:1px solid var(--border-glass); background:var(--bg-glass); color:var(--text-primary); font-size:13px; font-weight:600;
  text-decoration:none; transition:border-color .2s,box-shadow .2s,color .2s; }
.cat-pill:hover { border-color:var(--accent-cyan); box-shadow:0 0 12px rgba(0,229,255,.2); color:var(--accent-cyan); }
.dvr-pill-count { color:var(--text-muted); font-size:11px; font-weight:500; }
.dvr-pill-accent { border-color:var(--accent-magenta) !important; color:var(--accent-magenta) !important; }
.dvr-pill-accent:hover { box-shadow:0 0 12px rgba(224,64,251,.25) !important; }

/* ─── Studios strip ─── */
.dvr-studios-strip { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }
.dvr-studio-mini { display:flex; align-items:center; gap:14px; background:rgba(255,255,255,0.04);
  border:1px solid var(--border-glass); border-radius:10px; padding:14px 16px; text-decoration:none; transition:border-color .2s,transform .2s; }
.dvr-studio-mini:hover { border-color:var(--accent-cyan); transform:translateY(-2px); }
.dvr-score-sm { background:linear-gradient(135deg,var(--accent-cyan),#0090a8); color:#000; font-weight:800; font-size:16px; border-radius:7px; padding:6px 10px; }
.dvr-studio-mini-info { display:flex; flex-direction:column; }
.dvr-studio-mini-info strong { color:var(--text-primary); font-size:14px; }
.dvr-studio-mini-info span { color:var(--text-muted); font-size:11px; }

/* ─── Featured / most popular tiles ─── */
.dvr-feature-tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
.dvr-feature-tile { display:flex; flex-direction:column; gap:8px; padding:26px 24px; border-radius:var(--radius-card);
  background:linear-gradient(145deg,rgba(224,64,251,0.08),rgba(0,229,255,0.05)); border:1px solid var(--border-glass);
  text-decoration:none; transition:border-color .2s,transform .2s,box-shadow .2s; }
.dvr-feature-tile:hover { border-color:var(--accent-magenta); transform:translateY(-3px); box-shadow:0 10px 30px rgba(224,64,251,.18); }
.dvr-feature-emoji { font-size:30px; }
.dvr-feature-tile strong { font-family:"Space Grotesk",sans-serif; font-size:22px; color:var(--text-primary); }
.dvr-feature-desc { color:var(--text-muted); font-size:14px; line-height:1.5; }
.dvr-feature-cta { color:var(--accent-cyan); font-weight:700; font-size:14px; margin-top:4px; }

/* ─── Archive header ─── */
.dvr-breadcrumb { padding:24px 0 0; font-size:13px; color:var(--text-muted); }
.dvr-breadcrumb a { color:var(--text-muted); text-decoration:none; }
.dvr-breadcrumb a:hover { color:var(--accent-cyan); }
.dvr-breadcrumb em { color:var(--accent-cyan); font-style:normal; margin:0 4px; }
.dvr-breadcrumb span { color:var(--text-primary); }
.dvr-archive-head { padding:20px 0 16px; text-align:center; }
.dvr-archive-head h1 { font-size:clamp(28px,4vw,42px); color:var(--text-primary); margin:0 0 8px; }
.dvr-archive-head p { color:var(--text-muted); font-size:15px; margin:0; }
.dvr-studio-banner { display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;
  background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(224,64,251,.08)); border:1px solid var(--border-glass);
  border-radius:14px; padding:22px 28px; margin:0 0 26px; }
.dvr-studio-banner-txt strong { display:block; font-family:"Space Grotesk"; font-size:20px; color:var(--text-primary); }
.dvr-studio-banner-txt span { color:var(--text-muted); font-size:14px; }
.dvr-seo-intro { color:var(--text-muted); font-size:15px; line-height:1.8; max-width:900px; margin:0 auto 30px;
  background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:22px 26px; }
.dvr-seo-intro strong { color:var(--text-primary); }
.dvr-seo-intro h2,.dvr-seo-intro h3 { color:var(--text-primary); font-size:18px; margin:16px 0 8px; }
/* SEO body (term description) below grid */
.dvr-seo-body { color:var(--text-muted); font-size:16px; line-height:1.85; max-width:880px; margin:48px auto 10px;
  padding-top:32px; border-top:1px solid rgba(255,255,255,0.07); }
.dvr-seo-body p { margin:0 0 16px; }
.dvr-seo-body h2 { font-family:"Space Grotesk"; color:var(--text-primary); font-size:22px; margin:28px 0 10px; }
.dvr-seo-body h3 { color:var(--accent-cyan); font-size:17px; margin:22px 0 8px; }
.dvr-seo-body a { color:var(--accent-cyan); text-decoration:none; }
.dvr-seo-body a:hover { text-decoration:underline; }
.dvr-seo-body strong { color:var(--text-primary); }
.dvr-seo-body ul,.dvr-seo-body ol { padding-left:22px; }
.dvr-related-cats { margin:44px 0 10px; }
.dvr-related-cats h2 { font-size:20px; color:var(--text-primary); margin:0 0 16px; }

/* ─── Legal / content pages ─── */
/* hide REHub page sidebar → full-width content box */
.page .sidebar,aside.sidebar { display:none !important; }
.page .main-side,.main-side.page { width:100% !important; max-width:100% !important; float:none !important; margin:0 !important; }
.page .title .entry-title,.page-template .entry-title { font-size:clamp(28px,4vw,40px) !important; color:var(--text-primary) !important; text-align:center; padding:30px 0 6px; }
.dvr-legal { max-width:840px; margin:0 auto; padding:18px 0 50px; color:var(--text-muted); font-size:16px; line-height:1.85; }
.dvr-legal .dvr-legal-intro { color:var(--text-primary); font-size:18px; line-height:1.7; background:rgba(0,229,255,.04); border:1px solid var(--border-glass); border-radius:12px; padding:20px 24px; margin-bottom:30px; }
.dvr-legal h2 { font-family:"Space Grotesk"; color:var(--text-primary); font-size:22px; margin:34px 0 12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06); }
.dvr-legal h2:first-of-type { border-top:none; padding-top:0; }
.dvr-legal h3 { color:var(--accent-cyan); font-size:17px; margin:22px 0 8px; }
.dvr-legal p { margin:0 0 16px; }
.dvr-legal ul,.dvr-legal ol { margin:0 0 18px; padding-left:22px; }
.dvr-legal li { margin:6px 0; }
.dvr-legal a { color:var(--accent-cyan); text-decoration:none; }
.dvr-legal a:hover { text-decoration:underline; }
.dvr-legal strong { color:var(--text-primary); }
.dvr-legal .dvr-legal-updated { color:var(--text-muted); font-size:13px; font-style:italic; margin-bottom:24px; }
.dvr-legal-btn { display:inline-block; background:var(--accent-cyan); color:#000 !important; font-weight:700; padding:12px 26px; border-radius:8px; text-decoration:none; margin-top:6px; }
.dvr-legal-btn:hover { box-shadow:0 0 20px rgba(0,229,255,.5); }
.dvr-pagination { display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin:40px 0 10px; }
.dvr-pagination a,.dvr-pagination span { padding:9px 15px; border-radius:8px; border:1px solid var(--border-glass);
  color:var(--text-primary); text-decoration:none; font-weight:600; font-size:14px; }
.dvr-pagination a:hover { border-color:var(--accent-cyan); color:var(--accent-cyan); }
.dvr-pagination .current { background:var(--accent-cyan); color:#000; border-color:var(--accent-cyan); }

/* ─── Single post (scene): trailer + buy buttons ─── */
.video-container { border-radius:12px; overflow:hidden; border:1px solid var(--border-glass); margin-bottom:20px; }
.video-container iframe { display:block; width:100%; aspect-ratio:16/9; border:0; }
.video-buttons { display:flex; gap:14px; flex-wrap:wrap; max-width:640px; margin:24px auto; }
.video-buttons a { flex:1 1 45%; text-align:center; padding:16px 20px !important; border-radius:8px !important; font-weight:700 !important; font-size:15px !important; text-decoration:none !important; transition:all .25s !important; }
.video-buttons a.btn-unlock { background:var(--accent-magenta) !important; color:#fff !important; }
.video-buttons a.btn-unlock:hover { box-shadow:0 0 24px rgba(224,64,251,.5) !important; transform:translateY(-2px); }
.video-buttons a.btn-download { background:transparent !important; border:2px solid var(--accent-cyan) !important; color:var(--accent-cyan) !important; }
.video-buttons a.btn-download:hover { background:var(--accent-cyan) !important; color:#000 !important; box-shadow:0 0 20px rgba(0,229,255,.5) !important; }
.video-info { color:var(--text-muted); text-align:center; margin-bottom:20px; }
.video-info strong { color:var(--accent-cyan); }
.vr-gallery { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; margin:20px 0; }
.vr-gallery img { width:100%; border-radius:8px; border:1px solid rgba(255,255,255,0.06); }
.single .post_inner_wrapper,.single article,.post_content { color:var(--text-primary) !important; }
.single h1,.single h2,.single h3 { color:var(--text-primary) !important; }

/* ─── REHub dark patches ─── */
.rh_box,.rehub_box,.post_inner_wrapper,.blog_content_wrapper,#breadcrumb { background:transparent !important; }
.col_item,.col_grid,.store_for_grid { background:var(--bg-surface) !important; border-color:var(--border-glass) !important; }
/* REHub outer + content wrappers are #fff by default → force dark so obsidian shows on ALL viewports (mobile fix) */
html,body,.rh-outer-wrap { background:var(--bg-obsidian) !important; }
.rh-outer-wrap,.rehub_main_wrap,#content,.rh-main-content,.rh-content-area,.site-content { background:transparent !important; box-shadow:none !important; }
.rh-post-wrapper,.rh-post-wrapper.mb0,.main-side,.main-side.page,.rh-content-wrap,article.post,.page .post { background:transparent !important; box-shadow:none !important; }
.main-side .post>.title,.main-side .post>.title a,.entry-content,.post_content,.page article,.page article p,.page article li { color:var(--text-primary) !important; }
.page article a:not(.cat-pill):not(.btn-neon):not(.dvr-vid-buy) { color:var(--accent-cyan); }

/* ─── FOOTER ─── */
footer#theme_footer,.footer-bottom,.footer_most_bottom { display:none !important; }
.dvr-footer { background:#08080A; border-top:1px solid rgba(0,229,255,.12); padding:56px 0 28px; margin-top:40px; }
.dvr-footer-grid { display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:40px; margin-bottom:40px; }
.dvr-footer-logo { font-family:"Space Grotesk"; font-weight:700; font-size:24px; color:var(--text-primary); margin-bottom:14px; }
.dvr-footer-logo span { color:var(--accent-cyan); }
.dvr-footer-brand p { color:var(--text-muted); font-size:14px; line-height:1.7; max-width:340px; }
.dvr-footer-col h4 { color:var(--accent-cyan); font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin:0 0 18px; }
.dvr-footer-col a { color:var(--text-muted); font-size:14px; display:block; margin-bottom:10px; text-decoration:none; transition:color .2s; }
.dvr-footer-col a:hover { color:var(--text-primary); }
.dvr-footer-bottom { border-top:1px solid rgba(255,255,255,0.07); padding-top:24px; }
.dvr-footer-bottom p { color:var(--text-muted); font-size:12px; line-height:1.7; margin:0 0 8px; }
.dvr-footer-bottom strong { color:var(--accent-magenta); }
.dvr-footer-bottom a { color:var(--accent-cyan); text-decoration:none; }

/* ─── Mobile ─── */
@media (max-width:980px) {
  .dvr-single-hero { grid-template-columns:1fr; }
  .dvr-single-buy { position:static; }
  .dvr-buy-poster { display:none; }
}
@media (max-width:768px) {
  .dvr-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
  .dvr-vid-title { font-size:12px; }
  .dvr-trust-inner { gap:18px; font-size:12px; }
  .dvr-hero { padding:50px 0 36px; }
  .video-buttons a { flex:1 1 100%; }
  .dvr-footer-grid { grid-template-columns:1fr 1fr; gap:28px; }
  .dvr-player-actions { flex-direction:column; }
  .dvr-single-gallery .vr-gallery { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:420px) { .dvr-grid { grid-template-columns:1fr; } .dvr-footer-grid { grid-template-columns:1fr; } }
CSS;
}

/* ════════════════════════════════════════════════
   HOVER-PLAY JS
   ════════════════════════════════════════════════ */
function dudevr_js() {
    return <<<JS
(function(){
  // Affiliate click tracking (ALL devices) → GA4 event "affiliate_click". Capture phase so it fires before navigation.
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a[rel~="sponsored"]') : null;
    if (!a) return;
    var d = { placement: a.getAttribute('data-aff-placement')||'other',
              studio:    a.getAttribute('data-aff-studio')||'',
              scene:     a.getAttribute('data-aff-scene')||'',
              link_url:  a.href };
    try {
      if (window.gtag) { gtag('event','affiliate_click', d); }
      else { window.dataLayer=window.dataLayer||[]; window.dataLayer.push({event:'affiliate_click',placement:d.placement,studio:d.studio,scene:d.scene,link_url:d.link_url}); }
    } catch(err){}
  }, true);
})();
(function(){
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouch) return;
  function bind(thumb){
    var url = thumb.getAttribute('data-trailer'); if (!url) return;
    var video = thumb.querySelector('video'); var t;
    thumb.parentElement.addEventListener('mouseenter', function(){
      t = setTimeout(function(){ if(!video.src) video.src = url; thumb.classList.add('is-playing');
        var p = video.play(); if (p && p.catch) p.catch(function(){}); }, 180);
    });
    thumb.parentElement.addEventListener('mouseleave', function(){
      clearTimeout(t); thumb.classList.remove('is-playing'); try { video.pause(); } catch(e){}
    });
  }
  function init(){ document.querySelectorAll('.dvr-vid-thumb[data-trailer]').forEach(bind); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
JS;
}
