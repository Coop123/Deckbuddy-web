# Deck Buddy — marketing site

Static site. No build step, no dependencies, no external requests. Four pages:

| File | Page |
|---|---|
| `index.html` | Home |
| `features.html` | Features |
| `demo.html` | Live demo |
| `call.html` | Book a call |
| `site.css` | All styling |
| `site.js` | All behaviour |

## Putting it on GitHub

The target repo is **https://github.com/Coop123/Deckbuddy-web** (public, empty).

This folder is already a git repo with commits on `main`, but its `origin` still points
at an earlier repo. Repoint it and push:

```bash
cd ~/Desktop/"Deck Buddy"/deckbuddy-site
git remote set-url origin https://github.com/Coop123/Deckbuddy-web.git
git add -A && git commit -m "Add 404 page"
git push -u origin main
```

Username `Coop123`; at the password prompt paste a **personal access token**, not your
account password (github.com → Settings → Developer settings → Personal access tokens →
Fine-grained, Contents: read and write on that repo). Or `brew install gh && gh auth
login` first and it handles auth for you.

If you'd rather not use the command line at all: open the repo on github.com, click
**uploading an existing file**, and drag in every file from this folder (they all sit at
the top level — there are no subfolders, on purpose). One commit and you're done.

> Note: `Deckbuddy-web` is **public**, so `SPEC.md` — the internal build brief with the
> product roadmap and open questions — would be readable by anyone. Delete it before
> pushing, or make the repo private, if you'd rather keep it in.

## Deploying to the deck-buddy-app project

> **This replaces what that project serves.** `deck-buddy-app.vercel.app` currently
> serves the Deck Buddy app itself. Once this repo is connected, that URL serves the
> marketing site and the app is no longer there. If you want the app back later,
> reconnect the old repo in the same settings screen — Vercel keeps every past
> deployment, so nothing is lost.

In the Vercel dashboard, open the **deck-buddy-app** project (team `deck-buddy`):

1. **Settings → Git** → disconnect the currently connected repository.
2. Connect `deckbuddy-site` instead.
3. **Settings → Build & Deployment** — you can leave everything as it is. `vercel.json`
   pins the settings that matter, so the project's old app-build configuration cannot
   break this deploy (see below). If you'd rather have the dashboard match reality:
   Framework Preset **Other**, Build Command, Install Command and Output Directory all
   empty / off.
4. **Deployments → Redeploy**, or just push a commit.

### Why the old project settings can't break it

That project was configured for a JS app, so it may still carry a framework preset, a
`npm run build` build command, or an output directory of `dist`. Two things defend
against that:

- **`vercel.json` overrides the project settings.** It sets `framework: null`,
  `buildCommand: null`, `installCommand: null` and `outputDirectory: "."`. Values in
  `vercel.json` take precedence over the dashboard, so the site is served straight from
  the repo root with no build.
- **`build.js` is a working fallback.** If a build somehow does run, `npm run build`
  copies the site into `dist/` — so a leftover "output directory: dist" setting finds
  what it expects instead of 404ing. It has no dependencies; `dist/` is gitignored.

Either path serves the same site. There is genuinely nothing to compile.

### Other ways in

- **Its own project instead:** import the same repo as a new Vercel project. Framework
  preset Other, everything else empty.
- **Inside an existing repo:** drop this folder into e.g. `DeckBuddy-V3` and set Vercel's
  **Root Directory** to `deckbuddy-site`.
- **No GitHub:** `npx vercel --prod` from inside this folder.

`cleanUrls` is on, so pages serve at `/features`, `/demo`, `/call` (and the `.html`
URLs redirect there). `.vercelignore` keeps `SPEC.md` and this README off the
deployed site.

### Local preview

```bash
npm run dev     # http://localhost:3000, no dependencies to install
```

## Things worth knowing

- **The demo page is self-updating.** `demo.html` points at the published Deck Buddy
  artifact URL. Republish a new build to that same artifact and the demo page serves
  it — the site never needs editing to keep up.
- **The inline frame is opt-in on purpose.** claude.ai refuses to be embedded in
  another page, and a refused frame still fires a `load` event, so there is no
  reliable way to detect the block. The page therefore shows an "Open the live build"
  panel by default, with a "Try loading it here" button behind it.
- **The booking form sends nothing.** It validates, then opens the visitor's email
  client with a pre-filled message to cooper.pisani@gmail.com, and shows the same
  text on screen with a copy button in case no mail client opens. To collect
  submissions server-side later, swap the mailto step in `initCallForm()` for a
  `fetch()` to a form endpoint.
- **Colors are the app's own tokens**, copied from the published build, so the site
  and the product match. All of them live at the top of `site.css`; change them there
  and the whole site follows.
- **Light and dark** both ship, remembered per visitor in `localStorage`.
- Everything animates on scroll, and everything degrades: if JS fails or
  `IntersectionObserver` is missing, all content reveals immediately.

## Editing content

Product copy lives in the HTML. `SPEC.md` (not deployed) is the source brief the
pages were written from — it holds the approved facts and the numbers that are true.
