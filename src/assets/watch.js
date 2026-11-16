// Watch: one video plays at a time, the one at least half in view whose centre is nearest the window's centre;
// the rest pause. Re-picked on scroll and resize (once a frame at most). Nothing is fetched until a video first
// plays (preload="none"). A tap pauses or plays a video; one the visitor paused stays paused until tapped again,
// and another in view may play meanwhile. With reduced motion nothing plays by itself: a play button waits.
// Without JavaScript: plain <video controls>.
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clips = [...document.querySelectorAll(".clip-media")].map((box) => {
  const v = box.querySelector("video"), btn = box.querySelector(".clip-play");
  const clip = { box, v, held: still }; // held: paused by the visitor (or by reduced motion)
  v.controls = false;
  v.muted = true;
  const mark = () => { btn.hidden = !v.paused; };
  v.addEventListener("play", mark);
  v.addEventListener("pause", mark);
  mark();
  box.addEventListener("click", () => {
    if (v.paused) {
      clip.held = false;
      for (const c of clips) if (c !== clip) c.v.pause();
      v.play().catch(() => {});
    } else {
      clip.held = true;
      v.pause();
      pick();
    }
  });
  return clip;
});

function pick() {
  const mid = innerHeight / 2;
  let best = null, bestDist = Infinity;
  for (const c of clips) {
    const r = c.box.getBoundingClientRect();
    const shown = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    if (c.held || shown < r.height / 2) continue;
    const dist = Math.abs(r.top + r.height / 2 - mid);
    if (dist < bestDist) { best = c; bestDist = dist; }
  }
  for (const c of clips) {
    if (c === best) { if (c.v.paused) c.v.play().catch(() => {}); }
    else if (!c.v.paused) c.v.pause();
  }
}
let queued = false;
const soon = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; pick(); }); } };
addEventListener("scroll", soon, { passive: true });
addEventListener("resize", soon);
soon();
