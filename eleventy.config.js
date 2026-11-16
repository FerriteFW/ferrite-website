import pluginRss from "@11ty/eleventy-plugin-rss";
import site from "./src/_data/site.js";

export default function (eleventyConfig) {
  // Drafts (`draft: true`) are in the local preview, never in a production build.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && site.production) return false;
  });

  eleventyConfig.addPassthroughCopy({
    "src/img": "img",
    "src/assets": "assets",
    "src/favicon.ico": "favicon.ico",
    "src/favicon.svg": "favicon.svg",
    "src/apple-touch-icon.png": "apple-touch-icon.png",
    "src/logo.svg": "logo.svg",
    // The web simulator, copied in by `npm run sim` (see README).
    "vendor/sim": "try/sim",
  });
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/blog/posts/*.md").sort((a, b) => b.date - a.date),
  );

  // A blog page's address on whichever site serves the blog: /blog/x/ locally, blog.ferritefw.dev/x/ in production.
  eleventyConfig.addFilter("blogUrl", (url) => site.urls.blog + String(url).replace(/^\/blog/, ""));
  // A main-site page's address: relative locally, ferritefw.dev in production (so the blog's links work too).
  eleventyConfig.addFilter("wwwUrl", (url) => site.urls.www + url);

  const fmt = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  eleventyConfig.addFilter("readableDate", (d) => fmt.format(d));
  eleventyConfig.addFilter("isoDate", (d) => d.toISOString().slice(0, 10));

  // The Atom feed is src/blog/feed.njk; the plugin gives it its date and absolute-URL filters.
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addFilter("blogAbs", (url) => site.absolute.blog + String(url).replace(/^\/blog/, ""));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
}
