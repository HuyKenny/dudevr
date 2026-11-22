/* DudeVR 180° stereo (SBS) trailer player — three.js r149, WebXR "Enter VR", drag + gyro look.
 * Wiring: <div class="player" data-mp4="…" data-emb="…">  buttons [data-mode="vr"|"flat"]. */
(function () {
  'use strict';
  var threeP = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    return threeP || (threeP = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = '/vr/three.min.js'; s.async = true; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    }));
  }
  function track(mode, wrap) { try { window.gtag && window.gtag('event', 'trailer_play', { mode: mode, scene: wrap.dataset.scene || '' }); } catch (e) {} }

  function vr(wrap, gyroGrant) {
    var THREE = window.THREE;
    var stage = document.createElement('div'); stage.className = 'dvr-vr-stage'; wrap.appendChild(stage);
    var video = document.createElement('video');
    video.crossOrigin = 'anonymous'; video.loop = true; video.muted = true; video.playsInline = true;
    video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', '');
    video.src = wrap.dataset.mp4;
    video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0;';
    stage.appendChild(video);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.xr.enabled = true;
    stage.appendChild(renderer.domElement);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 2000); camera.layers.enable(1);
    var tex = new THREE.VideoTexture(video); tex.encoding = THREE.sRGBEncoding;
    function half(off) {
      var g = new THREE.SphereGeometry(500, 60, 40, Math.PI / 2, Math.PI, 0, Math.PI); g.scale(-1, 1, 1);
      var uv = g.attributes.uv.array; for (var i = 0; i < uv.length; i += 2) { uv[i] = uv[i] * 0.5 + off; }
      return g;
    }
    var mL = new THREE.Mesh(half(0), new THREE.MeshBasicMaterial({ map: tex })); mL.layers.set(1); scene.add(mL);
    var mR = new THREE.Mesh(half(0.5), new THREE.MeshBasicMaterial({ map: tex })); mR.layers.set(2); scene.add(mR);
    renderer.xr.addEventListener('sessionstart', function () {
      var c = renderer.xr.getCamera(); if (c.cameras && c.cameras.length === 2) { c.cameras[0].layers.enable(1); c.cameras[1].layers.enable(2); }
      video.play();
    });
    var lon = 0, lat = 0, down = false, px = 0, py = 0;
    function pt(e) { return e.touches ? e.touches[0] : e; }
    renderer.domElement.addEventListener('pointerdown', function (e) { down = true; px = e.clientX; py = e.clientY; renderer.domElement.setPointerCapture(e.pointerId); });
    renderer.domElement.addEventListener('pointermove', function (e) {
      if (!down) return; lon -= (e.clientX - px) * 0.15; lat += (e.clientY - py) * 0.15; px = e.clientX; py = e.clientY; lat = Math.max(-85, Math.min(85, lat));
    });
    renderer.domElement.addEventListener('pointerup', function () { down = false; });
    var gyro = { on: false, a: 0, b: 0, g: 0 };
    function orient(e) { if (e.alpha == null) return; gyro.on = true; gyro.a = e.alpha; gyro.b = e.beta; gyro.g = e.gamma; }
    gyroGrant.then(function (s) { if (s !== 'denied') window.addEventListener('deviceorientation', orient, true); });
    var Z = new THREE.Vector3(0, 0, 1), eu = new THREE.Euler(), q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    var d2r = THREE.MathUtils.degToRad;
    function sa() { return d2r((screen.orientation && screen.orientation.angle) || window.orientation || 0); }
    function resize() { var w = stage.clientWidth, h = stage.clientHeight || w * 9 / 16; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    window.addEventListener('resize', resize); resize();
    renderer.setAnimationLoop(function () {
      if (!renderer.xr.isPresenting) {
        if (gyro.on) {
          eu.set(d2r(gyro.b), d2r(gyro.a) + d2r(lon), -d2r(gyro.g), 'YXZ');
          camera.quaternion.setFromEuler(eu); camera.quaternion.multiply(q1); camera.quaternion.multiply(q0.setFromAxisAngle(Z, -sa()));
        } else {
          var phi = d2r(90 - lat), th = d2r(lon);
          camera.lookAt(new THREE.Vector3(Math.sin(phi) * Math.sin(th), Math.cos(phi), -Math.sin(phi) * Math.cos(th)));
        }
      }
      renderer.render(scene, camera);
    });
    var ui = document.createElement('div'); ui.className = 'vr-ui'; stage.appendChild(ui);
    var snd = document.createElement('button'); snd.type = 'button'; snd.textContent = 'Sound on';
    snd.onclick = function () { video.muted = !video.muted; snd.textContent = video.muted ? 'Sound on' : 'Mute'; };
    ui.appendChild(snd);
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-vr').then(function (ok) {
        if (!ok) return;
        var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Enter VR'; var sess = null;
        b.onclick = function () {
          if (sess) { sess.end(); return; }
          navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }).then(function (s) {
            sess = s; s.addEventListener('end', function () { sess = null; b.textContent = 'Enter VR'; });
            renderer.xr.setReferenceSpaceType('local'); return renderer.xr.setSession(s);
          }).then(function () { b.textContent = 'Exit VR'; track('webxr', wrap); });
        };
        ui.appendChild(b);
      }).catch(function () {});
    }
    var hint = document.createElement('div'); hint.className = 'vr-hint';
    hint.textContent = matchMedia('(pointer: coarse)').matches ? 'Tilt your phone or swipe to look around' : 'Drag to look around';
    stage.appendChild(hint); setTimeout(function () { hint.style.opacity = '0'; }, 4000);
    video.play().catch(function () {});
  }

  function flat(wrap) {
    var f = document.createElement('iframe');
    f.src = wrap.dataset.emb; f.allow = 'autoplay; fullscreen; xr-spatial-tracking'; f.allowFullscreen = true; f.title = 'Trailer';
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    wrap.appendChild(f);
  }

  function boot() {
    var wrap = document.querySelector('.player[data-scene]'); if (!wrap) return;
    var gl = false; try { var c = document.createElement('canvas'); gl = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) {}
    var vrBtn = wrap.querySelector('[data-mode="vr"]');
    if (vrBtn && !wrap.dataset.mp4) vrBtn.remove();
    else if (vrBtn && !gl) { vrBtn.setAttribute('data-mode', 'video'); vrBtn.lastChild.textContent = 'Play trailer'; }
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]'); if (!b) return;
      e.preventDefault();
      var mode = b.getAttribute('data-mode');
      var start = wrap.querySelector('.start'), poster = wrap.querySelector(':scope > img');
      if (mode === 'vr') {
        var grant = Promise.resolve('default');
        try { if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') grant = DeviceOrientationEvent.requestPermission().catch(function () { return 'denied'; }); } catch (err) {}
        b.textContent = 'Loading 180° preview…'; b.disabled = true;
        loadThree().then(function () { start && start.remove(); poster && poster.remove(); vr(wrap, grant); track('vr180', wrap); })
          .catch(function () { b.textContent = '180° preview unavailable'; });
      } else if (mode === 'video') {
        // No WebGL: play the SBS file flat and show only the left eye (video is 2× wide, right half clipped).
        start && start.remove(); poster && poster.remove();
        var v = document.createElement('video'); v.src = wrap.dataset.mp4; v.autoplay = true; v.controls = true; v.playsInline = true; v.loop = true;
        v.style.cssText = 'width:200%;max-width:none;height:100%;object-fit:cover;object-position:left center';
        wrap.style.overflow = 'hidden'; wrap.appendChild(v); track('flat_mp4', wrap);
      } else if (mode === 'flat') {
        start && start.remove(); poster && poster.remove(); flat(wrap); track('embed', wrap);
      }
    });
  }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
