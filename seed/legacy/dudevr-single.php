<?php
/**
 * DudeVR custom single (scene) template — premium dark + conversion.
 * Routed via template_include from dudevr-design-tokens.php (is_singular('post')).
 */
defined('ABSPATH') || exit;

get_header();

while (have_posts()) : the_post();
$id      = get_the_ID();
$title   = get_the_title($id);
$scene   = dvr_parse_scene($id);
$poster  = get_the_post_thumbnail_url($id, 'large') ?: get_the_post_thumbnail_url($id, 'full');

$studio_name=''; $studio_slug=''; $score='';
$st = get_the_terms($id,'studio');
if ($st && !is_wp_error($st)) { $studio_name=$st[0]->name; $studio_slug=$st[0]->slug; $score=dvr_studio_score($studio_slug); }

$aff = $scene['aff'];
$dl  = $scene['aff_download'] ?: $aff;
$len = $scene['length']; $fov = $scene['fov'] ?: '180';

// GA4 affiliate-click tracking attrs (placement appended per link)
$aff_data = 'data-aff-studio="' . esc_attr($studio_slug) . '" data-aff-scene="' . esc_attr(get_post_field('post_name', $id)) . '"';

// models + categories
$models = get_the_terms($id,'model');
$cats   = get_the_terms($id,'category');
?>
<div class="dvr-single"><div class="dvr-container">

  <nav class="dvr-breadcrumb" aria-label="Breadcrumb">
    <a href="<?php echo esc_url(home_url('/')); ?>">Home</a> <em>›</em>
    <?php if ($studio_slug): ?><a href="<?php echo esc_url('/studio/'.$studio_slug.'/'); ?>"><?php echo esc_html($studio_name); ?></a> <em>›</em> <?php endif; ?>
    <span><?php echo esc_html($title); ?></span>
  </nav>

  <h1 class="dvr-single-title"><?php echo esc_html($title); ?></h1>
  <div class="dvr-single-meta">
    <?php if ($studio_name): ?><a class="dvr-single-studio" href="<?php echo esc_url('/studio/'.$studio_slug.'/'); ?>"><?php echo esc_html($studio_name); ?></a><?php endif; ?>
    <span class="dvr-single-tag"><?php echo esc_html($fov); ?>° VR</span>
    <span class="dvr-single-tag">8K</span>
    <?php if ($len): ?><span class="dvr-single-tag">⏱ <?php echo esc_html($len); ?></span><?php endif; ?>
    <span class="dvr-single-date"><?php echo esc_html(get_the_date('', $id)); ?></span>
  </div>

  <div class="dvr-single-hero">
    <div class="dvr-single-player">
      <?php if (!empty($scene['trailer_mp4'])): // 180° SBS mp4 → in-page WebXR preview (JS, iframe fallback) ?>
        <div class="dvr-vrwrap" data-mp4="<?php echo esc_url($scene['trailer_mp4']); ?>">
          <?php echo $scene['trailer_html']; ?>
          <button type="button" class="dvr-vr-launch" style="display:none">🥽 Preview in 180° VR</button>
        </div>
      <?php else: echo $scene['trailer_html']; endif; ?>
      <?php if ($aff): ?>
      <div class="dvr-player-actions">
        <a class="dvr-btn-magenta" href="<?php echo esc_url($aff); ?>" target="_blank" rel="sponsored nofollow noopener" <?php echo $aff_data; ?> data-aff-placement="player">▶ Watch Full Video in VR</a>
        <a class="dvr-btn-ghost-cyan" href="<?php echo esc_url($dl); ?>" target="_blank" rel="sponsored nofollow noopener" <?php echo $aff_data; ?> data-aff-placement="download">Download</a>
      </div>
      <?php endif; ?>
    </div>

    <aside class="dvr-single-buy">
      <div class="dvr-buy-card">
        <?php if ($poster): ?><div class="dvr-buy-poster" style="background-image:url('<?php echo esc_url($poster); ?>')"></div><?php endif; ?>
        <div class="dvr-buy-body">
          <div class="dvr-buy-studio"><span><?php echo esc_html($studio_name ?: 'Premium VR'); ?></span><?php if ($score): ?><b><?php echo esc_html($score); ?></b><?php endif; ?></div>
          <div class="dvr-buy-spec"><?php echo esc_html($fov); ?>° · 8K<?php echo $len ? ' · '.esc_html($len) : ''; ?></div>
          <ul class="dvr-buy-benes">
            <li>Full-length uncut scene</li>
            <li>Crystal-clear 8K · 180°</li>
            <li>Instant streaming</li>
            <li>Works on all VR headsets</li>
          </ul>
          <?php if ($aff): ?>
          <a class="dvr-buy-cta" href="<?php echo esc_url($aff); ?>" target="_blank" rel="sponsored nofollow noopener" <?php echo $aff_data; ?> data-aff-placement="buy">▶ Watch Full Video in VR</a>
          <a class="dvr-buy-cta2" href="<?php echo esc_url($dl); ?>" target="_blank" rel="sponsored nofollow noopener" <?php echo $aff_data; ?> data-aff-placement="buy_download">Download in VR</a>
          <?php endif; ?>
          <div class="dvr-buy-trust">🔒 Secure · ⚡ Instant access · 🔄 New scenes daily</div>
        </div>
      </div>
    </aside>
  </div>

  <?php if ($models || $cats): ?>
  <div class="dvr-single-pills">
    <?php
    if ($models && !is_wp_error($models)) foreach ($models as $t) echo '<a class="cat-pill dvr-pill-model" href="'.esc_url(get_term_link($t)).'">★ '.esc_html($t->name).'</a>';
    if ($cats && !is_wp_error($cats)) foreach (array_slice($cats,0,12) as $t) echo '<a class="cat-pill" href="'.esc_url(get_term_link($t)).'">'.esc_html($t->name).'</a>';
    ?>
  </div>
  <?php endif; ?>

  <?php if ($scene['desc']): ?>
  <div class="dvr-single-desc"><?php echo apply_filters('the_content', $scene['desc']); ?></div>
  <?php endif; ?>

  <?php if ($scene['gallery']): ?>
  <div class="dvr-single-gallery"><h2>Scene Preview</h2><?php echo $scene['gallery']; ?></div>
  <?php endif; ?>

  <?php if ($aff): ?>
  <div class="dvr-scene-cta">
    <div class="dvr-scene-cta-head">Get Full Access to <span><?php echo esc_html($studio_name ?: 'this Studio'); ?></span></div>
    <div class="dvr-scene-cta-benes"><span>✓ Full-length 8K scene</span><span>✓ Instant streaming</span><span>✓ All VR headsets</span><span>✓ New scenes daily</span></div>
    <a class="dvr-scene-cta-btn" href="<?php echo esc_url($aff); ?>" target="_blank" rel="sponsored nofollow noopener" <?php echo $aff_data; ?> data-aff-placement="cta_band">▶ Watch Full Video in VR</a>
  </div>
  <?php endif; ?>

  <?php // Related: more from studio
  if ($studio_slug) {
    $g = dvr_render_video_grid(['count'=>8,'studio'=>$studio_slug,'orderby'=>'date','exclude'=>$id]);
    if ($g) echo '<div class="dvr-related"><div class="dvr-row-head"><h2>More from '.esc_html($studio_name).'</h2><a class="dvr-viewall" href="'.esc_url('/studio/'.$studio_slug.'/').'">View all →</a></div>'.$g.'</div>';
  }
  // Related: more by top category
  if ($cats && !is_wp_error($cats)) {
    usort($cats, function($a,$b){ return $b->count - $a->count; });
    $top = $cats[0];
    $g2 = dvr_render_video_grid(['count'=>8,'category'=>$top->slug,'orderby'=>'rand','exclude'=>$id]);
    if ($g2) echo '<div class="dvr-related"><div class="dvr-row-head"><h2>More '.esc_html($top->name).' VR</h2><a class="dvr-viewall" href="'.esc_url(get_term_link($top)).'">View all →</a></div>'.$g2.'</div>';
  }
  ?>

</div></div>
<?php
endwhile;
get_footer();
