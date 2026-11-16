// Watch: nothing plays by itself. Each video shows its poster and a play button; a tap starts it with the
// browser's own controls, and starting one pauses the others. When a video ends, its play button comes back.
// Nothing is fetched until a video is started (preload="none"). Without JavaScript: plain <video controls>.
const vids = [];
for (const box of document.querySelectorAll(".clip-media")) {
  const v = box.querySelector("video"), btn = box.querySelector(".clip-play");
  vids.push(v);
  v.controls = false;
  btn.hidden = false;
  btn.addEventListener("click", () => {
    btn.hidden = true;
    v.controls = true;
    v.play().catch(() => {});
  });
  v.addEventListener("play", () => {
    btn.hidden = true;
    for (const o of vids) if (o !== v && !o.paused) o.pause();
  });
  v.addEventListener("ended", () => {
    v.controls = false;
    btn.hidden = false;
  });
}
