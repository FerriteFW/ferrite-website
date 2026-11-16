// Try it: Ferrite's simulator (ferrite/sim-web, the same wasm as the reviewers' page) on the site's own page.
// Only the radio's 240 x 320 screen is drawn: the panel the wasm renders is cropped to the screen.
(async () => {
  const $ = (id) => document.getElementById(id);
  const sim = $("sim"), canvas = $("screen"), msg = $("sim-msg");
  const ctx = canvas.getContext("2d");
  const SCALE = 2; // the wasm draws at 2x: a 480 x 640 screen

  let x;
  try {
    const bytes = await (await fetch("/try/ferrite_sim_web.wasm")).arrayBuffer();
    x = (await WebAssembly.instantiate(bytes, {})).instance.exports;
  } catch (e) {
    msg.textContent = "The simulator didn't load. Reload the page to try again.";
    return;
  }

  // The radio's flash (settings, slots, channels) is kept in this browser, in IndexedDB.
  const store = (() => {
    let db = null;
    const open = () => db || (db = new Promise((ok, bad) => {
      const r = indexedDB.open("ferrite-try", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => ok(r.result);
      r.onerror = () => bad(r.error);
    }));
    const tx = async (mode, f) => {
      const d = await open();
      return new Promise((ok, bad) => {
        const t = d.transaction("kv", mode);
        const q = f(t.objectStore("kv"));
        t.oncomplete = () => ok(q && q.result);
        t.onerror = () => bad(t.error);
      });
    };
    return {
      get: (k) => tx("readonly", (s) => s.get(k)).catch(() => undefined),
      put: (k, v) => tx("readwrite", (s) => s.put(v, k)).catch(() => {}),
      del: (k) => tx("readwrite", (s) => s.delete(k)).catch(() => {}),
    };
  })();
  let saved = await store.get("flash");
  const saveFlash = (force) => {
    if (!x.flash_changed() && !force) return;
    saved = new Uint8Array(x.memory.buffer, x.flash_image(), x.flash_len()).slice();
    store.put("flash", saved);
  };
  addEventListener("pagehide", () => { x.flush(); saveFlash(true); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { x.flush(); saveFlash(false); } });

  const start = () => {
    // Call first, then read memory.buffer: a call can grow memory and detach an older view.
    if (saved) {
      const p = x.flash_stage(saved.length);
      new Uint8Array(x.memory.buffer, p, saved.length).set(saved);
    }
    x.init(SCALE, 0);
    x.set_clock(Math.floor(Date.now() / 1000));
  };
  start();
  msg.hidden = true;
  sim.classList.add("ready");

  // Draw: step the radio, then copy only the screen out of the panel the wasm drew.
  const t0 = performance.now();
  const W = 240 * SCALE, H = 320 * SCALE;
  let last = 0;
  const frame = (t) => {
    requestAnimationFrame(frame);
  setInterval(() => saveFlash(false), 2000);
    if (t - last < 30) return; // about 30 frames a second is plenty for this screen
    last = t;
    const p = x.frame(Math.floor(t - t0));
    const pw = x.width(), ph = x.height(), sx = x.screen_x(), sy = x.screen_y();
    const img = new ImageData(new Uint8ClampedArray(x.memory.buffer, p, pw * ph * 4), pw, ph);
    ctx.putImageData(img, -sx, -sy, sx, sy, W, H);
  };
  requestAnimationFrame(frame);

  // Keys: hold while pressed, so long presses work as on the radio.
  const held = new Map(); // pointerId -> key code
  const release = (id) => {
    if (!held.has(id)) return;
    x.key(held.get(id), 0);
    held.delete(id);
  };
  for (const b of sim.querySelectorAll("[data-key]")) {
    const code = Number(b.dataset.key);
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (_) {}
      release(e.pointerId);
      held.set(e.pointerId, code);
      x.key(code, 1);
      b.classList.add("down");
    });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) {
      b.addEventListener(ev, (e) => { release(e.pointerId); b.classList.remove("down"); });
    }
    b.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  for (const b of sim.querySelectorAll("[data-knob]")) {
    b.addEventListener("click", () => x.knob(Number(b.dataset.knob)));
  }
  $("reset").addEventListener("click", async () => {
    saved = undefined;
    await store.del("flash");
    start();
  });

  // Keyboard, while the simulator has focus (click the screen or a key).
  const KEYS = {
    Digit0: 0, Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 4, Digit5: 5, Digit6: 6, Digit7: 7, Digit8: 8, Digit9: 9,
    Numpad0: 0, Numpad1: 1, Numpad2: 2, Numpad3: 3, Numpad4: 4, Numpad5: 5, Numpad6: 6, Numpad7: 7, Numpad8: 8, Numpad9: 9,
    Comma: 10, Period: 11, Enter: 12, NumpadEnter: 12, KeyS: 13, KeyV: 14, Escape: 15,
    ArrowUp: 16, ArrowDown: 17, ArrowLeft: 18, ArrowRight: 19, KeyQ: 20, KeyW: 21, Space: 22,
  };
  const typed = new Set();
  canvas.addEventListener("pointerdown", () => sim.focus());
  sim.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code === "BracketLeft" || e.code === "BracketRight") {
      e.preventDefault();
      x.knob(e.code === "BracketLeft" ? -1 : 1);
      return;
    }
    if (!(e.code in KEYS)) return;
    e.preventDefault();
    if (!e.repeat) { x.key(KEYS[e.code], 1); typed.add(KEYS[e.code]); }
  });
  sim.addEventListener("keyup", (e) => {
    if (e.code in KEYS) { e.preventDefault(); x.key(KEYS[e.code], 0); typed.delete(KEYS[e.code]); }
  });
  // Focus gone with a key still down: let it go, so it doesn't stay held.
  sim.addEventListener("focusout", () => { for (const k of typed) x.key(k, 0); typed.clear(); });
  let wheel = 0;
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    wheel += e.deltaY;
    while (Math.abs(wheel) >= 40) {
      x.knob(wheel < 0 ? 1 : -1);
      wheel -= Math.sign(wheel) * 40;
    }
  }, { passive: false });
})();
