/*
 * Sketched cursor + ink trail + click burst.
 * - Only runs with a fine pointer (mouse / trackpad); touch devices keep their default.
 * - Respects prefers-reduced-motion (cursor still follows, but no trail or burst).
 */
(function () {
  "use strict";

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var NS = "http://www.w3.org/2000/svg";

  // vivid sketch-marker palette (first is the site's blue)
  var COLORS = ["#2563e0", "#ff5a36", "#ff3d9a", "#ffb400", "#12b886", "#7c4dff"];

  // ---- DOM ---------------------------------------------------------------
  var canvas = document.createElement("canvas");
  canvas.className = "sk-cursor-fx";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var cursor = document.createElement("div");
  cursor.className = "sk-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML =
    '<svg viewBox="0 0 40 40" xmlns="' + NS + '">' +
      '<g class="sk-cursor__arrow">' +
        '<path class="sk-cursor__shadow" d="M4 4 L6 30 L13 23 L19 36 L25 33 L19 21 L29 20 Z"/>' +
        '<path d="M4 4 L6 30 L13 23 L19 36 L25 33 L19 21 L29 20 Z"/>' +
        '<path d="M9 12 L10 20" style="fill:none;stroke-width:1.4;opacity:.5"/>' +
      '</g>' +
      '<g class="sk-cursor__ring">' +
        '<circle class="sk-cursor__fill" r="15"/>' +
        '<path d="M-15 -2 C-14 -12 -4 -17 5 -15 C14 -13 18 -4 15 5 C12 14 2 18 -6 15 C-13 12 -17 5 -15 -4"/>' +
        '<path d="M-11 -9 C-4 -17 8 -15 12 -7" style="stroke-width:1.5;opacity:.6"/>' +
      '</g>' +
    '</svg>';
  document.body.appendChild(cursor);

  root.classList.add("has-sketch-cursor");

  // ---- state -------------------------------------------------------------
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var mx = -100, my = -100;      // real pointer
  var cx = -100, cy = -100;      // eased cursor
  var lastX = -100, lastY = -100;
  var rot = 0;
  var colorIdx = 0;
  var particles = [];
  var seen = false;
  var raf = 0;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  var INTERACTIVE = "a, button, summary, label, select, [role='button'], [data-cursor='hover'], .project, #laptop, .id-card";

  // ---- particles ---------------------------------------------------------
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function spawn(x, y, kind, burst) {
    var a = rnd(0, Math.PI * 2);
    var speed = burst ? rnd(1.5, 5.5) : rnd(0.1, 0.7);
    particles.push({
      x: x, y: y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed + (burst ? 0 : 0.25),
      life: 1,
      decay: burst ? rnd(0.018, 0.03) : rnd(0.02, 0.035),
      size: burst ? rnd(5, 11) : rnd(3, 8),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-0.15, 0.15),
      kind: kind,
      color: COLORS[(colorIdx++) % COLORS.length]
    });
  }

  function drawParticle(p) {
    var s = p.size * (0.4 + p.life * 0.6);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.strokeStyle = p.color;
    ctx.fillStyle = p.color;
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    switch (p.kind) {
      case 0: // dot
        ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2); ctx.fill(); break;
      case 1: // squiggle
        ctx.moveTo(-s, 0);
        ctx.quadraticCurveTo(-s / 2, -s * 0.8, 0, 0);
        ctx.quadraticCurveTo(s / 2, s * 0.8, s, 0);
        ctx.stroke(); break;
      case 2: // sparkle (4 point star)
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.stroke(); break;
      case 3: // tiny hand-drawn loop
        ctx.arc(0, 0, s * 0.6, 0.3, Math.PI * 1.75);
        ctx.stroke(); break;
      default: // dash
        ctx.moveTo(-s * 0.7, 0); ctx.lineTo(s * 0.7, 0); ctx.stroke();
    }
    ctx.restore();
  }

  // ---- events ------------------------------------------------------------
  window.addEventListener("mousemove", function (e) {
    mx = e.clientX; my = e.clientY;
    if (!seen) {
      seen = true; cx = mx; cy = my; lastX = mx; lastY = my;
      cursor.classList.add("is-visible");
    }
    var t = e.target;
    var hot = t && t.closest && t.closest(INTERACTIVE);
    cursor.classList.toggle("is-hover", !!hot);
  }, { passive: true });

  document.addEventListener("mouseleave", function () { cursor.classList.remove("is-visible"); });
  document.addEventListener("mouseenter", function () { if (seen) cursor.classList.add("is-visible"); });

  window.addEventListener("mousedown", function (e) {
    cursor.classList.add("is-down");
    if (reduce) return;
    // ink burst + a quick expanding sketch ring
    for (var i = 0; i < 14; i++) spawn(e.clientX, e.clientY, i % 5, true);
    ripples.push({ x: e.clientX, y: e.clientY, r: 6, life: 1, color: COLORS[colorIdx % COLORS.length] });
  });
  window.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });

  var ripples = [];

  // ---- loop --------------------------------------------------------------
  function tick() {
    // ease the cursor toward the pointer (soft, slightly lagging pencil feel)
    var dx = mx - cx, dy = my - cy;
    cx += dx * 0.28; cy += dy * 0.28;

    // tilt with horizontal velocity
    var targetRot = Math.max(-18, Math.min(18, dx * 0.6));
    rot += (targetRot - rot) * 0.15;
    cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0) rotate(" + rot.toFixed(1) + "deg)";

    if (!reduce) {
      // drop trail particles along the path, more when moving fast
      var mdx = mx - lastX, mdy = my - lastY;
      var dist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (seen && dist > 6) {
        var n = Math.min(3, Math.floor(dist / 14) + 1);
        for (var i = 0; i < n; i++) {
          var t = Math.random();
          spawn(lastX + mdx * t, lastY + mdy * t, Math.floor(Math.random() * 5), false);
        }
        lastX = mx; lastY = my;
      }

      ctx.clearRect(0, 0, W, H);

      for (var k = particles.length - 1; k >= 0; k--) {
        var p = particles[k];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.rot += p.vr;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(k, 1); continue; }
        drawParticle(p);
      }

      for (var r = ripples.length - 1; r >= 0; r--) {
        var rp = ripples[r];
        rp.r += 3.2; rp.life -= 0.045;
        if (rp.life <= 0) { ripples.splice(r, 1); continue; }
        ctx.save();
        ctx.globalAlpha = rp.life;
        ctx.strokeStyle = rp.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    raf = requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  });

  raf = requestAnimationFrame(tick);
})();
