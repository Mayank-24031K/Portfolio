/* Opens the "Previous work" sketchboard as a paper card. Esc, backdrop click or ✕ closes it. */
(function () {
  "use strict";

  var trigger = document.querySelector(".scrap--interface");
  var thumb = trigger && trigger.querySelector("img");
  if (!trigger || !thumb) return;

  trigger.setAttribute("data-lightbox", "");
  trigger.setAttribute("data-cursor", "hover");
  trigger.setAttribute("role", "button");
  trigger.setAttribute("tabindex", "0");
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-label", "Open previous work sketchboard larger");

  var hint = document.createElement("span");
  hint.className = "lb-hint";
  hint.setAttribute("aria-hidden", "true");
  hint.innerHTML =
    '<svg viewBox="0 0 64 56"><path class="lb-curve" d="M58 44 C40 54 14 46 10 22"/>' +
    '<path class="lb-head" d="M2 31 L10 20 L21 29"/></svg>' +
    '<span class="lb-hint__text"><span class="c">click</span><span class="t">tap</span> to check</span>';
  trigger.appendChild(hint);

  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Previous work");
  lb.innerHTML =
    '<div class="lb__paper">' +
      '<button class="lb__close" type="button" aria-label="Close">&#10005;</button>' +
      '<div class="lb__view"><img alt=""></div>' +
      '<div class="lb__bar"><span>Previous work</span>' +
      '<span><span class="lb__hint-long">Tap the image to zoom · Esc or </span>tap outside to close</span></div>' +
    '</div>';
  document.body.appendChild(lb);

  var img = lb.querySelector("img");
  var view = lb.querySelector(".lb__view");
  var closeBtn = lb.querySelector(".lb__close");
  img.src = thumb.getAttribute("src");
  img.alt = thumb.getAttribute("alt") || "";

  function open() {
    lb.classList.add("is-open");
    trigger.classList.add("lb-open-seen");
    document.documentElement.classList.add("lb-lock");
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    lb.classList.remove("is-open", "is-zoomed");
    document.documentElement.classList.remove("lb-lock");
    trigger.focus({ preventScroll: true });
  }

  trigger.addEventListener("click", open);
  trigger.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  view.addEventListener("click", function () {
    lb.classList.toggle("is-zoomed");
    view.scrollTo(0, 0);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb.classList.contains("is-open")) close();
    if (e.key === "Tab" && lb.classList.contains("is-open")) { e.preventDefault(); closeBtn.focus(); }
  });
})();
