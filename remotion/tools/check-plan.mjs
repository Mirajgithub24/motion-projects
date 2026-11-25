// Verifies every cue target in plan.ts resolves to a layer of its design.
//   npx tsx tools/check-plan.mjs   (or: node --experimental-strip-types)
import { readFileSync } from "node:fs";
const planSrc = readFileSync(new URL("../src/projects/percel-video/plan.ts", import.meta.url), "utf8");
const designs = {};
const load = (id) => (designs[id] ??= JSON.parse(readFileSync(new URL(`../src/projects/percel-video/designs/${id}.json`, import.meta.url), "utf8")));
let bad = 0, n = 0;
const shotRe = /design: "(\w+)"[\s\S]*?(?=\n  \{ design:|\n  \{\n    design:|\n\];)/g;
for (const m of planSrc.matchAll(shotRe)) {
  const id = m[1];
  const d = load(id);
  for (const t of m[0].matchAll(/target: "([^"]+)"/g)) {
    n++;
    const target = t[1];
    const hit = target.startsWith("text:")
      ? d.layers.filter((x) => x.text && x.text.includes(target.slice(5)))
      : d.layers.filter((x) => x.id === target);
    if (!hit.length) { bad++; console.log(`MISSING ${id}: ${target}`); }
  }
}
console.log(`${n} cue targets checked, ${bad} missing`);
process.exit(bad ? 1 : 0);
