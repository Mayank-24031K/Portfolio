# Mayank Kumar — portfolio (HTML / CSS / JS)

No build step. Open `index.html` in a browser, or serve the folder (`python3 -m http.server`).

    index.html        page markup
    css/tokens.css    colours, fonts, sizes (edit here first)
    css/base.css      reset, shared styles
    css/nav.css  hero.css  work.css  about.css  footer.css  intro.css
    js/intro.js       laptop intro overlay (plays once per session)
    js/main.js        highlights the current nav link

Images still load from Framer's CDN (see the `<img src>` in index.html).
Download them into an `images/` folder and update the paths to make the site fully offline.

    css/spring.css  js/spring.js     doodle spring on the right edge (stretches with scroll)
    css/socials.css js/socials.js    footer social buttons (edit the links in index.html)

    css/cursor.css  js/cursor.js     sketched cursor: pencil arrow, ink-doodle trail, hover ring, click burst
                                     (mouse/trackpad only; palette is the COLORS array at the top of cursor.js)
