/*
 * Intro overlay behaviour.
 *  - scales the fixed 1000x760 stage to fit any viewport
 *  - click the laptop -> it opens, then the overlay fades away
 *  - "Skip intro" / Escape dismiss it immediately
 *  - plays once per browser session
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var intro = document.getElementById("intro");
  if (!intro || !root.classList.contains("intro-pending")) return;

  var stage = document.getElementById("intro-stage");
  var laptop = document.getElementById("laptop");
  var skip = document.getElementById("intro-skip");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finished = false;

  document.body.classList.add("intro-open");
  intro.setAttribute("tabindex", "-1");
  intro.focus({ preventScroll: true }); // keyboard users Tab to the laptop; no stray focus ring

  function fitStage() {
    var scale = Math.min(1, window.innerWidth / 1040, window.innerHeight / 820);
    stage.style.setProperty("--scale", scale.toFixed(3));
  }

  function finish() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) { /* storage blocked: fine */ }

    intro.classList.add("is-leaving");
    document.body.classList.remove("intro-open");
    window.removeEventListener("resize", fitStage);
    document.removeEventListener("keydown", onKey);

    window.setTimeout(function () {
      root.classList.remove("intro-pending");
      var main = document.getElementById("main");
      if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
    }, reduceMotion ? 20 : 750);
  }

  function openLaptop() {
    if (laptop.classList.contains("is-open")) return;
    laptop.classList.add("is-open");
    window.setTimeout(finish, reduceMotion ? 100 : 1900);
  }

  function onKey(event) {
    if (event.key === "Escape") finish();
  }

  fitStage();
  window.addEventListener("resize", fitStage);
  document.addEventListener("keydown", onKey);
  laptop.addEventListener("click", openLaptop);
  skip.addEventListener("click", finish);
})();
