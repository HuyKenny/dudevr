<?php
/**
 * DudeVR IndexNow — auto-submit new/updated URLs to Bing, Yandex & co.
 * Self-contained mu-plugin (hook-based, safe in mu-plugins root).
 * Key file: https://dudevr.com/e32dcc56797d6a2aa353cf4c19499a86.txt
 */
defined('ABSPATH') || exit;

if (!defined('DVR_INDEXNOW_KEY')) define('DVR_INDEXNOW_KEY', 'e32dcc56797d6a2aa353cf4c19499a86');

/** Send a batch of URLs to the IndexNow API (fire-and-forget). */
function dvr_indexnow_submit($urls) {
    $urls = array_values(array_unique(array_filter((array)$urls)));
    if (empty($urls)) return;
    $urls = array_slice($urls, 0, 10000); // API limit per request
    $payload = wp_json_encode([
        'host'        => parse_url(home_url(), PHP_URL_HOST),
        'key'         => DVR_INDEXNOW_KEY,
        'keyLocation' => home_url('/' . DVR_INDEXNOW_KEY . '.txt'),
        'urlList'     => $urls,
    ]);
    wp_remote_post('https://api.indexnow.org/indexnow', [
        'headers'  => ['Content-Type' => 'application/json; charset=utf-8'],
        'body'     => $payload,
        'timeout'  => 15,
        'blocking' => false,
    ]);
}

/** Queue a URL; flush all queued (deduped) at request shutdown so bulk imports send one batch. */
function dvr_indexnow_queue($url) {
    if (!$url) return;
    if (empty($GLOBALS['dvr_indexnow_urls'])) {
        $GLOBALS['dvr_indexnow_urls'] = [];
        add_action('shutdown', 'dvr_indexnow_flush');
    }
    $GLOBALS['dvr_indexnow_urls'][] = $url;
}

function dvr_indexnow_flush() {
    if (empty($GLOBALS['dvr_indexnow_urls'])) return;
    dvr_indexnow_submit($GLOBALS['dvr_indexnow_urls']);
    $GLOBALS['dvr_indexnow_urls'] = [];
}

/** Scene/page published or updated → queue it (covers WP All Import nightly auto-imports). */
add_action('transition_post_status', function ($new, $old, $post) {
    if ($new !== 'publish') return;
    if (wp_is_post_revision($post->ID) || wp_is_post_autosave($post->ID)) return;
    if (!in_array($post->post_type, ['post', 'page'], true)) return;
    dvr_indexnow_queue(get_permalink($post->ID));
}, 10, 3);

/** New/edited term (category/studio/model) → queue its archive URL. */
foreach (['created_term', 'edited_term'] as $hook) {
    add_action($hook, function ($term_id, $tt_id, $taxonomy) {
        if (!in_array($taxonomy, ['category', 'post_tag', 'studio', 'model'], true)) return;
        $link = get_term_link((int)$term_id, $taxonomy);
        if (!is_wp_error($link)) dvr_indexnow_queue($link);
    }, 10, 3);
}
