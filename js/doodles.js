/*
 * Doodle hover / tap: the background doodles sit behind the text, so CSS :hover can't reach them.
 * This finds the doodle under the pointer by geometry and toggles .is-hot (css/doodles.css enlarges it).
 *  - mouse / trackpad: nearest doodle under the cursor grows while you hover it
 *  - touch / pen: tapping on a doodle makes it pop for a moment
 *  - layers that are off-screen are paused (adds .is-paused) to save battery
 */
(function () {
  "use strict";

  var doodles = Array.prototype.slice.call(document.querySelectorAll(".doodle"));
  var layers = Array.prototype.slice.call(document.querySelectorAll(".doodles"));
  if (!doodles.length) return;

  // ---- pause animation when a layer isn't visible -----------------------
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-paused", !e.isIntersecting); });
    }, { rootMargin: "120px 0px" });
    layers.forEach(function (l) { io.observe(l); });
  }

  // ---- hit testing ----------------------------------------------------------
  var hot = null, hotTimer = 0, px = -1, py = -1, queued = false;

  function pick(x, y, pad) {
    var best = null, bestD = Infinity;
    for (var i = 0; i < doodles.length; i++) {
      var r = doodles[i].getBoundingClientRect();
      if (!r.width) continue;                                  // layer hidden
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) continue;
      var dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
      var d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = doodles[i]; }
    }
    return best;
  }

  function setHot(el) {
    if (el === hot) return;
    if (hot) hot.classList.remove("is-hot");
    hot = el;
    if (hot) hot.classList.add("is-hot");
  }

  function update() {
    queued = false;
    setHot(pick(px, py, 6));
  }

  // mouse / trackpad
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      px = e.clientX; py = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    document.addEventListener("pointerleave", function () { px = py = -1; setHot(null); });
    window.addEventListener("scroll", function () {          // doodles move under a still cursor
      if (px >= 0 && !queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  // touch / pen: tap a doodle to make it pop
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    var el = pick(e.clientX, e.clientY, 14);                  // generous finger-sized target
    clearTimeout(hotTimer);
    setHot(el);
    if (el) hotTimer = setTimeout(function () { setHot(null); }, 1400);
  }, { passive: true });
})();
