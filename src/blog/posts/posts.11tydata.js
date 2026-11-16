// Every post: the post layout, and an address under /blog/ (blog.ferritefw.dev/<slug>/ once split).
export default {
  layout: "layouts/post.njk",
  // The byline; a post can set its own `author` in its front matter.
  author: "Alex Harvey",
  permalink: "/blog/{{ page.fileSlug }}/",
};
