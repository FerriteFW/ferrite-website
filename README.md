# ferritefw.dev

The Ferrite website and blog, built with [Eleventy 3](https://www.11ty.dev). One build makes both sites.
Client JavaScript only on Home (`src/assets/home.js`, the story's loops), Watch (`src/assets/watch.js`) and `/s` (`src/assets/share.js`: Ferrite Pocket's share codes, read from the link's fragment or made from a form, with a QR code from `src/assets/qrcode.js`, Kazuhiko Arase's qrcode-generator 1.4.4, MIT, as published); every page works without it.
`src/.well-known/apple-app-site-association` lets those `/s` links open Ferrite Pocket on an iPhone.

## Build and preview

- `npm install` once.
- `npm run serve` (or `npm start`): local preview at http://localhost:8080/, drafts included. The blog is at `/blog/`.
- `npm run build`: the production build, drafts left out, split into `dist/www/` and `dist/blog/`.

## Where things are

- `src/` pages: `index.njk` (Home: the story), `features/`, `watch/`, `download/`, `bench/`, `blog/`.
- `src/_data/site.js`: the URL map, links, licence, the release switch and the bench page's `SUPPORT_URL` and `CONTACT` (each section stays hidden until set).
- `src/_data/bench.js`: the bench and wish lists, in whole Canadian dollars.
- `src/assets/site.css`: the one stylesheet.
- `src/img/`: simulator frames only (240 x 320 screens, 4x). `src/img/guide/` are the user guide's shots, scaled 4x with nearest-neighbour.
- `scripts/split.mjs`: splits `_site/` into the two deploy folders and writes each one's `CNAME`.

## Links between sites

- Production (`ELEVENTY_ENV=production`, set by `npm run build`): links between the main site and the blog are absolute (`https://ferritefw.dev`, `https://blog.ferritefw.dev`).
- Preview: one server, the blog under `/blog/`.
- Console and Manual always link to `https://console.ferritefw.dev` and `https://manual.ferritefw.dev`.

## Blog posts

One Markdown file per post in `src/blog/posts/`. See [POSTING.md](POSTING.md). Ideas for posts: [BLOG-IDEAS.md](BLOG-IDEAS.md); how they read: [BLOG-STYLE.md](BLOG-STYLE.md).

## Home's story and the Watch page

- The story: one screen stays pinned while six chapters scroll past; each chapter swaps in a short, silent, screen-only loop (`src/loops/NAME.mp4`, 480 x 640, and a `NAME.webp` still). Chapter text is in `src/index.njk`'s front matter.
- `npm run loops` records the loops from the simulator with ferrite's recorder (`scripts/loops.py`: each chapter's key script is there; needs the ferrite checkout, cargo, ffmpeg and ImageMagick). `npm run loops -- scope` redoes one.
- Reduced motion: no video, the stills swap. Without JavaScript: the chapters stack, each with its still.
- `/watch/`: the four full videos, `src/video/{tour,unique,aprs,lowpower}.mp4` (silent) with `.jpg` posters; each plays while half in view and pauses when it leaves (`src/assets/watch.js`; reduced motion: a play button instead). Titles and lines: `src/_data/videos.js`.
- `npm run videos` makes them from `ferrite/target/promo/` (render with `tools/promo/mkvideo.py` first; needs ffmpeg and ImageMagick): H.264 1280x720 (CRF 26), no audio, faststart. Posters are the screen alone, cut from one frame of each source; `npm run videos -- --posters` remakes only those, `POSTER_<name>=SECONDS` moves one.
- All encodes are committed (Pages serves them).

## Deploy plan (not set up yet)

- `dist/www/` goes to this repo's GitHub Pages (FerriteFW/ferrite-website), served at ferritefw.dev.
- `dist/blog/` goes to a separate Pages repo (to be made), served at blog.ferritefw.dev.
- console.ferritefw.dev (Ferrite Console) and manual.ferritefw.dev (the user guide, from `docs/tools/mkguide.py`) are built elsewhere.
- Later: a Forgejo CI job or a GitHub Action runs `npm ci && npm run build` and pushes each `dist/` folder to its repo's Pages branch. Each folder has its `CNAME` and `.nojekyll` already.
- DNS is at Cloudflare.
