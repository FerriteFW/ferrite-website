---
title: "QRM by design: how we torture-test Ferrite"
date: 2026-11-24
summary: "Thousands of tests, a monkey pressing keys at random, an SDR on the bench listening to every key-up, and a build report with every build. Here's how we test Ferrite, and why it lets us ship fast."
---

A handheld radio has a keypad, a knob, two push-to-talk buttons and a power switch. You'd think you could test that
by hand on a Sunday afternoon.

You can't. Ferrite runs two receivers, three slots, scanning, APRS, satellites and a link to the PC, all at once.
The bug that bites is never "press MENU". It's "press MENU while slot B is scanning, an APRS packet lands and the
battery-low warning fires."

Hams call interference QRM: the stuff that gets in the way of the signal you want. This post is about the QRM we
make on purpose, so the radio has seen the worst of it before it gets to you.

## Thousands of tests, every change

Almost all of Ferrite (screens, menus, scanner, decoders, channel store) is plain Rust that doesn't know it's on a
radio, so it runs on a laptop in about 30 seconds. On top of that sit tests for the chip drivers, and a simulator
suite that runs the real UI on a PC, presses keys, turns the knob and reads back the screen.

Every feature in the manual is a numbered rule ("SCAN-6: stopping a scan retunes the slot to where it shows"), and
every rule needs a test that names it or an entry in the radio test plan. A script counts the rules with neither,
and the answer has to be zero. Many tests end with a "golden" screenshot compared pixel for pixel, so a label that
moves two pixels fails until someone looks and approves it.

## The monkey

Normal tests check what we thought of. The monkey checks what we didn't.

It's a long, seeded random session: keys, holds and the knob, PTT at odd moments, squelch opening on random
slots, scans hitting carriers, APRS messages, the battery dropping, the power switch, settings changed from the
terminal. After every step it checks what must always be true: nothing panics, the radio is in the mode the screen
asked for, no text is cut off. Every eighth step it redraws the screen from scratch and compares.

It found five messages clipped in odd states and four screens that left stale pixels behind. One needed broadcast
FM to retune a slot while another slot was transmitting. Nobody finds that by hand. When the monkey trips, it
shrinks hundreds of random steps down to the shortest sequence that still fails, so the fix starts with a short
repro.

Anything that arrives from outside gets fuzzed the same way: APRS packets, AX.25 and FX.25 frames, KISS, and the
link Console and Bluetooth talk over. Console's fuzz tests sent the radio a channel at power level 3 (there are
three, numbered from 0), a zone whose priority channel was past the end of the list, and a GPS position north of
the North Pole. The radio accepted all three. It doesn't any more.

## The SDR on the bench

Tests on a PC can tell you the radio *asked* for 146.520 with a 100.0 Hz tone. They can't tell you what came out of
the antenna. For that, a software-defined radio (SDR: a receiver that's mostly software on a computer) sits on the
bench next to the test radio, listening.

The test radio runs with Dry TX on: the power amplifier held at zero, so a "transmission" only reaches the SDR a
hand's width away. One command, `bench.py`, sets the radio up over the cable, keys it remotely, records, measures,
and puts everything back, even when something fails halfway. It checks:

- **Frequency and deviation** on VHF and UHF, wide and narrow.
- **Every CTCSS tone** (the sub-audible tones repeaters listen for) within 0.2 Hz, and **every DCS code**, normal
  and inverted, never decoded as the other.
- **Refusals:** it tries to key at 43 frequencies on the edges and in the gaps of the band plan. Every one must be
  refused, with the right reason, and nothing on the air.
- **Remote push-to-talk:** stop the keepalives and the carrier must drop within 2.5 seconds.

The bench is paranoid on purpose. Before every key-up it checks the build is a dry one, the frequency is an approved
test frequency and power is low. It rations its own air time: five seconds at most, a rest twice as long, never
more than a quarter of any five minutes. It's a test bench, not a jammer.

Receive gets tested from the other direction. A bladeRF (an SDR that can also transmit) plays signals into the
radio: tones and codes for the squelch, APRS packets with shorter and shorter lead-ins, data streams for bit errors.

My favourite from last week: airband channels in Europe are only 8.33 kHz apart, so we built a narrow AM mode. The
bladeRF sent a wanted station plus a neighbour 8.33 kHz away and 20 dB louder. With the normal AM filter, the
neighbour came out of the speaker 42 dB louder than the station we were tuned to. With the narrow filter, ours was
34 dB on top. That one measurement decided airband's default.

## The build report

Every build comes with a build report, and every release ships with one. It's one page: every suite's results,
the flash and RAM used, how the image size changed since the last merge, the SPI flash map, the signature, and code
coverage.

For the latest release ([here's its build report](https://github.com/FerriteFW/ferrite/releases/tag/v0.9.6), under
the release's files): **2,441 tests passed, 0 failed**, and coverage was **96.0 %**, meaning the tests ran
63,945 of the 66,631 lines that ship on the radio.

I chase that number because the lines nobody runs are where bugs sit quietly. If a line has never run in a test,
the first time it runs might be on your radio. But coverage only says a line *ran*, not that it did the right thing,
so it sits next to the rule count and the goldens, never on its own. The report also says plainly what it can't
measure: the code that only runs on the radio's hardware. That part gets the simulator, the on-radio tests and the
bench.

## Every bug becomes a test

A bug isn't fixed until there's a test that fails without the fix. The monkey's shrunk steps become a named test. A
fuzzer's bad input is saved in a folder that runs first, every time. A bug from the Discord lands with a test that
names the rule it broke. So the suite only grows, and every bug we've fixed is checked again on every change.

That's what lets us move fast. Ferrite shipped eleven releases in under three weeks this month and merged about a
hundred pull requests, some deep in the scanner, the transmit path and the channel store.

I don't manage that by being careful. Careful is slow, and careful still misses things. When I change the scanner,
a few thousand tests tell me within minutes what else I broke. Green tests and a green bench, it ships. Red, it
doesn't, and the computer noticed, not you.

## What it doesn't catch

Plenty. How the audio sounds, real-world RF, whether a menu makes sense to a person: none of that is a unit test.
Some things only show up in a real car on a real repeater, which is why I carry one every day and why reports from
the Discord matter so much.

All of it, the tests, the monkey and the bench scripts included, is in the source on
[GitHub]({{ site.SOURCE_URL }}). If you find something the monkey missed, tell us on the
[Discord]({{ site.discord }}) or [open an issue]({{ site.SOURCE_URL }}/issues). It'll get a rule, a fix and a test.
