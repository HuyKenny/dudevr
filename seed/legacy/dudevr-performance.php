<?php
/**
 * DudeVR Performance — strip frontend bloat (emoji, embed, block CSS, Elementor leftovers).
 * Self-contained, hook-based mu-plugin. Conservative: does NOT touch jQuery Migrate or
 * defer REHub JS (would break unveil/hoverintent lazyload).
 */
defined('ABSPATH') || exit;

/* ── Disable the WordPress emoji loader (inline JS + CSS + extra DNS) ── */
add_action('init', function () {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    add_filter('emoji_svg_url', '__return_false');
    add_filter('tiny_mce_plugins', function ($p) { return is_array($p) ? array_diff($p, ['wpemoji']) : $p; });
});

/* ── Remove wp-embed, Gutenberg block CSS (site uses Classic Editor), dashicons for guests ── */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) return;
    wp_dequeue_script('wp-embed');
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('classic-theme-styles');
    wp_dequeue_style('global-styles');
    if (!is_user_logged_in()) {
        wp_dequeue_style('dashicons');
    }
    if (!is_singular() || !comments_open()) {
        wp_dequeue_script('comment-reply');
    }
}, 100);

/* ── Strip Elementor frontend assets (belt-and-suspenders; plugin is also deactivated) ── */
add_action('wp_enqueue_scripts', function () {
    if (is_admin()) return;
    foreach ([
        'elementor-frontend', 'elementor-frontend-legacy', 'elementor-common', 'elementor-icons',
        'elementor-animations', 'elementor-post', 'elementor-global', 'elementor-frontend-modules',
        'e-animations', 'elementor-icons-shared-0', 'elementor-icons-fa-solid',
    ] as $h) {
        wp_dequeue_style($h);
        wp_dequeue_script($h);
    }
}, 999);

/* ── Trim <head> clutter (RSD, WLW manifest, shortlink, extra feeds, adjacent rel) ── */
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'wp_shortlink_wp_head');
remove_action('wp_head', 'feed_links_extra', 3);
remove_action('wp_head', 'adjacent_posts_rel_link_wp_head', 10);

/* ── Slow the admin Heartbeat to cut background admin-ajax load on shared hosting ── */
add_filter('heartbeat_settings', function ($s) { $s['interval'] = 60; return $s; });

/* ── Security: block author enumeration (?author=N → username leak) for guests ── */
add_action('template_redirect', function () {
    if (!is_admin() && isset($_GET['author']) && !is_user_logged_in()) {
        wp_safe_redirect(home_url('/'), 301);
        exit;
    }
});

/* ── Security: strip the X-Pingback header (xmlrpc already blocked) ── */
add_filter('wp_headers', function ($h) { unset($h['X-Pingback']); return $h; });
