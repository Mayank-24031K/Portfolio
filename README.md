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

## Responsive updates

The site includes `css/responsive.css`, loaded after the original styles. It adds dedicated tablet and phone layouts, fluid type and spacing, safer wrapping for long project names/chips, a stacked mobile navigation, and compact loader spacing to avoid collisions. No build step is required.

To test, open the page in browser developer tools and check widths around 320, 375, 430, 768, 820, 1024 and 1280 pixels.

## Doodles & fonts update

- `css/doodles.css` + `js/doodles.js`: all 49 background doodles now show on every screen size (they were hidden on tablets/phones and below 1700px for the Work/About sections). Sizes scale per breakpoint (`--ds`), and each doodle is kept inside the screen.
- Every doodle is animated (float, drift, sway, spin, twinkle, heartbeat, flash), staggered so nothing moves in sync. Off-screen layers pause to save battery; `prefers-reduced-motion` turns the motion off.
- Hover a doodle with a mouse and it enlarges (1.8x); on touch screens, tap one to make it pop (2x). Change the size with `--hot` in `css/doodles.css`.
- `css/fonts.css` + `fonts/`: Gelasio (a Georgia look-alike) and Archivo Black (for the title) are bundled as fallbacks so Android/Linux devices match iOS/desktop. They only download when the device lacks Georgia / Arial Black.

## Lightbox

`css/lightbox.css` + `js/lightbox.js`: the thumbnail grows slightly on hover and has an animated "click to check" arrow (hidden after first open). Tap/click the "Previous work" sketchboard in the hero and it opens as a paper card (not full screen) so all details are readable. Tap the image inside to zoom further (scrolls), and close with ✕, Esc or a tap outside.
