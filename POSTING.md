# Posting to the blog

## Write a post

1. Make a file in `src/blog/posts/`, named with the date and a short slug: `2026-11-15-ferrite-0-9.md`.
   The address is the slug without the date: `blog.ferritefw.dev/ferrite-0-9/`.
2. Start it with front matter, then write Markdown:

```markdown
---
title: "Ferrite 0.9"
date: 2026-11-15
summary: "The first public release: what's in it and how to install it."
draft: true
---

The post, in Markdown.
```

- `title`, `date` and `summary` are required. The summary shows on the blog's list and in the feed.
- Put titles and summaries in quotes (a colon in them breaks the front matter otherwise).
- `draft: true` keeps the post out of the production build. Take the line out (or set `false`) to publish.
- Links to the other sites: `{{ site.urls.blog }}`, `{{ site.urls.console }}`, `{{ site.urls.manual }}`, `{{ site.discord }}`. Main-site pages: `{{ "/download/" | wwwUrl }}`.
- Images: put them in `src/img/blog/` and link `/img/blog/name.webp`. Only the radio's screen (simulator frames), as on the rest of the site.

## Preview

- `npm run serve`, then http://localhost:8080/blog/. Drafts show with a Draft tag. The page reloads as you save.

## Publish

- Remove `draft: true`, then `npm run build`. The post is in `dist/blog/` and the feed (`dist/blog/feed.xml`).
- Commit, and deploy as in the README's deploy plan.

## House style

- Say only what is built. Modest tone; plain lists; whole dollars.
- Canadian English: colour, centre, licence (noun), catalogue, grey.
- "Free, source public", never "open source".
- The radio links only through the affiliate link (`{{ site.radio }}`), always marked "(affiliate link)".
