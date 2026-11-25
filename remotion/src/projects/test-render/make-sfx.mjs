// Synthesizes the tiny SFX kit for the test clip (no downloads).
// Usage: node remotion/src/projects/test-render/make-sfx.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RATE = 44100;
const out = join(dirname(fileURLToPath(import.meta.url)), "../../../../projects/test-render/assets/sfx");
mkdirSync(out, { recursive: true });

// Deterministic noise so the files are identical on every run.
let seed = 1337;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;

const write = (name, seconds, fn) => {
  const n = Math.floor(seconds * RATE);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, fn(i / RATE, i / n)));
    buf.writeInt16LE(Math.round(v * 32767 * 0.8), 44 + i * 2);
  }
  writeFileSync(join(out, name), buf);
};

// Whoosh: low-passed noise with a swell envelope.
let lp = 0;
write("whoosh.wav", 0.55, (t, u) => {
  lp += (rand() - lp) * (0.02 + 0.2 * u);
  return lp * Math.sin(Math.PI * u) ** 2 * 1.6;
});
// Thump: sine with a falling pitch.
write("thump.wav", 0.4, (t) => Math.sin(2 * Math.PI * (48 * t + 70 * (1 - Math.exp(-t * 30)) / 30)) * Math.exp(-t * 11));
// Tick: short high blip.
write("tick.wav", 0.09, (t) => Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 70) * 0.6);
