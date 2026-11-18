/* Interactive social buttons: magnetic hover, star burst on click, copy-email. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var buttons = document.querySelectorAll(".social-btn");

  buttons.forEach(function (btn) {
    // magnetic pull toward the cursor
    if (!reduce) {
      btn.addEventListener("mousemove", function (e) {
        var b = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", ((e.clientX - b.left - b.width / 2) * 0.18).toFixed(1) + "px");
        btn.style.setProperty("--my", ((e.clientY - b.top - b.height / 2) * 0.25).toFixed(1) + "px");
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    }

    btn.addEventListener("click", function (e) {
      burst(btn);
      var mail = btn.getAttribute("data-copy");
      if (mail && navigator.clipboard) {
        e.preventDefault();
        navigator.clipboard.writeText(mail).then(function () { tip(btn, "Email copied!"); },
                                                 function () { window.location.href = btn.href; });
      }
    });
  });

  function burst(btn) {
    if (reduce) return;
    for (var i = 0; i < 7; i++) {
      var s = document.createElement("span");
      var angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.5;
      var dist = 40 + Math.random() * 30;
      s.className = "social-btn__spark";
      s.textContent = i % 2 ? "✦" : "✧";
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      btn.appendChild(s);
      setTimeout(function (el) { el.remove(); }, 750, s);
    }
  }

  function tip(btn, text) {
    var t = btn.querySelector(".social-btn__tip");
    if (!t) { t = document.createElement("span"); t.className = "social-btn__tip"; btn.appendChild(t); }
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("show"); }, 1600);
  }
})();
