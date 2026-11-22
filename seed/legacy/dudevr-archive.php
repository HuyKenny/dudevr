<?php
/**
 * DudeVR custom archive template — video grid for category/studio/tag/search/home.
 * Loaded via template_include filter from dudevr-design-tokens.php
 */
defined('ABSPATH') || exit;

get_header();

global $wp_query;

if (!function_exists('dvr_title_suffix')) {
    function dvr_title_suffix($name) {
        $l = strtolower($name);
        return (strpos($l, 'porn') !== false || strpos($l, ' vr') !== false) ? $name : $name . ' VR Porn';
    }
}

$term = null; $term_desc = ''; $studio_slug = ''; $studio_aff = '';
if (is_home()) {
    $title = 'All VR Porn Scenes';
    $desc  = $wp_query->found_posts . ' immersive VR scenes — newest first';
} elseif (is_search()) {
    $title = 'Search: ' . get_search_query();
    $desc  = $wp_query->found_posts . ' VR scenes found';
} elseif (is_tax('studio')) {
    $term  = get_queried_object();
    $title = $term->name . ' VR Porn';
    $desc  = $term->count . ' immersive VR scenes from ' . $term->name;
    $term_desc = term_description($term);
    $studio_slug = $term->slug;
    if (function_exists('dvr_studio_map')) {
        $map = dvr_studio_map();
        if (isset($map[$studio_slug])) { list($d,$t) = $map[$studio_slug]; $studio_aff = 'https://'.$d.'/?link_data='.$t; }
    }
} else {
    $term  = get_queried_object();
    $name  = $term ? $term->name : single_term_title('', false);
    $title = dvr_title_suffix($name);
    $desc  = ($term ? $term->count : '') . ' VR scenes';
    if ($term) $term_desc = term_description($term);
}

// ── Breadcrumb (visible + schema) ──
$crumbs = [['name'=>'Home','url'=>home_url('/')]];
if (is_tax('studio')) { $crumbs[] = ['name'=>'Studios','url'=>home_url('/vr-porn/')]; }
$crumbs[] = ['name'=>$title, 'url'=>''];
?>
<div class="dvr-container">

  <nav class="dvr-breadcrumb" aria-label="Breadcrumb">
    <?php
    $parts = [];
    foreach ($crumbs as $i => $cr) {
        if ($cr['url'] && $i < count($crumbs)-1) $parts[] = '<a href="'.esc_url($cr['url']).'">'.esc_html($cr['name']).'</a>';
        else $parts[] = '<span>'.esc_html($cr['name']).'</span>';
    }
    echo implode(' <em>›</em> ', $parts);
    ?>
  </nav>

  <div class="dvr-archive-head">
    <h1><?php echo esc_html($title); ?></h1>
    <p><?php echo esc_html($desc); ?></p>
  </div>

  <?php // ── Studio conversion banner ──
  if ($studio_slug && $studio_aff): ?>
    <div class="dvr-studio-banner">
      <div class="dvr-studio-banner-txt"><strong>Get unlimited access to <?php echo esc_html($term->name); ?></strong><span>Stream all <?php echo (int)$term->count; ?> scenes in full-length 8K VR on every headset.</span></div>
      <a class="dvr-scene-cta-btn" href="<?php echo esc_url($studio_aff); ?>" target="_blank" rel="sponsored nofollow noopener" data-aff-placement="studio_banner" data-aff-studio="<?php echo esc_attr($studio_slug); ?>">▶ Watch in VR</a>
    </div>
  <?php endif; ?>

  <?php
  if (have_posts()) {
      $items = [];
      echo '<div class="dvr-grid">';
      $pos = 1;
      while (have_posts()) {
          the_post();
          echo dvr_render_card(get_the_ID());
          $items[] = ['@type'=>'ListItem','position'=>$pos++,'url'=>get_permalink(),'name'=>get_the_title()];
      }
      echo '</div>';

      echo '<div class="dvr-pagination">';
      echo paginate_links([
          'total'     => $wp_query->max_num_pages,
          'current'   => max(1, get_query_var('paged')),
          'prev_text' => '← Prev',
          'next_text' => 'Next →',
      ]);
      echo '</div>';

      // ── ItemList schema ──
      $itemlist = ['@context'=>'https://schema.org','@type'=>'ItemList','itemListElement'=>$items];
      echo '<script type="application/ld+json">'.wp_json_encode($itemlist).'</script>';
  } else {
      echo '<p style="text-align:center;color:var(--text-muted);padding:60px 0;">No scenes found. Try another search.</p>';
  }

  // ── SEO content (term description) — BELOW grid for UX + full on-page SEO ──
  if ($term_desc) {
      echo '<div class="dvr-seo-body">'.wp_kses_post($term_desc).'</div>';
  }

  // ── Related categories (internal linking) — only on category/tag ──
  if ((is_category() || is_tag()) && $term) {
      $rel = get_terms(['taxonomy'=>$term->taxonomy,'hide_empty'=>true,'orderby'=>'count','order'=>'DESC','number'=>14,'exclude'=>[$term->term_id]]);
      if ($rel && !is_wp_error($rel)) {
          echo '<div class="dvr-related-cats"><h2>Browse More Categories</h2><div class="dvr-pills">';
          // Money-page boost: always surface high-value pages first (internal link equity)
          $boost = ['free-vr-porn'=>'🆓 Free VR Porn', 'anime'=>'🎌 Anime VR Porn'];
          foreach ($boost as $bslug => $blabel) {
              if ($term->slug === $bslug) continue;
              echo '<a class="cat-pill dvr-pill-accent" href="'.esc_url(home_url('/category/'.$bslug.'/')).'">'.esc_html($blabel).'</a>';
          }
          foreach ($rel as $rt) {
              if (in_array($rt->slug, ['free-vr-porn','anime'], true)) continue; // avoid duplicate
              echo '<a class="cat-pill" href="'.esc_url(get_term_link($rt)).'">'.esc_html($rt->name).'</a>';
          }
          echo '</div></div>';
      }
  }

  // ── BreadcrumbList schema ──
  $bc_items = [];
  $p = 1;
  foreach ($crumbs as $cr) {
      $entry = ['@type'=>'ListItem','position'=>$p++,'name'=>$cr['name']];
      if ($cr['url']) $entry['item'] = $cr['url'];
      $bc_items[] = $entry;
  }
  echo '<script type="application/ld+json">'.wp_json_encode(['@context'=>'https://schema.org','@type'=>'BreadcrumbList','itemListElement'=>$bc_items]).'</script>';
  ?>
</div>
<?php
get_footer();
