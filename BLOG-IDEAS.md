# Blog post ideas

Posts we want to write, roughly in no order. A post starts as a `draft: true` file in `src/blog/posts/` (see
`POSTING.md`). How posts read: BLOG-STYLE.md.

- **Why Ferrite is Rust(ing).** Drafted: `src/blog/posts/2026-11-01-why-rust.md`. The launch post.
- **Why we test everything, and why we chase coverage.** The Rust post points ahead to this one. The numbers:
  3,924 host tests and about 97 % line coverage of the radio's code (build report, Oct 29), the 171-test simulator
  UI suite, the on-radio suites and the SDR transmit bench. Every change runs thousands of host tests, the full
  simulator UI suite and lints in CI, and the build report shows line coverage of the code that ships on the radio
  (97 % and up). Why: a radio can't be patched in the field easily, the bench round trip is slow, and transmit is
  safety-relevant; what coverage doesn't tell you (on-radio and RF tests, the hand checks). Sources: the build
  report (`ferrite/tools/buildreport.py`), `.forgejo/workflows/release.yml`, `docs/test-plan/`.
- **How much the RT-950 Pro's audio path can carry: faster data modes.** What limits the radio's transmit and
  receive bandwidth, what we found on the bench (the filter bypass and equaliser on transmit, the receive route
  that steps around the board's filters) and what that could open up later. Bench results only: careful to say
  nothing here is in a release, and 9600 receive isn't possible today. Sources: `docs/research/data-modes.md`,
  the "RT-950 Pro Audio Limits" write-up.
- **The RT-950 Pro we'd love to see next.** A proposed small-change version of the radio: the same case, chips and
  layout, with the fixes that would help most (the mic reaching the processor, the receive audio path, and the
  rest of the list). Friendly, addressed to Radtel and to owners. Sources: `docs/research/next-gen-radio.md`,
  `docs/research/mic-audio.md`.
- **How we built and tested the APRS decoder.** Our own AFSK modem in about 1.7 KB of RAM on the radio's
  processor: three slicers, soft repair of the least certain bits, FX.25; scored on off-air recordings and the
  WA8LMF test CD against Dire Wolf and published results, every change re-run on the recordings. Top tier, inside
  a radio. Sources: `docs/showcase/aprs-decoder.md`, `ferrite/digimodes/uafsk`.
- **Radio UIs are stuck in the dark ages.** The design thinking: one fixed key layout, menu numbers you learn once
  and type from muscle memory, the most-used things the fewest presses away, the screen always telling you what
  the keys do next. Opinionated on purpose. Sources: `docs/manual/` (KEY, MENU chapters), the user guide's key card.
- **Three slots, two radio chips.** How two BK4829s listen to three things at once: the watch's turns, sharing a
  VHF chip, APRS getting the receive path every other turn, never deaf more than 70 ms. Sources: WATCH rules
  (`docs/manual/`), `ferrite-core/src/watch.rs`, decisions 279 and 295.
- **Installing without bricking.** The stock bootloader is never touched, Console backs up the whole radio first
  with a read-only reader image, calibration is never erased, and going back to stock is built in. Sources:
  decision 264, `docs/manual/03-installing.md`, `30-updating.md`.
- **Transmit safety in the firmware.** Band limits, power levels, timeout, the duty limit, and Dry TX for bench
  work with the PA at zero; transmit power within 4 % of stock on every level. Sources: TX rules,
  `docs/research/tx-power.md`.
- **The case of the deaf microphone.** Why the processor can't hear the mic on a stock RT-950 Pro: the VOX
  envelope detector on PA0, the shared mic line, everything we tried, and the mod that could fix it (parked, not
  done). Pure hardware detective story. Sources: `docs/research/mic-audio.md`, `mod-pa0-mic-audio.md` (no
  third-party photos).
- **Videos that are also tutorials.** The promo videos are recorded from the firmware's own screens by a script of
  key presses, with every key shown as a keycap, so a feature video doubles as a how-to. Sources:
  `ferrite/tools/promo/README.md`.
- **A radio programmer in your browser.** Ferrite Console: Web Serial and Bluetooth, the radio's own code compiled
  to WebAssembly, Live View drawn from the firmware's own drawing code, signed releases checked before install.
  Sources: the ferrite-console repo, decision 291.
- **Homelab CI for a handheld.** Every release built, tested (host, simulator UI, coverage) and signed on a
  Forgejo runner in a VM, in about 12 minutes; what we cut to get there (tests run once, under coverage).
  Sources: `.forgejo/workflows/release.yml`.
- **Drawing a UI through a 0.24 µs-a-byte straw.** Making the screen fast on a slow panel bus and 96 KB of RAM:
  banded drawing, fast flash for the hot paths, profiling on the radio. Sources: CLAUDE.md's size-and-speed
  lessons, `ferrite_ui::prof`, the DISP rules.
- **The Rust diet.** How a Rust firmware stays small enough for the radio: the build flags (core rebuilt at
  opt-level z, LTO, one codegen unit, no panic messages or location strings, panics as one trap instruction,
  identical-code folding), no `core::fmt` (ufmt instead), generics as thin shims over one shared function (the 18 KB
  if-statement), hot code and tables pinned in the 256 KB of fast flash, and a size map diffed on every change to
  shared code (`tools/sizemap.py`, `tools/slowcheck.py`, the build report). Today's tx image: about 712 KB, fast
  flash 115 of 244 KB. Sources: CLAUDE.md "Size and speed", `ferrite/.cargo/config.toml`,
  `docs/research/flash-audit-oct27.md`, `docs/archive/fw-rs-size-comparison.md`.
- **Failing gracefully.** What Ferrite does when something goes wrong: no heap, so no running out of memory mid
  key-up; `unsafe` register code fenced into the HAL and start-up, each block saying why it's sound; a panic compiles
  to one trap instruction, the fault handler puts the radio in a safe state with the transmitter off; the fault's
  address kept for the cable log; the transmit timeout. Sources: `docs/firmware-design.md`, the TX and
  fault rules in `docs/manual/`, `docs/archive/fw-rs-size-comparison.md` (panics).
- **Ferrite by the numbers.** The measured results that were on the Features page (cut Oct 29, Alex: features are
  for the cool features, numbers go in a blog post): resting current 64.7 vs 18.6 mA (107 h), APRS decoding against
  Dire Wolf off the air and on the WA8LMF CD (and the published "Battle of the TNCs" table), transmit power level by
  level against stock. Sources: `docs/showcase/`, `docs/research/tx-power.md`; the cut section is in git
  (`site-v2`, "Features: the measured section cut to three small tables").
