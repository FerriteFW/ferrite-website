// Ferrite Pocket's share codes (pocket/notes/share-codes.md, version 1): reads one from the link's fragment and
// shows its channels, or makes one from a form, with its link and QR code. The bytes: "FS", version 1, record
// layout 3, kind (1 channels, 2 a zone and its channels), then entries (what, length, the record as the radio's
// link gives it: zone 26 bytes, channel 41, position 8); raw DEFLATE; base64url. All in the browser.

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const BASE = "https://ferritefw.dev/s#";
const MODES = ["FM", "NFM", "AM"];
const POWERS = ["Low", "Mid", "High"];

// ---- bytes ----

const pipe = async (bytes, stream) =>
  new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
const b64url = (u8) => btoa(String.fromCharCode(...u8)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
const text = (b) => new TextDecoder().decode(b.slice(0, b.indexOf(0) < 0 ? b.length : b.indexOf(0))).trim();

// CHAN-31: a channel name's characters; any other becomes '-'.
const nameChars = (s) => s.replace(/[^A-Za-z0-9 \-./_#+&()'!]/g, "-");
const field = (s, n) => {
  const out = new Uint8Array(n);
  [...s].slice(0, n).forEach((c, i) => (out[i] = c.charCodeAt(0)));
  return out;
};

// CHAN-3: a tone word: CTCSS in 0.1 Hz (60.0-260.0); DCS "D023N"/"D023I": bit 15, bit 14 inverted, the code in octal.
function toneWord(t) {
  t = t.trim().toUpperCase();
  if (!t || t === "OFF") return 0;
  const d = /^D([0-7]{3})([NI]?)$/.exec(t);
  if (d) return 0x8000 | (d[2] === "I" ? 0x4000 : 0) | parseInt(d[1], 8);
  const v = Math.round(parseFloat(t) * 10);
  if (!(v >= 600 && v <= 2600)) throw new Error(`Tone ${t}: CTCSS 60.0 to 260.0 Hz, or a DCS code like D023N`);
  return v;
}

// The channel record as the radio's link writes it (Ferrite Console's channels.rs, ferrite's channel_save):
// number, zone, RX (10 Hz), name 16, mode, narrow, RX tone, TX tone, offset (10 Hz, signed), power, step, squelch,
// busy, reverse|split, flags, end tone and tail: 41 bytes.
function channelRecord(c, index, zone) {
  const r = new Uint8Array(41);
  const v = new DataView(r.buffer);
  v.setUint16(0, index, true);
  v.setUint16(2, zone, true);
  v.setUint32(4, Math.round(c.mhz * 1e5), true);
  r.set(field(nameChars(c.name), 16), 8);
  r[24] = c.mode;
  r[25] = c.mode === 1 ? 1 : 0; // NFM is narrow (VFO-20)
  v.setUint16(26, c.decode ? c.tone : 0, true);
  v.setUint16(28, c.tone, true);
  v.setInt32(30, Math.round(c.shift * 1e5), true);
  r[34] = c.power;
  r[35] = 6; // a 5 kHz step
  r[36] = 10; // squelch: Global (SQL-6)
  return r;
}

// The zone record as written: name 16, scan all, shown in ◀▶, by distance, resume, dwell, reserved, priority 1 and 2.
function zoneRecord(name) {
  const r = new Uint8Array(26);
  r.set(field(nameChars(name), 16), 0);
  r[17] = 1;
  r.fill(0xff, 22, 26);
  return r;
}

async function encode(zone, chans) {
  const parts = [[70, 83, 1, 3, zone !== null ? 2 : 1]];
  const put = (what, rec) => parts.push([what, rec.length], rec);
  if (zone !== null) put(3, zoneRecord(zone));
  chans.forEach((c, i) => {
    put(2, channelRecord(c, i, zone !== null ? 0 : 0xffff));
    if (c.pos) {
      const p = new Uint8Array(8);
      new DataView(p.buffer).setInt32(0, Math.round(c.pos[0] * 1e7), true);
      new DataView(p.buffer).setInt32(4, Math.round(c.pos[1] * 1e7), true);
      put(7, p);
    }
  });
  const raw = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) raw.set(p, at), (at += p.length);
  return b64url(await pipe(raw, new CompressionStream("deflate-raw")));
}

async function decode(code) {
  const raw = await pipe(unb64url(code), new DecompressionStream("deflate-raw"));
  if (raw[0] !== 70 || raw[1] !== 83) throw new Error("not a share code");
  if (raw[2] !== 1 || raw[3] !== 3) return { newer: true };
  let zone = null;
  const chans = [];
  for (let i = 5; i + 2 <= raw.length; ) {
    const what = raw[i], n = raw[i + 1], rec = raw.slice(i + 2, i + 2 + n);
    i += 2 + n;
    const v = new DataView(rec.buffer);
    if (what === 3 && rec.length >= 16) zone = text(rec.slice(0, 16));
    if (what === 2 && rec.length >= 24) {
      const c = { name: text(rec.slice(8, 24)), mhz: v.getUint32(4, true) / 1e5, pos: null };
      if (rec.length >= 34) {
        c.mode = MODES[rec[24]] ?? "";
        c.tone = v.getUint16(28, true);
        c.shift = v.getInt32(30, true) / 1e5;
        c.power = POWERS[rec[34]] ?? "";
      }
      chans.push(c);
    }
    if (what === 7 && rec.length === 8 && chans.length) chans[chans.length - 1].pos = [v.getInt32(0, true) / 1e7, v.getInt32(4, true) / 1e7];
  }
  return { zone, chans };
}

const toneText = (w) =>
  !w ? "" : w & 0x8000 ? `D${(w & 0x1ff).toString(8).padStart(3, "0")}${w & 0x4000 ? "I" : "N"}` : (w / 10).toFixed(1);
const shiftText = (s) => (!s ? "" : `${s > 0 ? "+" : "−"}${Math.abs(s).toFixed(3)}`);

// ---- the code in the link: show it ----

async function view(code) {
  const d = await decode(code);
  $("view").hidden = false;
  $("make").querySelector(".kicker").innerHTML = "<span>01</span>Make your own";
  $("view-open").href = "ferrite://share#" + code;
  if (d.newer) {
    $("view-note").textContent = "Made by a newer Ferrite: open it in an up-to-date Ferrite Pocket.";
    return;
  }
  $("share-title").textContent = d.zone ?? (d.chans.length === 1 ? d.chans[0].name || "A channel" : `${d.chans.length} channels`);
  $("share-lead").innerHTML = "Shared from a Ferrite radio. Open it in <b>Ferrite Pocket</b> to add these to your radio, at free channel numbers: nothing you have changes.";
  $("view-what").textContent = d.zone !== null ? `A zone of ${d.chans.length} channel${d.chans.length === 1 ? "" : "s"}` : `${d.chans.length} channel${d.chans.length === 1 ? "" : "s"}`;
  $("view-table").innerHTML = `<tr><th>Name</th><th class="n">MHz</th><th>Mode</th><th>Tone</th><th>Shift</th><th>Site</th></tr>` +
    d.chans.map((c) => `<tr><td>${esc(c.name || "(no name)")}</td><td class="n">${c.mhz.toFixed(5)}</td><td>${esc(c.mode ?? "")}</td>` +
      `<td>${toneText(c.tone)}</td><td>${shiftText(c.shift)}</td><td>${c.pos ? `<a href="https://maps.apple.com/?ll=${c.pos[0].toFixed(5)},${c.pos[1].toFixed(5)}&q=${encodeURIComponent(c.name)}">map</a>` : ""}</td></tr>`).join("");
}

// ---- the form: make one ----

let rowCount = 0;
function addRow(v = {}) {
  const i = rowCount++;
  const row = document.createElement("fieldset");
  row.className = "share-row";
  row.innerHTML = `
    <label>Name <input name="name" maxlength="16" placeholder="Simplex" value="${esc(v.name ?? "")}"></label>
    <label>MHz <input name="mhz" inputmode="decimal" placeholder="146.52000" value="${esc(v.mhz ?? "")}"></label>
    <label>Mode <select name="mode">${MODES.map((m, k) => `<option value="${k}"${k === (v.mode ?? 0) ? " selected" : ""}>${m}</option>`).join("")}</select></label>
    <label>Tone <input name="tone" placeholder="off, 88.5 or D023N" value="${esc(v.tone ?? "")}"></label>
    <label class="check"><input type="checkbox" name="decode"> decode it too</label>
    <label>Shift MHz <input name="shift" inputmode="decimal" placeholder="0, +0.6 or -5" value="${esc(v.shift ?? "")}"></label>
    <label>Power <select name="power">${POWERS.map((p, k) => `<option value="${k}"${k === (v.power ?? 2) ? " selected" : ""}>${p}</option>`).join("")}</select></label>
    <label>Site <small>(optional)</small> <input name="pos" placeholder="lat, lon" value="${esc(v.pos ?? "")}"></label>
    ${i > 0 ? `<button type="button" class="btn share-remove">Remove</button>` : ""}`;
  row.querySelector(".share-remove")?.addEventListener("click", () => (row.remove(), update()));
  $("make-rows").append(row);
}

function readForm() {
  const rows = [...document.querySelectorAll(".share-row")];
  const chans = [];
  rows.forEach((row, k) => {
    const g = (n) => row.querySelector(`[name=${n}]`);
    const mhzText = g("mhz").value.trim().replace(",", ".");
    if (!mhzText) return;
    const mhz = parseFloat(mhzText);
    if (!(mhz > 18 && mhz < 1000)) throw new Error(`Channel ${k + 1}: ${mhzText} isn't a frequency in MHz`);
    const shift = parseFloat(g("shift").value.replace(",", ".").replace("−", "-")) || 0;
    let pos = null;
    const p = g("pos").value.trim();
    if (p) {
      const m = /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(p);
      if (!m || Math.abs(+m[1]) > 90 || Math.abs(+m[2]) > 180) throw new Error(`Channel ${k + 1}: the site is latitude, longitude (49.28, -123.12)`);
      pos = [+m[1], +m[2]];
    }
    chans.push({
      name: g("name").value.trim() || `${mhz.toFixed(3)}`,
      mhz, mode: +g("mode").value, tone: toneWord(g("tone").value), decode: g("decode").checked, shift,
      power: +g("power").value, pos,
    });
  });
  const zoneName = $("make-form").zone.value.trim();
  return { chans, zone: chans.length > 1 ? zoneName || "Shared" : null };
}

function qrSvg(link) {
  const q = qrcode(0, "M"); // the smallest version that holds it, error correction M
  q.addData(link, "Byte");
  q.make();
  const n = q.getModuleCount(), m = 4;
  let path = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) path += `M${c + m} ${r + m}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}

let last = "";
async function update() {
  $("make-error").textContent = "";
  let f;
  try {
    f = readForm();
  } catch (e) {
    $("make-error").textContent = e.message;
    $("make-out").hidden = true;
    return;
  }
  if (!f.chans.length) {
    $("make-out").hidden = true;
    return;
  }
  const link = BASE + (await encode(f.zone, f.chans));
  if (link === last) return;
  last = link;
  const svg = qrSvg(link);
  $("make-qr").innerHTML = svg;
  $("make-link").value = link;
  $("make-svg").href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(img, 0, 0, 1024, 1024);
    $("make-png").href = c.toDataURL("image/png");
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const what = f.zone !== null ? `the zone ${f.zone} (${f.chans.length} channels)` : `the channel ${f.chans[0].name}`;
  $("make-size").textContent = `${what}: a ${link.length}-character link.${link.length > 2200 ? " That's a dense QR code: print it large, or share the link." : ""}`;
  $("make-out").hidden = false;
}

addRow();
$("make-add").addEventListener("click", () => (addRow(), update()));
$("make-form").addEventListener("input", update);
$("make-copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("make-link").value);
  $("make-copy").textContent = "Copied";
  setTimeout(() => ($("make-copy").textContent = "Copy the link"), 1500);
});

function fromHash() {
  const code = location.hash.slice(1);
  if (code) view(code).catch(() => { $("view").hidden = false; $("view-note").textContent = "This share code didn't read: ask for the whole link again."; });
}
fromHash();
addEventListener("hashchange", fromHash); // a second link opened in the same tab
