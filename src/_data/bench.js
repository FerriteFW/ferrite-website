// The bench page's lists. Spent: what each line cost in Canadian dollars, shipping and tax included. Wish list:
// estimates in US dollars (list prices).
// group: "radios", "test" or "cables". The totals are worked out below at build time.

const BENCH = [
  { item: "Radtel RT-950 Pro", qty: 2, price: 220, group: "radios",
    does: "The radio Ferrite runs on: one daily radio on the full-power build, one bench radio on the bench build.",
    use: "Everyday use finds most bugs; the bench radio runs the automated tests, keyed from the PC with no RF out." },
  { item: "Radtel BJ-9000", qty: 1, price: 100, group: "radios",
    does: "A sister model of the RT-950 Pro.", use: "Making sure Ferrite installs and runs on it too." },
  { item: "Speaker mic", qty: 1, price: 30, group: "radios",
    does: "The side connector's speaker, mic and PTT.", use: "Audio routing and PTT tests." },
  { item: "RTL-SDR", qty: 1, price: 40, group: "test",
    does: "A software-defined receiver.", use: "Frequency, deviation, tones, DTMF and packets on air, read by the test tools." },
  { item: "Nuand bladeRF x40", qty: 1, price: 720, group: "test",
    does: "A software-defined radio that transmits as well as receives, 300 MHz to 3.8 GHz.",
    use: "Sends known test signals (tones, FSK, GMSK, 4FSK, AFSK) for the radio's receive and data tests." },
  { item: "Dummy load", qty: 1, price: 40, group: "test",
    does: "Takes the transmitter's power without radiating it.", use: "Full-power key-ups." },
  { item: "RF power meter", qty: 1, price: 90, group: "test",
    does: "Measures transmit power.", use: "Checking power levels against stock." },
  { item: "Rigol DHO924S oscilloscope", qty: 1, price: 1200, group: "test",
    does: "A 4-channel 250 MHz scope with a signal generator.", use: "Serial lines and audio paths on the board." },
  { item: "Fluke 289 multimeter", qty: 1, price: 400, group: "test",
    does: "A logging true-RMS multimeter.", use: "Battery readings and current draw over time." },
  { item: "FNIRSI DPS-150P power supply", qty: 1, price: 120, group: "test",
    does: "A small USB-C bench supply.", use: "Powering the radio without a battery." },
  { item: "Rigol DP832 power supply", qty: 1, price: 600, group: "test",
    does: "A 3-channel programmable bench supply.", use: "Battery-level tests and current measurements." },
  { item: "BNC to BNC cable, 2 ft", qty: 2, price: 16, group: "cables",
    does: "Short coax runs.", use: "Radio to dummy load, power meter and SDR." },
  { item: "RF connector and adapter set", qty: 1, price: 36, group: "cables",
    does: "SMA, BNC and other adapters.", use: "Connecting the radio's antenna port to the test gear." },
];

// low/high: the estimate in whole dollars; null when there isn't one yet.
const WISH = [
  { item: "Signal generator", low: null, high: null, why: "A clean, known signal: receiver sensitivity and squelch levels." },
  { item: "Step attenuators", low: null, high: null, why: "Weak-signal tests at known levels." },
  { item: "Rigol RSA804 spectrum analyser", low: 2500, high: 2500, why: "Harmonics and spurious emissions on transmit." },
  { item: "iPad mini (A17 Pro, 128 GB)", low: 499, high: 499, why: "Ferrite Console as an iPad app, over Bluetooth: testing it on a real tablet." },
];

const GROUPS = { radios: "Radios", test: "Test equipment", cables: "Cables and connectors" };

const dollars = (v) => (v == null ? "" : "$" + v.toLocaleString("en-CA", { maximumFractionDigits: 0 }));
const sum = (g) => BENCH.filter((b) => !g || b.group === g).reduce((a, b) => a + (b.price || 0), 0);
const estimate = (w) =>
  w.low == null ? "" : w.high == null || w.high === w.low ? dollars(w.low) : `${dollars(w.low)} to ${dollars(w.high)}`;

export default {
  total: dollars(sum()),
  groups: Object.entries(GROUPS).map(([key, name]) => ({
    key,
    name,
    total: dollars(sum(key)),
    items: BENCH.filter((b) => b.group === key).map((b) => ({ ...b, cost: dollars(b.price) })),
  })),
  items: BENCH,
  wish: WISH.map((w) => ({ ...w, estimate: estimate(w) })),
};
