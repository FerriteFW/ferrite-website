// Copies the web simulator from the ferrite checkout into vendor/sim/ (served at /try/sim/).
// Build it first, in ferrite/: `cargo simweb`.
// FERRITE_DIR overrides where the ferrite checkout is (default: ../ferrite beside this repo).

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ferrite = resolve(process.env.FERRITE_DIR || join(here, "..", "..", "ferrite"));
const files = [
  [join(ferrite, "sim-web", "index.html"), "index.html"],
  [join(ferrite, "target", "wasm32-unknown-unknown", "wasm", "ferrite_sim_web.wasm"), "ferrite_sim_web.wasm"],
];
const out = join(here, "..", "vendor", "sim");
mkdirSync(out, { recursive: true });

for (const [from, name] of files) {
  if (!existsSync(from)) {
    console.error(`missing ${from}\nbuild the simulator first: cd ${ferrite} && cargo simweb`);
    process.exit(1);
  }
  copyFileSync(from, join(out, name));
  console.log(`${name}  ${Math.round(statSync(from).size / 1024)} KB`);
}
