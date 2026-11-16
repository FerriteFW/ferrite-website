// A video tile plays in place. Without JavaScript, the tile is a link to the .mp4.
for (const tile of document.querySelectorAll(".tile[data-video]")) {
  tile.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const v = document.createElement("video");
    v.src = tile.dataset.video;
    v.poster = tile.querySelector("img").src;
    v.controls = true;
    v.playsInline = true;
    v.preload = "none";
    v.className = "tile-video";
    const box = document.createElement("div");
    box.className = "tile";
    box.append(v, tile.querySelector(".tile-title"));
    tile.replaceWith(box);
    v.play().catch(() => {});
  });
}
