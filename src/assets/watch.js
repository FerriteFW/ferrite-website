// Watch: each video plays while at least half of it is in view, and pauses when it leaves. Nothing is fetched
// until a video first plays (preload="none"). A click or tap pauses or plays it. With reduced motion nothing
// plays by itself: a play button waits. Without JavaScript: plain <video controls>.
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clips = [...document.querySelectorAll(".clip-media")].map((box) => {
  const v = box.querySelector("video"), btn = box.querySelector(".clip-play");
  const clip = { box, v, btn, held: still }; // held: paused by the viewer (or by reduced motion)
  v.controls = false;
  v.muted = true;
  const mark = () => { box.classList.toggle("paused", v.paused); btn.hidden = !v.paused; };
  v.addEventListener("play", mark);
  v.addEventListener("pause", mark);
  mark();
  box.addEventListener("click", () => {
    if (v.paused) { clip.held = false; v.play().catch(() => {}); }
    else { clip.held = true; v.pause(); }
  });
  return clip;
});
const seen = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const c = clips.find((c) => c.box === e.target);
    if (e.isIntersecting && !c.held) c.v.play().catch(() => {});
    else if (!e.isIntersecting) c.v.pause();
  }
}, { threshold: 0.5 });
for (const c of clips) seen.observe(c.box);
