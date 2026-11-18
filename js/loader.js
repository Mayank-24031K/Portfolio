/*
 * Sketch loading screen — shared by every page.
 *
 * Add to a page's <head> (in this order):
 *   <link rel="stylesheet" href="css/tokens.css">
 *   <link rel="stylesheet" href="css/loader.css">
 *   <script src="js/loader.js"></script>
 *
 * The script is deliberately NOT deferred: it flags <html> as loading
 * before the first paint, so the page never flashes behind the loader.
 *
 * What it does
 *   - covers the page with the sketched desk until the page has loaded
 *   - a sketched figure on a cloud that is falling (speed lines + doodles rush past), a 000-100 counter and a progress bar, then the overlay fades away
 *   - first load in a session plays the full animation; later pages use a
 *     quicker version
 *   - clicking a link to another page of the site shows the loader again
 *     before navigating
 *   - "Skip" / Escape dismiss it; a safety timer guarantees it never sticks
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var seen = false;
  try { seen = sessionStorage.getItem("loaderSeen") === "1"; } catch (e) { /* storage blocked */ }

  // Timings (ms)
  var MIN_SHOW  = reduceMotion ? 0 : (seen ? 800 : 2000);  // shortest time the loader stays up
  var MAX_WAIT  = 6000;                                    // never wait longer than this
  var FADE_MS   = reduceMotion ? 20 : 700;

  var MARKUP = `<div class="loader" id="loader" role="status" aria-live="polite" aria-label="Loading">
  <svg class="loader__grain" aria-hidden="true"><filter id="paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" stitchTiles="stitch"></feTurbulence><feColorMatrix type="saturate" values="0"></feColorMatrix></filter><rect width="100%" height="100%" opacity=".25" filter="url(#paper-grain)"></rect></svg>
  <p class="loader__brand">PORTFOLIO</p>
  <p class="loader__tagline">a work in progress, always.</p>

  <div class="loader__fall" id="loader-fall" aria-hidden="true"></div>

  <div class="loader__center" aria-hidden="true">
      <svg class="loader__art" viewBox="0 0 460 340" aria-hidden="true">
        <defs><filter id="sk-wobble"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="4"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="2.2"></feDisplacementMap></filter></defs>
        <g class="art" filter="url(#sk-wobble)">
          <g class="art__kick">
            <path class="tube-o" d="M128 190Q95 170 85 125"></path><path class="tube-i" d="M128 190Q95 170 85 125"></path>
            <path class="tube-o" d="M140 196Q115 180 112 138"></path><path class="tube-i" d="M140 196Q115 180 112 138"></path>
            <ellipse class="line" cx="82" cy="112" rx="16" ry="9" transform="rotate(-70 82 112)"></ellipse>
            <ellipse class="line" cx="112" cy="124" rx="16" ry="9" transform="rotate(-85 112 124)"></ellipse>
          </g>
          <ellipse class="line" cx="185" cy="185" rx="68" ry="26" transform="rotate(-6 185 185)"></ellipse>
          <path class="hatch" d="M150 180L160 196M164 177L174 193M178 174L188 190M192 172L202 188"></path>
          <rect class="line" x="245" y="165" width="20" height="22" rx="8"></rect>
          <circle class="line" cx="223" cy="142" r="6"></circle>
          <circle class="line" cx="255" cy="140" r="32"></circle>
          <path class="ink" d="M223 132Q220 102 255 100Q290 102 287 132Q276 116 255 118Q234 118 223 132Z"></path>
          <circle class="ink" cx="262" cy="103" r="12"></circle>
          <g class="line thin"><circle cx="241" cy="138" r="11"></circle><circle cx="269" cy="138" r="11"></circle><path d="M252 137h4"></path></g>
          <g class="line thin"><path d="M234 139q7-7 14 0"></path><path d="M262 139q7-7 14 0"></path><path d="M248 156q12 12 24 0"></path></g>
          <polygon class="line" points="300,198 318,132 402,144 380,202"></polygon>
          <polygon class="line" points="352,152 362,170 352,188 342,170"></polygon>
          <polygon class="line" points="288,204 378,206 398,214 298,218"></polygon>
          <path class="tube-o" d="M222 176Q262 198 302 196"></path><path class="tube-i" d="M222 176Q262 198 302 196"></path>
          <circle class="line" cx="306" cy="196" r="9"></circle>
          <g class="cloud">
            <g class="cloud__edge"><ellipse cx="225" cy="282" rx="175" ry="34"></ellipse><circle cx="80" cy="266" r="46"></circle><circle cx="140" cy="274" r="52"></circle><circle cx="215" cy="278" r="58"></circle><circle cx="295" cy="274" r="52"></circle><circle cx="365" cy="264" r="46"></circle></g>
            <g class="cloud__fill"><ellipse cx="225" cy="282" rx="175" ry="34"></ellipse><circle cx="80" cy="266" r="46"></circle><circle cx="140" cy="274" r="52"></circle><circle cx="215" cy="278" r="58"></circle><circle cx="295" cy="274" r="52"></circle><circle cx="365" cy="264" r="46"></circle></g>
          </g>
        </g>
      </svg>
      <p class="loader__label">Loading<span class="loader__dots"></span></p>
  </div>

  <div class="loader__count" id="loader-count" aria-hidden="true">000</div>
  <div class="loader__bar" aria-hidden="true"><span id="loader-fill"></span></div>
  <button class="loader__skip" id="loader-skip" type="button">Skip</button>
</div>`;

  // Doodles that rush upward past the falling boy (each is a tiny line drawing)
  var DOODLES = [
    '<path d="M30 6 L36 24 L55 25 L40 36 L46 54 L30 43 L14 54 L20 36 L5 25 L24 24 Z"/>',
    '<path d="M30 30 Q34 26 36 31 Q38 40 28 40 Q16 39 17 27 Q19 14 33 15 Q50 17 49 34 Q47 50 28 50"/>',
    '<path d="M12 44 Q-2 44 2 31 Q6 21 18 24 Q20 8 36 10 Q48 6 54 20 Q68 18 70 32 Q76 44 62 44 Z"/>',
    '<path d="M30 8 V52 M8 30 H52 M14 14 L46 46 M46 14 L14 46"/>',
    '<path d="M4 18 Q14 2 28 18 Q40 2 56 16"/>',
    '<path d="M4 22 L76 4 L50 46 L40 28 Z M76 4 L40 28"/>',
    '<path d="M25 52 Q2 34 8 18 Q16 6 30 18 Q44 6 52 18 Q58 34 30 52 Z"/>',
    '<ellipse cx="30" cy="30" rx="22" ry="20" transform="rotate(-14 30 30)"/>',
    '<path d="M4 40 L20 14 L36 40 L52 14 L66 38"/>',
    '<path d="M10 50 Q4 30 22 22 Q38 16 40 34 M44 8 L50 20 L38 18 Z"/>'
  ];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // Falling lines + doodles. Rising = he is falling down.
  function buildFall(host) {
    if (reduceMotion) return;
    var i, el, n = window.innerWidth < 600 ? 16 : 34;
    for (i = 0; i < n; i++) {
      el = document.createElement("span");
      el.className = "loader__streak";
      el.style.cssText = "left:" + rnd(1, 99).toFixed(1) + "%;--h:" + Math.round(rnd(50, 190)) + "px;" +
        "--dur:" + rnd(0.55, 1.3).toFixed(2) + "s;animation-delay:-" + rnd(0, 1.3).toFixed(2) + "s;" +
        "opacity:" + rnd(0.25, 0.7).toFixed(2);
      host.appendChild(el);
    }
    var m = window.innerWidth < 600 ? 8 : 14;
    for (i = 0; i < m; i++) {
      el = document.createElement("span");
      el.className = "loader__doodle";
      el.style.cssText = "left:" + rnd(2, 94).toFixed(1) + "%;--s:" + Math.round(rnd(26, 56)) + "px;" +
        "--dur:" + rnd(1.6, 3.2).toFixed(2) + "s;animation-delay:-" + rnd(0, 3).toFixed(2) + "s;" +
        "--rot:" + Math.round(rnd(-200, 200)) + "deg";
      el.innerHTML = '<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + DOODLES[i % DOODLES.length] + '</svg>';
      host.appendChild(el);
    }
  }

  var loader, countEl, fillEl, runId = 0;
  var startedAt = Date.now();
  var pageLoaded = document.readyState === "complete";
  var finished = false;

  root.classList.add("is-loading");

  // Counter + bar: eases out to 100, waits at 90 until the page has loaded.
  function runProgress() {
    var id = ++runId, t0 = Date.now();
    var dur = Math.max(MIN_SHOW, 600);
    (function tick() {
      if (id !== runId) return;
      var t = Math.min(1, (Date.now() - t0) / dur);
      var p = 100 * (1 - Math.pow(1 - t, 2));
      if (!pageLoaded) p = Math.min(p, 90);
      countEl.textContent = String(Math.floor(p)).padStart(3, "0");
      fillEl.style.width = p + "%";
      if (p >= 100) finish(); else window.requestAnimationFrame(tick);
    })();
  }

  function finish() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem("loaderSeen", "1"); } catch (e) { /* fine */ }

    loader.classList.add("is-leaving");
    window.setTimeout(function () {
      root.classList.remove("is-loading");
      loader.hidden = true;
    }, FADE_MS);
  }

  function build() {
    var holder = document.createElement("div");
    holder.innerHTML = MARKUP;
    loader = holder.firstElementChild;
    document.body.insertBefore(loader, document.body.firstChild);

    buildFall(loader.querySelector("#loader-fall"));
    countEl = loader.querySelector("#loader-count");
    fillEl  = loader.querySelector("#loader-fill");

    loader.querySelector("#loader-skip").addEventListener("click", finish);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") finish(); });

    runProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }

  window.addEventListener("load", function () { pageLoaded = true; });
  window.setTimeout(function () { pageLoaded = true; }, MAX_WAIT);

  // Back/forward cache: a restored page must not come back covered.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && loader) { finished = true; loader.hidden = true; root.classList.remove("is-loading"); }
  });

  // Page-to-page navigation: show the loader, then go.
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link || !loader || link.target === "_blank" || link.hasAttribute("download")) return;

    var url;
    try { url = new URL(link.href, location.href); } catch (err) { return; }
    var samePage = url.origin === location.origin && url.pathname === location.pathname;
    if (url.origin !== location.origin || samePage || !/^https?:|^file:/.test(url.protocol)) return;

    e.preventDefault();
    finished = false;
    loader.hidden = false;
    loader.classList.remove("is-leaving");
    root.classList.add("is-loading");
    pageLoaded = false;
    runProgress();
    window.setTimeout(function () { location.href = url.href; }, reduceMotion ? 0 : 450);
  });
})();