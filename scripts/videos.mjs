// Web versions of the promo videos for /watch/: H.264 1280x720 (CRF 26), no audio, faststart, plus a JPEG poster.
// Sources: ferrite/target/promo/*.mp4 (render them with ferrite's tools/promo/mkvideo.py first).
//   npm run videos                       all four
//   npm run videos -- aprs               only these
//   npm run videos -- --posters          only the posters, from the source videos (no re-encode)
//   POSTER_aprs=12 npm run videos        the poster frame's time in seconds, per video (default below)
// A poster is the radio's screen alone, cut from that frame of the source (no caption text), centred on a dark
// 16:9 background.
// FERRITE_DIR overrides where the ferrite checkout is (default: ../ferrite beside this repo).

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const promo = join(resolve(process.env.FERRITE_DIR || join(here, "..", "..", "ferrite")), "target", "promo");
const out = join(here, "..", "src", "video");
// site name -> source file, and the poster's time in seconds (a frame with a screen on it, not a title card).
const VIDEOS = {
  tour: { src: "preview.mp4", poster: 19 }, // the band scope
  unique: { src: "unique.mp4", poster: 14 }, // APRS that isn't missed
  aprs: { src: "aprs.mp4", poster: 24 }, // the APRS card
  lowpower: { src: "lowpower.mp4", poster: 29 }, // Low Power Mode's screen
};
// Where mkvideo.py puts the 480 x 640 screen in its 1920 x 1080 frame (by layout), and its bezel.
const SCREEN_X = [330, 720, 1110], SCREEN_Y = 190, BEZEL = 36;

function poster(src, at, jpg) {
  const tmp = mkdtempSync(join(tmpdir(), "poster-"));
  const png = join(tmp, "f.png");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", at, "-i", src, "-frames:v", "1", png]);
  // The screen is where the frame is busiest among the layouts' three places.
  const sd = (x) => Number(execFileSync("magick", [png, "-crop", `480x640+${x}+${SCREEN_Y}`, "-format", "%[fx:standard_deviation]", "info:"]).toString());
  const x = SCREEN_X.reduce((a, b) => (sd(b) > sd(a) ? b : a));
  execFileSync("magick", ["-size", "1280x720", "radial-gradient:#10141a-#07080a",
    "(", png, "-crop", `${480 + 2 * BEZEL}x${640 + 2 * BEZEL}+${x - BEZEL}+${SCREEN_Y - BEZEL}`, "+repage", "-resize", "x640", ")",
    "-gravity", "center", "-composite", "-quality", "88", jpg]);
  rmSync(tmp, { recursive: true, force: true });
}

const args = process.argv.slice(2);
const postersOnly = args.includes("--posters");
const only = args.filter((a) => a !== "--posters");
mkdirSync(out, { recursive: true });
for (const [name, v] of Object.entries(VIDEOS)) {
  if (only.length && !only.includes(name)) continue;
  const src = join(promo, v.src);
  const mp4 = join(out, name + ".mp4");
  const jpg = join(out, name + ".jpg");
  const at = String(process.env["POSTER_" + name] || v.poster);
  const trim = v.start ? ["-ss", String(v.start)] : [];
  if (!postersOnly) execFileSync("ffmpeg", ["-v", "error", "-y", ...trim, "-i", src, "-map", "0:v:0", "-map_chapters", "-1", "-map_metadata", "-1", "-an",
    "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-profile:v", "high",
    "-movflags", "+faststart", mp4], { stdio: "inherit" });
  poster(src, at, jpg);
  console.log(`${name}.mp4  ${(statSync(mp4).size / 1e6).toFixed(1)} MB   ${name}.jpg  ${Math.round(statSync(jpg).size / 1024)} KB (at ${at} s)`);
}
