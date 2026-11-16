// Splits Eleventy's one output (_site/) into one folder per GitHub Pages repo:
//   dist/www/   ferritefw.dev       everything but /blog/
//   dist/blog/  blog.ferritefw.dev  the contents of /blog/, at its root, plus the shared assets it links to
// Each gets its own CNAME file. Run after a production build (`npm run build` does both).

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "_site");
const dist = join(root, "dist");
const sites = { www: "ferritefw.dev", blog: "blog.ferritefw.dev" };
// Files every page loads from its own host (root-relative /assets/site.css and so on), so the blog gets copies.
const shared = ["assets", "favicon.ico", "favicon.svg", "apple-touch-icon.png", "logo.svg"];

if (!existsSync(site)) {
  console.error("no _site/: run the Eleventy build first");
  process.exit(1);
}
rmSync(dist, { recursive: true, force: true });
const www = join(dist, "www");
const blog = join(dist, "blog");
mkdirSync(www, { recursive: true });
mkdirSync(blog, { recursive: true });

for (const name of readdirSync(site)) {
  if (name === "blog") continue;
  cpSync(join(site, name), join(www, name), { recursive: true });
}
cpSync(join(site, "blog"), blog, { recursive: true });
for (const name of shared) {
  if (existsSync(join(site, name))) cpSync(join(site, name), join(blog, name), { recursive: true });
}
// The blog's own 404 sends people home; GitHub Pages serves 404.html.
if (existsSync(join(site, "404.html"))) cpSync(join(site, "404.html"), join(blog, "404.html"));

for (const [dir, host] of Object.entries(sites)) {
  writeFileSync(join(dist, dir, "CNAME"), host + "\n");
  // No Jekyll processing on GitHub Pages: serve the files as they are.
  writeFileSync(join(dist, dir, ".nojekyll"), "");
}
console.log("dist/www  -> ferritefw.dev\ndist/blog -> blog.ferritefw.dev");
