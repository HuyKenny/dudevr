/* DudeVR — in-page 180° 3D (SBS) WebXR trailer preview.
 * Progressive enhancement: a .dvr-vrwrap with data-mp4 gets a "Preview in 180° VR" button.
 * On click we lazy-load three.min.js, build a stereoscopic 180° player (mono on screen,
 * full stereo inside a headset via WebXR), with drag + gyro look. Falls back to the
 * existing <iframe> if WebGL / three.js is unavailable. */
(function () {
  'use strict';
  var THREE_URL = '/wp-content/uploads/vr/three.min.js';
  var threeP = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (threeP) return threeP;
    threeP = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = THREE_URL; s.async = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    return threeP;
  }

  function initPlayer(wrap, gyroGrant) {
    var mp4 = wrap.getAttribute('data-mp4');
    if (!mp4) return;

    // Build stage
    var stage = document.createElement('div');
    stage.className = 'dvr-vr-stage';
    wrap.appendChild(stage);

    var video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = true; video.muted = true; video.playsInline = true;
    video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', '');
    video.src = mp4;
    // iOS Safari only decodes/plays a DOM-connected <video>; keep it present but invisible.
    video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0;';
    stage.appendChild(video);

    var THREE = window.THREE;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 2000);
    camera.layers.enable(1); // see left-eye layer on screen

    var texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    // 180° hemisphere per eye. SBS = each eye uses one horizontal half of the frame.
    function hemisphere(uvOffset) {
      var g = new THREE.SphereGeometry(500, 60, 40, Math.PI / 2, Math.PI, 0, Math.PI);
      g.scale(-1, 1, 1); // view from inside
      var uv = g.attributes.uv.array;
      for (var i = 0; i < uv.length; i += 2) { uv[i] *= 0.5; uv[i] += uvOffset; }
      return g;
    }
    var matL = new THREE.MeshBasicMaterial({ map: texture });
    var meshL = new THREE.Mesh(hemisphere(0.0), matL); meshL.layers.set(1); scene.add(meshL);
    var matR = new THREE.MeshBasicMaterial({ map: texture });
    var meshR = new THREE.Mesh(hemisphere(0.5), matR); meshR.layers.set(2); scene.add(meshR);

    // Per-eye layers inside XR
    renderer.xr.addEventListener('sessionstart', function () {
      var cam = renderer.xr.getCamera();
      if (cam.cameras && cam.cameras.length === 2) {
        cam.cameras[0].layers.enable(1);
        cam.cameras[1].layers.enable(2);
      }
      video.play();
    });

    // ── Look controls: gyro "magic window" (primary) + drag (fallback / yaw recenter) ──
    var lon = 0, lat = 0, isDown = false, px = 0, py = 0;
    function onDown(e) { isDown = true; var p = e.touches ? e.touches[0] : e; px = p.clientX; py = p.clientY; }
    function onMove(e) {
      if (!isDown) return;
      var p = e.touches ? e.touches[0] : e;
      lon -= (p.clientX - px) * 0.15; px = p.clientX;
      lat += (p.clientY - py) * 0.15; py = p.clientY;
      lat = Math.max(-85, Math.min(85, lat));
    }
    function onUp() { isDown = false; }
    renderer.domElement.addEventListener('mousedown', onDown);
    renderer.domElement.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    renderer.domElement.addEventListener('touchstart', onDown, { passive: true });
    renderer.domElement.addEventListener('touchmove', onMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onUp);

    // Device orientation (tilt the phone to look around). iOS permission handled at launch (gyroGrant).
    var gyro = { active: false, alpha: 0, beta: 0, gamma: 0 };
    function onOrient(e) { if (e.alpha == null) return; gyro.active = true; gyro.alpha = e.alpha; gyro.beta = e.beta; gyro.gamma = e.gamma; }
    function addGyro() { window.addEventListener('deviceorientation', onOrient, true); }
    if (gyroGrant && gyroGrant.then) gyroGrant.then(function (s) { if (s !== 'denied') addGyro(); });
    else addGyro();

    var zee = new THREE.Vector3(0, 0, 1), dEuler = new THREE.Euler(), q0 = new THREE.Quaternion();
    var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // look out the back of the device
    function screenAngle() { var a = (screen.orientation && screen.orientation.angle) || window.orientation || 0; return THREE.MathUtils.degToRad(a); }
    function applyGyro() {
      var a = THREE.MathUtils.degToRad(gyro.alpha) + THREE.MathUtils.degToRad(lon); // lon = manual yaw recenter
      var b = THREE.MathUtils.degToRad(gyro.beta);
      var g = THREE.MathUtils.degToRad(gyro.gamma);
      dEuler.set(b, a, -g, 'YXZ');
      camera.quaternion.setFromEuler(dEuler);
      camera.quaternion.multiply(q1);
      camera.quaternion.multiply(q0.setFromAxisAngle(zee, -screenAngle()));
    }

    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight || (w * 9 / 16);
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize); resize();

    function render() {
      if (!renderer.xr.isPresenting) {
        camera.position.set(0, 0, 0);
        if (gyro.active) {
          applyGyro(); // tilt-to-look
        } else {
          var phi = THREE.MathUtils.degToRad(90 - lat);
          var theta = THREE.MathUtils.degToRad(lon);
          // default (lon0/lat0) faces -Z = the 180° dome forward (the scene), not a black edge
          camera.lookAt(new THREE.Vector3(
            Math.sin(phi) * Math.sin(theta), Math.cos(phi), -Math.sin(phi) * Math.cos(theta)
          ));
        }
      }
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);

    // ── VR / Enter button ──
    var enter = document.createElement('button');
    enter.className = 'dvr-vr-enter'; enter.textContent = '🥽 Enter VR';
    enter.style.display = 'none';
    stage.appendChild(enter);
    var currentSession = null;
    function onSessionEnded() { currentSession = null; enter.textContent = '🥽 Enter VR'; }
    enter.addEventListener('click', function () {
      if (!navigator.xr) return;
      if (currentSession) { currentSession.end(); return; }
      navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] })
        .then(function (session) {
          currentSession = session;
          session.addEventListener('end', onSessionEnded);
          renderer.xr.setReferenceSpaceType('local');
          return renderer.xr.setSession(session);
        }).then(function () { enter.textContent = '⏹ Exit VR'; });
    });
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-vr').then(function (ok) {
        if (ok) enter.style.display = '';
      }).catch(function () {});
    }

    // hint + play
    var hint = document.createElement('div');
    hint.className = 'dvr-vr-hint'; hint.textContent = '📱 Tilt your phone to look around (or drag)';
    stage.appendChild(hint);
    setTimeout(function () { hint.classList.add('fade'); }, 4000);

    video.play().catch(function () {});
  }

  function wire(wrap) {
    if (wrap.__dvrWired) return; wrap.__dvrWired = true;
    var btn = wrap.querySelector('.dvr-vr-launch');
    if (!btn) return;
    // No WebGL? leave the iframe fallback.
    try {
      var c = document.createElement('canvas');
      if (!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))) return;
    } catch (e) { return; }
    btn.style.display = '';
    btn.addEventListener('click', function () {
      btn.disabled = true; btn.textContent = 'Loading 180° preview…';
      // iOS 13+: device-orientation needs an explicit permission requested INSIDE this tap gesture.
      var gyroGrant = Promise.resolve('default');
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          gyroGrant = DeviceOrientationEvent.requestPermission().catch(function () { return 'denied'; });
        }
      } catch (e) {}
      // Hide the WHOLE original trailer container (not just the iframe) so no empty black box remains.
      var vc = wrap.querySelector('.video-container') || wrap.querySelector('iframe');
      if (vc) vc.style.display = 'none';
      loadThree().then(function () {
        wrap.classList.add('dvr-vr-active');
        btn.remove();
        initPlayer(wrap, gyroGrant);
      }).catch(function () {
        btn.disabled = false; btn.textContent = '🥽 Preview in 180° VR';
        if (vc) vc.style.display = '';
      });
    });
  }

  function boot() {
    var wraps = document.querySelectorAll('.dvr-vrwrap[data-mp4]');
    for (var i = 0; i < wraps.length; i++) wire(wraps[i]);
  }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
