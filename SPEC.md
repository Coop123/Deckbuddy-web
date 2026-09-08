# Deck Buddy — marketing site build spec

Build a **static, Vercel-deployable marketing site** for Deck Buddy, an app that replaces the
paper meet sheet at competitive swim meets. Four pages, shared CSS/JS, no build step, no
frameworks, no npm. Plain HTML + CSS + vanilla JS only.

Target audience: **any competitive swim program** — club, high school, summer league.
Voice: confident, concrete, deck-side. Written by a coach who has actually stood on a pool
deck with a clipboard. Never corporate-SaaS ("empower", "seamless", "revolutionize",
"unlock", "leverage" are banned). Short sentences. Specifics over adjectives.

---

## 0. Files

```
index.html          Home
features.html       Features
demo.html           Live demo
call.html           Schedule a call
assets/site.css     ALL styling (one file, no inline <style> except where noted)
assets/site.js      ALL behaviour (one file)
vercel.json         { "cleanUrls": true, "trailingSlash": false }
```

Every page is a complete document: `<!doctype html><html lang="en" ...>` with `<head>`
containing charset, viewport, `<title>`, `<meta name="description">`, an inline
theme-bootstrap script (see §3), `<link rel="stylesheet" href="/assets/site.css">`, an
inline SVG favicon data URI, and `<script src="/assets/site.js" defer></script>`.

No external resources at all — no Google Fonts, no CDNs, no images. Everything is system
fonts, CSS, and inline SVG. The site must work offline from `file://` too (so use relative
paths `assets/site.css`, not `/assets/site.css`).

---

## 1. Brand + palette (MATCH THE APP EXACTLY — do not invent colors)

These tokens are lifted verbatim from the real Deck Buddy build. Copy the values exactly.

```css
:root, [data-theme="light"] {
  color-scheme: light;
  --db-bg:#e9f1fa;
  --db-bg-wash-1:rgba(147,197,253,.55);
  --db-bg-wash-2:rgba(244,178,214,.42);
  --db-bg-wash-3:rgba(255,255,255,.9);
  --db-panel:rgba(255,255,255,.84);
  --db-panel-quiet:rgba(255,255,255,.55);
  --db-overlay:rgba(255,255,255,.93);
  --db-panel-inset:rgba(238,245,253,.9);
  --db-scrim:rgba(16,35,59,.34);
  --db-ink:#10233b;
  --db-ink-soft:#46617f;
  --db-ink-faint:#7c93ab;
  --db-line:rgba(16,35,59,.14);
  --db-line-soft:rgba(16,35,59,.08);
  --db-accent:#2f7dd1;
  --db-accent-soft:rgba(47,125,209,.14);
  --db-accent-ink:#1a5697;
  --db-live:#d8398d;
  --db-live-soft:rgba(216,57,141,.15);
  --db-live-ink:#9d1b62;
  --db-good:#16855c;
  --db-good-soft:rgba(22,133,92,.15);
  --db-warn:#a96a05;
  --db-warn-soft:rgba(169,106,5,.15);
  --db-danger:#c2352c;
  --db-danger-soft:rgba(194,53,44,.14);
  --db-shadow:0 1px 2px rgba(16,35,59,.06), 0 8px 24px -12px rgba(16,35,59,.28);
  --db-shadow-lg:0 2px 6px rgba(16,35,59,.08), 0 28px 60px -22px rgba(16,35,59,.42);
}
[data-theme="dark"] {
  color-scheme: dark;
  --db-bg:#0a1220;
  --db-bg-wash-1:rgba(45,105,178,.42);
  --db-bg-wash-2:rgba(190,74,137,.32);
  --db-bg-wash-3:rgba(12,22,38,.9);
  --db-panel:rgba(20,31,50,.84);
  --db-panel-quiet:rgba(20,31,50,.55);
  --db-overlay:rgba(16,25,42,.94);
  --db-panel-inset:rgba(30,44,68,.85);
  --db-scrim:rgba(3,8,16,.58);
  --db-ink:#eaf2fb;
  --db-ink-soft:#a9bed6;
  --db-ink-faint:#7189a5;
  --db-line:rgba(233,241,250,.16);
  --db-line-soft:rgba(233,241,250,.09);
  --db-accent:#6fb2f2;
  --db-accent-soft:rgba(111,178,242,.2);
  --db-accent-ink:#b9dbff;
  --db-live:#ff77bb;
  --db-live-soft:rgba(255,119,187,.22);
  --db-live-ink:#ffc2e0;
  --db-good:#4fd39b;
  --db-good-soft:rgba(79,211,155,.2);
  --db-warn:#f0b354;
  --db-warn-soft:rgba(240,179,84,.2);
  --db-danger:#ff7a70;
  --db-danger-soft:rgba(255,122,112,.2);
  --db-shadow:0 1px 2px rgba(0,0,0,.4), 0 10px 26px -14px rgba(0,0,0,.8);
  --db-shadow-lg:0 2px 8px rgba(0,0,0,.5), 0 30px 64px -24px rgba(0,0,0,.9);
}
```

