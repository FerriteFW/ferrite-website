# ferritefw.dev

The Ferrite website and blog, built with [Eleventy 3](https://www.11ty.dev). One build makes both sites.
No client JavaScript except the simulator page (`/try/`).

## Build and preview

- `npm install` once.
- `npm run serve` (or `npm start`): local preview at http://localhost:8080/, drafts included. The blog is at `/blog/`.
- `npm run build`: the production build, drafts left out, split into `dist/www/` and `dist/blog/`.

## Where things are

- `src/` pages: `index.njk` (Home), `features/`, `download/`, `try/`, `bench/`, `blog/`.
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

One Markdown file per post in `src/blog/posts/`. See [POSTING.md](POSTING.md).

## The simulator (Try it)

- `/try/` is the site's own page: the screen (cropped from what the wasm draws), plain buttons for every key, and a short key legend. Its script is `src/assets/try.js`; it uses the wasm's API (`ferrite/sim-web/README.md`).
- The wasm is `vendor/sim/ferrite_sim_web.wasm`, served as `/try/ferrite_sim_web.wasm`. `/try/sim/` only redirects to `/try/`.
- To refresh it: `cargo simweb` in `ferrite/`, then `npm run sim` here, and commit the new wasm (it is under 1 MB, so the site builds without a Rust toolchain).
- `FERRITE_DIR=/path/to/ferrite npm run sim` if the checkout isn't at `../ferrite`.

## Deploy plan (not set up yet)

- `dist/www/` goes to this repo's GitHub Pages (FerriteFW/ferrite-website), served at ferritefw.dev.
- `dist/blog/` goes to a separate Pages repo (to be made), served at blog.ferritefw.dev.
- console.ferritefw.dev (Ferrite Console) and manual.ferritefw.dev (the user guide, from `docs/tools/mkguide.py`) are built elsewhere.
- Later: a Forgejo CI job or a GitHub Action runs `npm ci && npm run build` and pushes each `dist/` folder to its repo's Pages branch. Each folder has its `CNAME` and `.nojekyll` already.
- DNS is at Cloudflare.
