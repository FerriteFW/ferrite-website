// Web versions of the promo videos for Home: H.264 1280x720 (CRF 26), AAC 128k, faststart, plus a JPEG poster.
// Sources: ferrite/target/promo/*.mp4 (render them with ferrite's tools/promo/mkvideo.py first).
//   npm run videos                       all four
//   npm run videos -- aprs               only these
//   POSTER_aprs=12 npm run videos        the poster frame's time in seconds, per video (default below)
// FERRITE_DIR overrides where the ferrite checkout is (default: ../ferrite beside this repo).

import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const promo = join(resolve(process.env.FERRITE_DIR || join(here, "..", "..", "ferrite")), "target", "promo");
const out = join(here, "..", "src", "video");
// site name -> source file, and the poster's time in seconds (a frame with a screen on it, not a title card).
const VIDEOS = {
  tour: { src: "preview.mp4", poster: 8 },
  // start: skip the first seconds. unique.mp4's opening card names another firmware, which the site never does.
  unique: { src: "unique.mp4", poster: 8, start: 4 },
  aprs: { src: "aprs.mp4", poster: 8 },
  lowpower: { src: "lowpower.mp4", poster: 8 },
};

const only = process.argv.slice(2);
mkdirSync(out, { recursive: true });
for (const [name, v] of Object.entries(VIDEOS)) {
  if (only.length && !only.includes(name)) continue;
  const src = join(promo, v.src);
  const mp4 = join(out, name + ".mp4");
  const jpg = join(out, name + ".jpg");
  const at = String(process.env["POSTER_" + name] || v.poster);
  const trim = v.start ? ["-ss", String(v.start)] : [];
  const fadeIn = v.start ? ["-af", "afade=t=in:d=0.5"] : [];
  execFileSync("ffmpeg", ["-v", "error", "-y", ...trim, "-i", src, ...fadeIn,
    "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-profile:v", "high",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", mp4], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", at, "-i", mp4, "-frames:v", "1", "-q:v", "4", jpg], { stdio: "inherit" });
  console.log(`${name}.mp4  ${(statSync(mp4).size / 1e6).toFixed(1)} MB   ${name}.jpg  ${Math.round(statSync(jpg).size / 1024)} KB (at ${at} s)`);
}
