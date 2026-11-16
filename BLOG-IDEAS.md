# Blog post ideas

Posts we want to write, roughly in no order. A post starts as a `draft: true` file in `src/blog/posts/` (see
`POSTING.md`). Say only what is built and measured; modest tone; no version numbers.

- **Why Ferrite is written in Rust.** Drafted: `src/blog/posts/2026-11-01-why-rust.md`. The launch post.
- **Why we test everything, and why we chase coverage.** Every change runs thousands of host tests, the full
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
