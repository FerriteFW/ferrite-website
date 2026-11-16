# Blog post ideas

Posts we want to write, roughly in no order. A post starts as a `draft: true` file in `src/blog/posts/` (see
`POSTING.md`). How posts read: BLOG-STYLE.md.

- **Why Ferrite is written in Rust.** Drafted: `src/blog/posts/2026-11-01-why-rust.md`. The launch post.
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
- **Dynamic clocking: 24 MHz until something needs it.** How the governor drops the core from 120 to 24 MHz at
  rest and back up only while there's work, what it took (the watch's hops stay at 24 MHz, the clock tree, what
  has to stay fast), and the bench numbers: 18.6 mA against 64.7 mA at rest, about 107 hours on the stock pack,
  measured with the supply's own charge tally. Sources: `docs/showcase/dynamic-clocking.md`,
  `docs/manual/33-power-battery.md` (PWR-26), decisions 250-253.
- **How we built and tested the APRS decoder.** Our own AFSK modem in about 1.7 KB of RAM on the radio's
  processor: three slicers, soft repair of the least certain bits, FX.25; scored on off-air recordings and the
  WA8LMF test CD against Dire Wolf and published results, every change re-run on the recordings. Top tier, inside
  a radio. Sources: `docs/showcase/aprs-decoder.md`, `ferrite/digimodes/uafsk`.
