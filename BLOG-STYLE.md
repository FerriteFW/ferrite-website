# Blog style

How Ferrite's blog posts read, so a draft comes out right the first time. Posts are written as Alex and carry his byline (`author` defaults to Alex Harvey).

## Voice

- **First person.** "I" for Alex's own calls, stories and opinions ("I wanted the compiler to catch it before I did");
  "we" for the project and the people working on it.
- **Talk like a ham at the bench.** Plain, direct sentences, the way you'd explain it on a net or at a club meeting.
  Say what broke, what we tried, what worked, and what it measured.
- **Opinions said outright.** "Most radio UIs are stuck in the dark ages" is fine; hedging every line isn't.
- **Some energy, earned.** Enthusiasm where the result deserves it, a bit of humour, never marketing hype or
  superlatives we can't back up.
- **Honest about trade-offs.** What it cost, what isn't done yet, what we got wrong first.
- **A bit of Hackaday.** Write it like a good Hackaday post: a wry hook, real technical meat (the part numbers,
  registers, flags, measurements, the war story of what went sideways), parenthetical asides, a little
  self-deprecation, and the fun of making a thing do more than it shipped with. Nerdy is good; explain just enough
  that a newer ham can follow.
- **Short.** Short paragraphs (two to four sentences), a heading every few paragraphs, 600 to 1,200 words. Cut any
  sentence that doesn't add something.

## Rules

- **Only what's built.** Bench experiments are called bench work, never features. No promises or dates.
- **Numbers need a source** (a measurement in `docs/`, the build report, the showcase), and say what was measured
  ("at rest, listening on a quiet channel"), not just the best figure.
- **No version numbers**; "coming soon" until there's a release.
- **Transmit is a core feature**; never call Ferrite receive-only or receive-first.
- **Licence wording:** "free, with its source public", never "open source".
- **Never mention or compare with other firmware** (nicFW included); stock is fine, fairly.
- **The radio links to its plain product page** (`site.radio`); the affiliate link is only on the Bench & support page.
- **Canadian English:** colour, centre, metre, licence (noun), catalogue, grey; -ize, program, analog stay.
- **No third-party photos or recordings.** Screens come from the simulator.
- **Explain the radio terms** a newer ham might not know, in a few words, the first time.

## Shape

1. A hook in the first two lines: the problem or the surprise.
2. The story: why it mattered, what we did, what it measured.
3. What it costs or what's still open.
4. A short close: where to go next (Features, Download, GitHub, the Discord).

Drafts are reviewed as a private artifact page with comments; the Markdown in `src/blog/posts/` is the source.
