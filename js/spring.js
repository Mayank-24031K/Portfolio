/*
 * Doodle spring on the right side.
 * The coil stretches as you scroll down (top of page = squashed, bottom = stretched),
 * and the little weight on the end bounces on a real spring simulation.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var wrap = document.createElement("div");
  wrap.className = "spring";
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML =
    '<svg xmlns="' + NS + '">' +
      '<path class="spring__hook"/>' +
      '<path class="spring__coil"/>' +
      '<g class="spring__weight">' +
        '<circle class="spring__body" r="16"/>' +
        '<circle class="spring__eye" cx="-5.5" cy="-3" r="1.8"/>' +
        '<circle class="spring__eye" cx="5.5" cy="-3" r="1.8"/>' +
        '<path class="spring__face" d="M-6 4 Q0 10 6 4"/>' +
      '</g>' +
    '</svg>';
  document.body.appendChild(wrap);

  var svg = wrap.querySelector("svg");
  var hook = wrap.querySelector(".spring__hook");
  var coil = wrap.querySelector(".spring__coil");
  var weight = wrap.querySelector(".spring__weight");
  var mouth = wrap.querySelector(".spring__face");

  var CX = 32, COILS = 12, SAMPLES = COILS * 14, TOP = 18, R = 16;
  var H = 0, minLen = 0, maxLen = 0, restLen = 0;
  var len = 0, vel = 0, target = 0, running = false;

  function measure() {
    H = wrap.clientHeight || 400;
    svg.setAttribute("viewBox", "0 0 64 " + H);
    minLen = Math.max(60, H * 0.22);
    maxLen = Math.max(minLen + 40, H - TOP - R * 2 - 4);
    restLen = (minLen + maxLen) / 2;
  }

  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }

  function draw() {
    // coils get narrower as the spring stretches (like a real one)
    var amp = Math.min(24, Math.max(9, 20 * Math.sqrt(restLen / len)));
    var r = amp * 0.5;
    var d = "";
    for (var k = 0; k <= SAMPLES; k++) {
      var t = k / SAMPLES, a = t * COILS * Math.PI * 2;
      var x = CX + amp * Math.sin(a);
      var y = TOP + t * len + r - r * Math.cos(a);
      d += (k ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    coil.setAttribute("d", d);

    // little hook / nail at the top
    hook.setAttribute("d", "M" + CX + " " + TOP + " V4 M" + (CX - 7) + " 4 H" + (CX + 7) + " M" + (CX - 4) + " 0 H" + (CX + 4));

    var tilt = Math.max(-14, Math.min(14, vel * 2.2));
    weight.setAttribute("transform", "translate(" + CX + " " + (TOP + len + R) + ") rotate(" + tilt.toFixed(1) + ")");
    // surprised "o" mouth when moving fast, smile when calm
    mouth.setAttribute("d", Math.abs(vel) > 2.2 ? "M-3 5 Q0 11 3 5 Q0 2 -3 5" : "M-6 4 Q0 10 6 4");
  }

  function tick() {
    target = minLen + progress() * (maxLen - minLen);
    if (reduce) {
      len = target; vel = 0; draw(); running = false; return;
    }
    vel = (vel + (target - len) * 0.09) * 0.84;   // spring + damping
    len += vel;
    draw();
    if (Math.abs(vel) > 0.02 || Math.abs(target - len) > 0.2) {
      requestAnimationFrame(tick);
    } else {
      len = target; vel = 0; draw(); running = false;
    }
  }

  function kick() {
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function init() {
    measure();
    len = minLen + progress() * (maxLen - minLen);
    draw();
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", function () { measure(); kick(); });
  window.addEventListener("load", function () { measure(); kick(); });
  init();
})();
