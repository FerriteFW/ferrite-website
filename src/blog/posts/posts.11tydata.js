// Every post: the post layout, and an address under /blog/ (blog.ferritefw.dev/<slug>/ once split).
export default {
  layout: "layouts/post.njk",
  permalink: "/blog/{{ page.fileSlug }}/",
};
