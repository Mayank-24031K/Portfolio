/* Highlights the nav link of the section currently in view. */
(function () {
  "use strict";

  var links = document.querySelectorAll('.site-nav__links a[href^="#"]');
  if (!links.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  links.forEach(function (link) { byId[link.getAttribute("href").slice(1)] = link; });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = byId[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.removeAttribute("aria-current"); });
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }, { rootMargin: "-40% 0px -50% 0px" });

  Object.keys(byId).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();