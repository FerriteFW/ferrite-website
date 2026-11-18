---
title: "Because mAh count"
date: 2026-11-17
summary: "At rest, stock draws about 130 mA. Ferrite draws 18.6. Here's where the other 111 went."
---

A handheld spends most of its life waiting: squelch closed, nobody talking. Sitting idle like that, the RT-950 Pro on
stock firmware draws about 130 mA. On Ferrite it draws 18.6 mA. Same radio, same battery, about 15 hours against 107.

No single trick does that. It's a lot of small ones, and one big one I haven't seen in radio firmware before.

## The big one: 24 MHz until something needs it

Your phone changes its processor speed all the time. Handheld radios don't: stock sets the radio's AT32F403A (an ARM
Cortex-M4) to 120 MHz at power-on and leaves it there, decoding a packet or sitting on a dead channel at 3 a.m.

Ferrite runs it at 24 MHz at rest and goes to 120 MHz only while something asks: a key or the knob, a scan or the band
scope, transmit, a decoder hearing a signal, a live link to Ferrite Console, audio playing. A second after the last
request, it drops back. The rule for anything we weren't sure about was "if unsure, high". A slow menu is annoying; a
missed packet is a bug.

The hard part is everything hanging off the clock. Serial rates, GPS, the backlight timers and the system clock all
divide down from it, so every driver asks for the current speed, and the clock is corrected across each switch so it
never drifts. That one change took the resting current from 64.7 mA to 18.6, about 71 % off.

## The small ones

The other 65 mA came from going through the board one part at a time and asking "does this need to be on?"

- **The keypad light dims.** Stock's is on or off at full brightness. Ferrite drives it with PWM (switching it on and
  off 25,000 times a second, faster than you can see) at half the screen's brightness, and turns it off with the
  screen unless you ask otherwise.
- **The screen controller sleeps** when the backlight goes dark: about 7 mA on its own.
- **GPS is really off when it's off.** The module's power was cut, but one of the processor's pins still sat high and
  fed it through its receive line. That pin now goes quiet too.
- **Unused parts are unclocked:** serial ports, the audio timers, the broadcast receiver chip (held in reset), the
  processor's own temperature sensor (powered only for its reading every 10 seconds).
- **No input pin floats.** A floating pin wanders and burns current; every one is pulled or parked.
- **The keys and knob are read less often** while the screen is dark, and the screen redraws live meters at most
  four times a second at rest.
- **Battery Save** naps the receive chips between checks for a signal, as stock does.

None of these is dramatic alone. Together they halved stock's figure before the clock change.

## The numbers

Ferrite on my black test radio, with the bench supply (a FNIRSI DPS-150P at 7.6 V) counting the charge itself over
15 minutes a run: squelch closed on a quiet channel, screen dark, GPS and Bluetooth off.

| Firmware | At rest | On a 2000 mAh pack |
| --- | --- | --- |
| Stock | about 130 mA | about 15 h |
| Ferrite, clock fixed at 120 MHz | 64.7 mA | 31 h |
| Ferrite, 24 MHz until needed | 18.6 mA | 107 h |

That's the best case. A lit screen, keys and scanning cost what they cost, so real use sits above it, and we haven't
measured typical use yet. It's all on by default; MENU 0 9 9 4 (MCU clock) pins full speed if you'd rather.

Ferrite is free, with its source public. [Get it here]({{ "/download/" | wwwUrl }}), and if your battery lasts longer
than you expected, tell us on the [Discord](https://discord.gg/fYygBVD2Kx).