Body background (fixed, both themes) — this is the app's own signature wash:

```css
body{
  background-color:var(--db-bg);
  background-image:
    radial-gradient(90ch 60ch at 12% -10%, var(--db-bg-wash-1), transparent 60%),
    radial-gradient(80ch 55ch at 92% 8%,  var(--db-bg-wash-2), transparent 62%),
    radial-gradient(120ch 70ch at 50% 115%, var(--db-bg-wash-3), transparent 70%);
  background-attachment:fixed;
  color:var(--db-ink);
}
```

**Design rules that are non-negotiable** (they come from the product's own design doc):
- Blue is the ground. **Pink (`--db-live`) is reserved for live/active state and highlights
  only** — never for large fills, never for a team.
- Glass panels that carry text need real blur *plus* a mostly-opaque ground. Never put body
  text over an unblurred translucent panel. (This was the #1 bug in v1.)
- Big tap targets: every button/link target ≥ 44px tall.
- Rounded, soft: radii 12–28px. Nothing sharp.

Team colors (used only in the deck mock and league strip):
Belwood BDST `#e8b931` (yellow) · Oaktree OAK `#1e3a8a` (dark blue) · Montevideo MTVD
`#c2352c` (red) · Los Paseos LPAC `#7cc0f5` (light blue) · Silver Creek SCVCC `#14b8a6`
(teal) · Almaden AGCC `#16855c` (green).

Typography: system stack
`ui-sans-serif,-apple-system,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif`.
Numbers use `font-variant-numeric:tabular-nums` (class `.tnum`) and the mono stack
`ui-monospace,SFMono-Regular,Menlo,Consolas,monospace` for times/lanes.

Type scale (fluid, clamp()): display `clamp(2.6rem,6.2vw,4.6rem)`, h2
`clamp(1.9rem,3.4vw,2.9rem)`, h3 `1.35rem`, body `1.0625rem/1.65`, small `.875rem`,
eyebrow `.75rem` uppercase `letter-spacing:.14em`.

---

## 2. Shared class contract (assets/site.css)

**Every page uses only these classes. Define all of them in site.css.** Pages 2–4 are built
by other people against this contract, so it must be complete and stable.

Layout
- `.wrap` — `width:100%;max-width:1180px;margin-inline:auto;padding-inline:clamp(1rem,4vw,2rem)`
- `.wrap-narrow` — same but `max-width:820px`
- `.section` — `padding-block:clamp(4rem,9vw,7.5rem)`; `.section-tight` — `clamp(2.5rem,5vw,4rem)`
- `.grid` + `.cols-2` `.cols-3` `.cols-4` — responsive auto-collapsing grid, `gap:1.25rem`
- `.stack` — vertical flex, `gap:1rem`
- `.row` — horizontal flex, `align-items:center; gap:.75rem; flex-wrap:wrap`

Glass surfaces
- `.glass` — the base: `backdrop-filter:blur(20px) saturate(160%)` (+ `-webkit-`),
  `background:var(--db-panel)`, `border:1px solid var(--db-line-soft)`,
  `box-shadow:var(--db-shadow)`, `border-radius:20px`
- `.glass-lg` — `border-radius:28px; box-shadow:var(--db-shadow-lg); background:var(--db-overlay)`
- `.glass-quiet` — `background:var(--db-panel-quiet)`
- `.inset` — `background:var(--db-panel-inset); border:1px solid var(--db-line-soft); border-radius:14px`
- `.card` — `.glass` + `padding:clamp(1.25rem,2.4vw,1.75rem)`
- `.card-hl` — card with a 3px left rail in `--db-live` and a faint `--db-live-soft` glow

Type helpers
- `.eyebrow` (uppercase, tracking, `--db-accent-ink`), `.display`, `.h2`, `.h3`,
  `.lede` (`1.2rem`, `--db-ink-soft`, `max-width:60ch`), `.muted` (`--db-ink-soft`),
  `.faint` (`--db-ink-faint`), `.mono`, `.tnum`, `.center`, `.balance` (`text-wrap:balance`)

Controls
- `.btn` — 48px min-height, radius 14px, `border:1px solid var(--db-line)`,
  `background:var(--db-panel)`, weight 600, `transition:transform .14s, box-shadow .14s`;
  `:hover{transform:translateY(-2px)}` `:active{transform:scale(.97)}`
- `.btn-accent` — `background:var(--db-accent); color:#fff; border-color:transparent`
- `.btn-live` — `background:var(--db-live); color:#fff; border-color:transparent`
- `.btn-ghost` — transparent background, visible border
- `.chip` — pill, `border:1px solid var(--db-line-soft)`, `background:var(--db-panel)`,
  `.chip-accent`, `.chip-live`, `.chip-good`, `.chip-danger` variants (soft bg + ink color)
- `.field` — label + input/select/textarea wrapper; inputs are `.inset`, 48px min-height,
  `font-size:1rem`, focus ring `outline:2px solid var(--db-accent); outline-offset:2px`
- `.toggle-chip` — a `<button aria-pressed>` pill; pressed state = `--db-accent-soft` bg +
  `--db-accent` border

Nav / footer
- `.nav` — sticky top, `z-index:50`, glass, becomes denser (`.nav.scrolled`) after 12px scroll
- `.nav-links`, `.nav-link` (`.is-active` = accent ink + 2px pink underline)
- `.nav-toggle` — hamburger button, only visible < 860px; opens `.nav-drawer`
- `.progress` — 3px fixed top bar, `background:var(--db-live)`, width set from JS
- `.footer` — glass-quiet top border, three columns, small print

Animation classes (see §3)
- `.reveal`, `.reveal.in`, `.reveal-up`, `.reveal-pop`, `.reveal-left`, `.reveal-right`
- `.stagger > *` uses `--i` for delay
- `.tilt` — hover 3D tilt container
- `.float-a` `.float-b` `.float-c` — slow drifting background orbs
- `.count` — number that counts up when revealed (`data-count="2200"`, `data-suffix="+"`)
- `.bar` / `.bar-fill` — horizontal bar that animates its width from `data-pct`
- `.marquee` / `.marquee-track` — infinite horizontal scroller, pauses on hover

Deck-mock classes (used on index + demo)
- `.deck` `.deck-col` `.deck-panel` `.lane` `.lane-num` `.lane-name` `.lane-team`
  `.lane-box` `.lane-box.filled` `.flip` `.flip-tile` `.live-dot` `.now-rail`
  `.sheet` `.sheet-event` `.sheet-heat` `.sheet-row` `.badge`

---

## 3. Behaviour (assets/site.js) + the inline theme bootstrap

**Inline in every `<head>`, before the stylesheet** (prevents a flash of the wrong theme):

```html
<script>
(function(){try{var t=localStorage.getItem('db-theme');
if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
document.documentElement.setAttribute('data-theme',t);}catch(e){
document.documentElement.setAttribute('data-theme','light');}})();
</script>
```

`assets/site.js` implements, all guarded with `try/catch` around every `localStorage` access:

1. **Theme toggle** — button in the nav (sun/moon inline SVG), flips `data-theme`, persists to
   `localStorage['db-theme']`, `aria-label` updates.
2. **Scroll reveal** — `IntersectionObserver` (`threshold:.12`, `rootMargin:'0px 0px -8% 0px'`)
   adds `.in` to every `.reveal`. Once only (unobserve after). Elements inside `.stagger` get
   `style.transitionDelay = (index * 70)ms`. **Fallback: if `IntersectionObserver` is missing,
   immediately add `.in` to everything** so content is never invisible.
3. **Count-up** — when a `.count` reveals, animate 0 → `data-count` over 1100ms with an
   ease-out curve, respecting `data-suffix` / `data-prefix`. Uses `requestAnimationFrame`.
4. **Bars** — when a `.bar` reveals, set `.bar-fill` width to `data-pct%` (CSS transitions it).
5. **Sticky nav** — toggle `.scrolled` past 12px; update `.progress` width to
   `scrollY / (scrollHeight - innerHeight)`.
6. **Mobile drawer** — `.nav-toggle` opens/closes `.nav-drawer`, sets `aria-expanded`, closes
   on link click and on Escape.
7. **Parallax orbs** — on scroll, translate `.float-a/.float-b/.float-c` by
   `scrollY * {-0.06, 0.04, -0.09}` px using `transform`. Throttle with `requestAnimationFrame`.
   Skip entirely on touch-only devices and when reduced motion is set.
8. **Tilt** — `.tilt` elements rotate up to ±5deg following the pointer, springing back on
   leave. Pointer events only, disabled under reduced motion.
9. **Deck mock loop** — see §6.
10. **Reduced motion** — `if (matchMedia('(prefers-reduced-motion: reduce)').matches)` then
    add `.in` to everything up front, set all bars/counters to final values, and skip
    parallax/tilt/mock animation. Also mirror this in CSS with a
    `@media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }`
    block scoped to the animation classes.

CSS for reveals (defaults, before `.in`):

```css
.reveal{opacity:0;transform:translateY(28px) scale(.98);
  transition:opacity .7s cubic-bezier(.2,.75,.3,1), transform .7s cubic-bezier(.2,.75,.3,1);
  will-change:opacity,transform}
.reveal.in{opacity:1;transform:none}
.reveal-pop{transform:translateY(34px) scale(.9)}       /* the "pop out" */
.reveal-left{transform:translateX(-34px)}
.reveal-right{transform:translateX(34px)}
```

Accessibility: skip link to `#main`, one `<h1>` per page, real landmarks (`header/nav/main/footer`),
`aria-label` on icon-only buttons, visible focus rings everywhere, alt text on inline SVG via
`role="img"` + `<title>`. Color contrast must pass in BOTH themes.

Responsive: works at 360px, 768px, 1024px, 1440px. Nothing may scroll horizontally — wide
elements (deck mock, export grid, tables) live in `overflow-x:auto` containers.

---

## 4. Site chrome (identical markup on all four pages)

**Header**
```
[progress bar]
<header class="nav">
  <div class="wrap nav-inner">
    <a class="brand" href="index.html">[inline SVG mark] Deck Buddy</a>
    <nav class="nav-links">
      Home (index.html) · Features (features.html) · Demo (demo.html)
      <a class="btn btn-live" href="call.html">Book a call</a>
      [theme toggle button]
    </nav>
    [nav-toggle hamburger]
  </div>
</header>
```
The brand mark: an inline SVG, 26×26, of a lane-line / water motif — three stacked rounded
bars in `--db-accent`, `--db-live`, `--db-accent` at decreasing widths. Keep it abstract; do
not draw any real logo.

Set `.is-active` on the current page's nav link.

**Footer** — three columns: brand + one-line description; Product (Features / Demo / Book a
call); Contact (`mailto:cooper.pisani@gmail.com`). Bottom line: `© 2026 Deck Buddy · Built on
the deck, for the deck.` and a small `Version 0.0.D` chip.

---

## 5. Content — verbatim source material

Use this. Do not invent product facts, numbers, pricing, testimonials, customer logos, or
company claims. If a section needs filler, cut the section instead.

**The one-line pitch:** Paper meet sheets are write-once and unsearchable. Deck Buddy keeps
the same at-a-glance shape a coach already reads — but every mark becomes data.

**The deck (left column, three stacked sections)**
- *On deck* — the next heat. Auto-sliding strip, lane 1 → highest lane. Toggle between the
  whole heat and just your swimmers. Tap a card for that swimmer.
- *In the water* — the heat racing now. Collapsed until you hit Start; expanding it arms
  tap-to-place. `‹ ›` heat nav, red End button, auto-advance when every lane has a time.
- *Previous* — the heat that just finished. Shows **heat** place (full-event places wait
  until the event is done). Still clickable — nothing about a finished heat is locked.
- Lane numbers show as the bare number. No "L".

**The meet sheet (right column)** — Event → Heat → Lane. Toggle one-event-at-a-time or the
whole meet. Live mode highlights the running heat so the sheet and the deck stay in sync.
Search across swimmers, events, teams. Relays show the team plus up to four swimmers, each
individually clickable. Champs meets are 9 lanes; dual-meet lane count is selectable.

**Timing modes**
- *Connected* — the timing system is the source of truth. Places and times come from it,
  touchpad splits arrive on their own. The coach's job is tagging and notes.
- *Not connected* — hit Start, then tap swimmers' names as they finish. Each tap assigns the
  next heat place. Heat place only, no times. No keyboard, no stopwatch, no typing — a coach
  can do it while watching the water.
- Whenever results carry real times, the app shows improvement against the seed.

**Tagging** — a flat set of broad "needs work" chips, tapped from the swimmer popover. On deck
there is no time to navigate a tree; specificity goes in the notes field. The chips: Starts ·
Turns *(11+ only)* · Finishes · Streamline · Underwaters · Kick · Stroke technique ·
Breathing · Body position · Pacing / endurance · Race awareness. IM events prefix the tag
with the leg you pick ("Back — Turns"). Relay swimmers add a spot chip: Lead-off / Support /
Anchor.

**Splits** — with touchpads they arrive automatically. Without, a splits button opens a popup
over the meet sheet with one button per home swimmer in the heat. You tap as they hit the
wall. Buttons only, no typing.

**Scoring** — Dual: individual 6-4-3-2-1, relays A-team only at double points. Champs:
11-9-8-7-6-5-4-3-2-1, relays double, always 9 lanes. Time trials: a third meet type, no
points, no places, excluded from improvement. Improvement % = improved swims ÷ total swims.

**Statuses** — Scratch (**X**) is a planned withdrawal, set per-event or whole-meet from the
Participants & scratches screen, for any team. No-show (**NS**) is entered-but-didn't-show,
toggled from the swimmer popover. Both cross the swimmer out and drop them from placing,
scoring and results. DQ carries the exact USA Swimming code, is available for every team,
warns when you DQ a 6 & under swimmer, and on a relay is attributed to the specific swimmer.

**Records & best times** — **B** when a swim beats the swimmer's own seed. **BR** when it
beats the event record. Both flags follow through to the export.

**Imports** — Hy-Tek Meet Manager program PDFs (multi-column pages are de-columned first;
tuned against a real 76-event, ~2,200-entry championship program). Hy-Tek results PDFs, which
either merge onto a loaded program by event # + name or load as a standalone flat meet.
Time Drops heat sheets by pasted text — it's a passcode-gated live SPA with no public feed.

**Export** — a Google Sheet in the shape coaches already think in: roster down the side,
stroke categories across the top (Medley Relay, Fly, Back, IM, Breast, Free, Free Relay).
Every cell holds place, time, the best-time flag, and comments.

**Coach dashboard** — between meets, not on deck. Six KPI cards (team record, improvement %,
best times, records, DQ rate, meet points), trend charts (team improvement over the season;
points by meet split individual vs relay), and the tag engine. Tables: Roster · Needs
attention · Top performers · DQ log · Event coverage.

**The tag engine** — the part paper can never do. Tag frequency team-wide, sorted descending,
cut by age group, by stroke, and over time. Read it as *"Turns is our #1 issue across 9–10s"*
— that's Monday's practice plan. Watch the bar shrink after you coach it.

**Swimmer side (phone)** — "Up next" pins the swimmer's next event, heat, lane and roughly how
many heats out, plus their results so far today. Off-day: best times, improvement %, season
high points, meets swum, and a per-event progression chart. A swimmer dropping time sees the
line go down.

**Swimmer profile** — modeled on SwimCloud. Best times table grouped by stroke with B/BR
badges, per-event progression, reverse-chronological meet history, and rank within team and
within league.

**Three surfaces** — Coach deck (iPad recommended, phone fallback; standing, moving, wet
hands, sun, between heats). Swimmer side (phone; sitting under a canopy). Meet entry
(computer or iPad; sitting, keyboard available, dense forms are fine here).

**Design** — Liquid glass: translucent, layered panels that sit *over* content rather than
boxing it in. Light blues and pinks. Light and dark both ship. Bigger tap targets beat more
rows: wet hands, fast taps, and hitting the wrong swimmer is worse than scrolling.

**Numbers that are true and may be used** (only these):
`76` events parsed from a real championship program · `2,200`+ entries in that program ·
`2,231` result entries merged cleanly · `11` tag chips · `9` lanes at champs · `6` teams in
the league it was built for · `0` sheets of paper.

**Status line for the demo page:** current build is **0.0.D**. Built and used on a real
summer-league deck. Not yet a paid product — the call is a conversation, not a sales pitch.

---

## 6. The deck mock (index hero + demo page)

A self-contained, animated, **fake** Deck Buddy screen built from divs — no iframe, no images.
It must look like the real app: glass panels on the blue/pink wash, left deck column + right
meet sheet.

Layout (inside a rounded "device" frame with a thin bezel, `aspect-ratio` about 4/3, and its
own `overflow:hidden`):
- Top bar: `BDST vs OAK` team chips with scores, a `LIVE` pill with a pulsing pink dot, and a
  running clock `0:41.
- Left column ≈ 38%: three stacked glass panels labelled `ON DECK`, `IN THE WATER`, `PREVIOUS`.
  Each holds lane rows: bare lane number, swimmer name, small team code chip in team color,
  and a place box + split box on the right.
- Right column ≈ 62%: the meet sheet — two or three `sheet-event` blocks (`Event 21 · Girls
  9-10 50 Free`), one with a pink `now-rail` left border and a `NOW` badge, each with heat rows.

Animation loop (JS, ~9 s, `setInterval`/rAF, **paused when the tab is hidden or the element is
off-screen**, skipped under reduced motion — in which case render a static "mid-race" state):
1. Places fill one at a time in `IN THE WATER`: `.lane-box` goes from dashed-empty to
   `.filled` showing `1st`, `2nd`, `3rd`… with a small scale-pop.
2. A `.flip` split-flap ticker on the top bar flips digits as the clock runs (each digit
   `rotateX(-88deg) → 0` over 260ms, matching the app's own flip).
3. After the last place, the heat "ends": rows slide up into `PREVIOUS`, `NOW` moves to the
   next event on the sheet, and the boxes reset.
4. A tag chip pops in over the finished swimmer ("Turns", "Streamline") then fades.

Use plausible-but-clearly-sample swimmer names (first name + last initial: `Maya R.`,
`Jonah P.`, `Priya S.`, `Eli T.`, `Nora K.`, `Sam W.`, `Ava L.`, `Diego M.`, `Ruth B.`). Do
not use real people.

Give the mock `aria-hidden="true"` plus an adjacent visually-hidden text description, since
it's decorative.

---

## 7. Page briefs

### index.html — "Run the whole meet from one screen."

`<title>Deck Buddy — run the whole meet from one screen</title>`

1. **Hero** — eyebrow `BUILT ON THE POOL DECK`; H1 `Run the whole meet from one screen.`;
   lede: paper meet sheets are write-once and unsearchable — Deck Buddy keeps the shape a
   coach already reads and turns every mark into data. Buttons: `See the live demo`
   (btn-accent → demo.html) and `Book a call` (btn-ghost → call.html). Below/beside: the deck
   mock (§6), floating on `.float-a/.float-b` orbs. Small trust line under the buttons:
   `iPad on deck · phone for swimmers · computer for meet entry`.
2. **The problem** — three `.reveal-pop` cards in a `.stagger`: *Write-once* / *Unsearchable*
   / *Gone by August*. Each two sentences, concrete.
3. **Anatomy of the deck** — a two-column explainer: on one side the three deck sections
   described as numbered steps (On deck / In the water / Previous), on the other a static
   glass diagram. Reveal each step `.reveal-left`, the diagram `.reveal-right`.
4. **Timing modes** — two side-by-side glass cards, *Connected to a timing system* vs
   *No timing system*, with the tap-to-place three-step sequence spelled out.
5. **The tag engine** — the hero feature. Left: the pitch + the "Turns is our #1 issue across
   9–10s" pull-quote in a `.card-hl`. Right: animated `.bar` rows — Turns 68%, Streamline 54%,
   Finishes 41%, Breathing 33%, Underwaters 27%, Starts 19% — clearly labelled
   `Sample data` so nobody reads it as a real stat.
6. **Numbers strip** — four `.count` tiles from the true-numbers list.
7. **Three surfaces** — three cards with a device word, a posture line, and what lives there.
8. **CTA band** — a `.glass-lg` panel: `Want to see it run a meet?` + both buttons.

### features.html — "Everything on the deck, and everything after it."

`<title>Features — Deck Buddy</title>`

Sticky secondary nav (`position:sticky; top:<nav height>`) of in-page anchors: Deck · Meet
sheet · Timing · Tagging · Splits · Scoring · Statuses · Imports · Export · Dashboards.
Highlight the active section with an `IntersectionObserver` (add this observer to site.js as a
generic `[data-spy]` helper).

One `.section` per topic, alternating layout (text left / panel right, then swapped). Each
gets: an `.eyebrow`, an `h2`, a short lede, and either a bullet list of `.chip`s, a small
glass "screenshot" built from divs, or a compact table. Specifically:
- **Tagging** — render all 11 chips as real `.toggle-chip`s the visitor can press (purely
  cosmetic), with the age-gate note on Turns as a `.faint` footnote, plus the IM-leg and
  relay-spot rules.
- **Scoring** — a small two-column table of dual vs champs point spreads. `overflow-x:auto`.
- **Statuses** — three `.card`s: X, NS, DQ, using `.chip-danger`/`.chip-warn` marks.
- **Export** — a mini version of the export grid: roster down the side (4 sample swimmers),
  stroke categories across the top, one cell showing `1st · 32.14 · B`. Horizontally scrollable.
- **Dashboards** — coach KPI cards row (six tiles with a label + a sample number + a delta
  pill), then the tag-engine bars again at smaller size, then the tabbed-table list as text.
- Close with a **Design principles** section (liquid glass, tap targets, sun legibility,
  light + dark) and a CTA band.

### demo.html — "The real build, live."

`<title>Live demo — Deck Buddy</title>`

1. **Hero** — `The real build, live.` + lede explaining that below is the actual Deck Buddy
   artifact, and that **it always shows the latest published version** — when a new build
   ships, this page shows it without being touched.
2. **The animated mock** (§6) in an iPad-style frame, autoplaying — the always-works preview.
3. **Live embed** — a `.glass-lg` frame with a fake browser chrome bar (three dots + the URL
   text) containing:
   ```html
   <iframe class="demo-frame" src="https://claude.ai/code/artifact/7499744e-0c47-4fda-8e9d-6dd3a7aa98cf"
     title="Deck Buddy live build" loading="lazy"
     referrerpolicy="no-referrer-when-downgrade"
     sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
     style="width:100%;aspect-ratio:4/3;min-height:520px;border:0;border-radius:16px"></iframe>
   ```
   **A fallback is required**, because claude.ai may refuse to be framed: put a
   `.demo-fallback` panel *behind/over* the iframe that says the live build opens best in its
   own tab, with a big `btn-accent` link
   `https://claude.ai/code/artifact/7499744e-0c47-4fda-8e9d-6dd3a7aa98cf` (`target="_blank"
   rel="noopener"`). In JS: start with the fallback visible; on the iframe's `load` event set a
   flag, and after a 2500ms timer, if the frame never fired `load`, keep the fallback shown and
   hide the frame. (Never hide the fallback *before* a successful load — a blocked frame often
   renders blank without firing `load`.) Also add a `Reload demo` button that re-sets `src`.
   Note under it: *Sign-in may be required — the demo is a private build.*
4. **Guided tour** — four numbered `.card`s in a `.stagger`: 1 Start the heat · 2 Tap to place ·
   3 Tag the swim · 4 Read the sheet. Each says exactly what to click in the live demo.
5. **What's in this build / what's next** — two lists. In: coach deck, meet sheet, popover,
   tagging, timing modes, splits, DQ picker, team chips, light + dark. Next: dashboards,
   imports, season persistence, swimmer app. Be honest; this is a pre-release.
6. CTA band → call.html.

### call.html — "Twenty minutes, on your schedule."

`<title>Book a call — Deck Buddy</title>`

Two-column at ≥900px, stacked below.

**Left (`.stack`)** — `What we'll actually do` (four bullets: how your meets run today, watch
the deck run a heat, what would have to be true for your program, what's next). Then
`Who it's for` chips: Head coach · Assistant · Club board · League official · Meet director.
Then a small `.card` with `20 minutes · Video or phone · No deck, no pitch` and a direct
`mailto:cooper.pisani@gmail.com` line for anyone who'd rather just email.

**Right — the booking form** (`<form id="call-form" novalidate>`), all fields `.field`:
- Your name (required, text)
- Email (required, `type="email"`)
- Program / team (required, text)
- Your role (select: Head coach · Assistant coach · Club board / admin · League official ·
  Meet director · Swimmer or parent · Other)
- Roughly how many swimmers (select: Under 50 · 50–150 · 150–400 · 400+ · Not sure)
- Timing system (select: Colorado · Daktronics · Other · None — we time by hand · Not sure)
- When works? — `.toggle-chip` multi-select: Weekday morning · Weekday afternoon · Weekday
  evening · Weekend morning · Weekend afternoon. At least one required.
- Your time zone (select of the six US zones + "Other")
- Anything you want to cover? (textarea, optional)
- Submit: `.btn .btn-live` `Send the request`

**Behaviour** (in site.js):
- On submit, `preventDefault()`. Validate required fields; on failure add `.field-error` to
  the offending fields, set `aria-invalid="true"`, show an inline message per field, and focus
  the first bad one. **Do not use `alert()` anywhere.**
- On success, build a `mailto:` — `encodeURIComponent` every part:
  - to: `cooper.pisani@gmail.com`
  - subject: `Deck Buddy demo call — {name}, {program}`
  - body: a plain-text block with each labelled answer on its own line, ending with a
    "Sent from deckbuddy.app" style line.
- Open it with `window.location.href = mailtoUrl`.
- Then swap the form for a `.glass-lg` success panel: "Your email should be open." plus a
  `Copy the request instead` button that writes the same body to the clipboard
  (`navigator.clipboard.writeText` with a `document.execCommand('copy')` textarea fallback),
  and a `Start over` button. Keep the assembled text in a `<pre class="inset">` so it's always
  visible even if the mail client never opened.
- No data leaves the page; say so in a `.faint` line under the button:
  *This form doesn't send anything on its own — it opens your email app with the message ready.*

**FAQ** below, a `<details>`/`<summary>` accordion styled as glass rows: Is it ready to use?
· Does it work without a timing system? · What about our timing system's results? · Does it
cost anything? · Can our swimmers see it? Answers come only from §5 material; where the honest
answer is "not decided yet", say that.

---

## 8. Definition of done

- All four pages open standalone, no console errors, no external requests.
- Every section reveals on scroll; nothing is stuck invisible if JS fails or IO is missing.
- Theme toggle works and persists; both themes are legible; no color is defined only inside a
  media query.
- Nothing scrolls horizontally at 360px width.
- Form validates, produces a correct mailto, and shows the success panel.
- Total site under ~250KB.
