/**
 * Image shot list & coverage report.
 * Usage: node scripts/images.mjs            → prints missing/present images per kind and writes images/SHOT-LIST.md
 * Convention: public/images/<kind>/<slug>.{webp,avif,jpg,jpeg,png}  (+ optional <slug>.json with caption/credit/licence)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const EXT = ["webp", "avif", "jpg", "jpeg", "png"];
const has = (kind, slug) => EXT.some((e) => fs.existsSync(path.join(root, "public", "images", kind, `${slug}.${e}`)));

// Pull slugs from the typed data via a tiny TS eval through vitest-free tsx
const json = execSync(`npx tsx -e "import * as D from './src/data'; console.log(JSON.stringify({ products: D.products.map(p=>({slug:p.slug,name:p.name})), components: D.components.map(c=>({slug:c.slug,name:c.name})), machines: D.machines.map(m=>({slug:m.slug,name:m.name})), processes: D.processes.map(p=>({slug:p.slug,name:p.name})), states: D.states.map(s=>({slug:s.slug,name:s.name})) }))"`, { cwd: root }).toString();
const data = JSON.parse(json.trim().split("\n").pop());

const BRIEF = {
  products: "Premium ingredient/industrial product photography: dark charcoal or warm ivory studio ground, macro texture visible, 3:2, ≥2000 px wide, no packaging branding unless attributed.",
  components: "Anatomical/material macro: the isolated component (husk fibre, shell cross-section, kernel, water, sap, leaf, trunk) on neutral ground; raking light; 3:2 or 1:1.",
  machines: "Equipment in an operating plant or supplier floor; attribute manufacturer/model in <slug>.json; wide shot showing infeed/outfeed; no fabricated 'model' names.",
  processes: "Documentary wide shot of the unit operation in a real plant (dehusking, drying, pressing, kiln, washing…), taken with permission.",
  states: "Landscape/industry documentary: coconut groves, collection yard, processing cluster, port — geotagged in <slug>.json if possible.",
};

let md = `# Image shot list (generated ${new Date().toISOString().slice(0, 10)})\n\nDrop files into \`public/images/<kind>/<slug>.<ext>\`; they appear automatically on the matching page and replace the synthetic visual. Optional \`<slug>.json\`: {"caption","credit","licence"}.\n\n`;
let present = 0, missing = 0;
for (const kind of Object.keys(BRIEF)) {
  md += `## ${kind}\n\n_${BRIEF[kind]}_\n\n| File | Entity | Status |\n|---|---|---|\n`;
  for (const e of data[kind]) {
    const ok = has(kind, e.slug); if (ok) present++; else missing++;
    md += `| \`public/images/${kind}/${e.slug}.webp\` | ${e.name} | ${ok ? "✅ present" : "⬜ missing"} |\n`;
  }
  md += "\n";
}
md += `## pages\n\n| File | Use | Status |\n|---|---|---|\n| \`public/images/pages/coconut-exploded-view.png\` | Homepage anatomy | ${fs.existsSync(path.join(root, "public/images/pages/coconut-exploded-view.png")) ? "✅ present" : "⬜ missing"} |\n\n**${present} present · ${missing} missing.** Never use watermarked or unlicensed images; record licence/credit in the JSON sidecar.\n`;
fs.mkdirSync(path.join(root, "images"), { recursive: true });
fs.writeFileSync(path.join(root, "images", "SHOT-LIST.md"), md);
console.log(md.split("\n").filter((l) => l.startsWith("**") || l.startsWith("## ")).join("\n"));
console.log("Written images/SHOT-LIST.md");
