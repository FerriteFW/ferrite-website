#!/usr/bin/env python3
"""Home's story loops: short, silent, screen-only clips of the radio, from the simulator.

Each chapter is a key script played on the sample radio by ferrite's recorder (ferrite-sim-record, the same one
tools/promo/mkvideo.py uses). Only the 240 x 320 screen is recorded: no captions, keycaps, music or front panel.
Writes src/loops/NAME.mp4 (H.264 960 x 1280, 4x with square pixels, muted, no audio track) and NAME.webp (the first frame, the poster).

    npm run loops            # all chapters
    npm run loops -- scope   # only these

FERRITE_DIR overrides where the ferrite checkout is (default: ../ferrite beside this repo).
Script steps (ferrite/sim/tests/common/mod.rs): home, press KEY, hold KEY, down/up KEY, knob N, type DIGITS,
menu 0 5 3, wait 900ms, event NAME. A chapter's loop is its `script`; its `setup` runs first and isn't recorded.
"""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE = HERE.parent
FERRITE = Path(os.environ.get("FERRITE_DIR", SITE.parent / "ferrite")).resolve()
REC = FERRITE / "target" / "release" / "ferrite-sim-record"
OUT = SITE / "src" / "loops"
FPS_IN = 50  # the recorder steps 20 ms a frame
FPS_OUT = 25
W, H = 240, 320

# Each script ends where it started, so the loop runs on without a jump.
CHAPTERS = {
    "slots": ("home; wait 600ms",
              "wait 1000ms; press SLOT; wait 1300ms; press SLOT; wait 1300ms; press SLOT; wait 1000ms"),
    "scope": ("home; hold 1; wait 3s",
              "wait 900ms; knob 3; wait 1500ms; knob -3; wait 1200ms"),
    "aprs": ("home; menu 0 5 3; wait 900ms; knob 1; wait 900ms; home; press SLOT; press SLOT; wait 20s",
             "wait 6s"),
    "crossband": ("home; menu 0 3 5; press HASH; wait 18s",
                  "wait 6s"),
    "lowpower": ("home; menu 0 7 7 2; knob 1; home; wait 2500ms",
                 "wait 900ms; knob 3; wait 1300ms; knob -3; wait 1300ms"),
    "hf": ("home; menu 0 3 4; wait 2700ms; type 9580; press OK; wait 3000ms",
           "wait 900ms; knob 3; wait 1300ms; knob -3; wait 1300ms"),
}


def run(*args, **kw):
    subprocess.run(args, check=True, **kw)


def main():
    only = sys.argv[1:]
    if not REC.exists():
        print("building the recorder (ferrite-sim-record)…")
        run("cargo", "build", "-q", "--release", "-p", "ferrite-sim", "--bin", "ferrite-sim-record", cwd=FERRITE)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (setup, script) in CHAPTERS.items():
        if only and name not in only:
            continue
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            (tmp / "setup").write_text(setup.replace("; ", "\n") + "\n")
            (tmp / "script").write_text(script.replace("; ", "\n") + "\n")
            run(str(REC), str(tmp / "frames"), str(tmp / "setup"), str(tmp / "script"), cwd=FERRITE,
                stdout=subprocess.DEVNULL)
            raw = tmp / "frames" / "00.rgb"
            mp4, webp = OUT / f"{name}.mp4", OUT / f"{name}.webp"
            src = ["-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-framerate", str(FPS_IN), "-i", str(raw)]
            scale = f"scale={W * 4}:{H * 4}:flags=neighbor"  # 4x: the page shrinks it a little rather than stretching it
            run("ffmpeg", "-v", "error", "-y", *src, "-vf", f"fps={FPS_OUT},{scale},format=yuv420p", "-an",
                "-c:v", "libx264", "-preset", "veryslow", "-tune", "animation", "-crf", "18",
                "-movflags", "+faststart", str(mp4))
            png = tmp / "poster.png"
            run("ffmpeg", "-v", "error", "-y", *src, "-frames:v", "1", "-vf", scale, str(png))
            run("magick", str(png), "-define", "webp:lossless=true", str(webp))
            secs = raw.stat().st_size / (W * H * 3) / FPS_IN
            print(f"{name:10} {secs:4.1f} s  {mp4.stat().st_size // 1024:4} KB mp4  {webp.stat().st_size // 1024:3} KB webp")


if __name__ == "__main__":
    main()
