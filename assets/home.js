// Home. Without JavaScript the chapters stack, each with its poster.

// The story: the chapter crossing the middle of the window picks the screen's loop. Only that one plays.
const layers = [...document.querySelectorAll(".story-frame .layer")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
let current = "hero";
const show = (id) => {
  current = id;
  for (const l of layers) {
    const on = l.dataset.ch === id;
    l.classList.toggle("on", on);
    if (l.tagName !== "VIDEO") continue;
    if (on && !still.matches) {
      if (!l.src) l.src = l.dataset.src; // load lazily, on first use
      l.play().catch(() => {});
    } else {
      l.pause();
    }
  }
};
const seen = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) show(e.target.dataset.ch);
}, { rootMargin: "-45% 0px -45% 0px" });
for (const c of document.querySelectorAll(".story-text .chapter")) seen.observe(c);
// Scrolled past the story: nothing plays. Back in it: the current chapter plays again.
const away = new IntersectionObserver(([e]) => {
  if (e.isIntersecting) show(current);
  else for (const l of layers) if (l.tagName === "VIDEO") l.pause();
});
const story = document.querySelector(".story-text");
if (story) away.observe(story);
