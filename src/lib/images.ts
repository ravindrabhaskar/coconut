import fs from "node:fs";
import path from "node:path";

/**
 * Real-image resolver (server-side).
 * Convention: public/images/<kind>/<slug>.{webp,avif,jpg,jpeg,png}
 *   kind = products | components | machines | processes | states | pages
 * Drop a file with the entity slug as its name and it replaces the synthetic visual on that page — no code change.
 * Optional caption/credit: public/images/<kind>/<slug>.json  { "caption": "...", "credit": "...", "licence": "..." }
 */
export type ImageKind = "products" | "components" | "machines" | "processes" | "states" | "pages";
const EXT = ["webp", "avif", "jpg", "jpeg", "png"];

export interface ResolvedImage { src: string; width: number; height: number; caption?: string; credit?: string; licence?: string }

function pngSize(buf: Buffer): [number, number] | null {
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  return null;
}
function jpgSize(buf: Buffer): [number, number] | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
function webpSize(buf: Buffer): [number, number] | null {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (chunk === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8L") { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
  return null;
}

const cache = new Map<string, ResolvedImage | null>();

export function resolveImage(kind: ImageKind, slug: string): ResolvedImage | null {
  const key = `${kind}/${slug}`;
  if (cache.has(key)) return cache.get(key)!;
  const dir = path.join(process.cwd(), "public", "images", kind);
  let out: ResolvedImage | null = null;
  for (const ext of EXT) {
    const file = path.join(dir, `${slug}.${ext}`);
    if (!fs.existsSync(file)) continue;
    const buf = fs.readFileSync(file);
    const size = pngSize(buf) ?? jpgSize(buf) ?? webpSize(buf) ?? [1600, 1200];
    let meta: Partial<ResolvedImage> = {};
    const metaFile = path.join(dir, `${slug}.json`);
    if (fs.existsSync(metaFile)) { try { meta = JSON.parse(fs.readFileSync(metaFile, "utf8")); } catch {} }
    out = { src: `/images/${kind}/${slug}.${ext}`, width: size[0], height: size[1], ...meta };
    break;
  }
  cache.set(key, out);
  return out;
}

export function listImages(kind: ImageKind): string[] {
  const dir = path.join(process.cwd(), "public", "images", kind);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => EXT.some((e) => f.endsWith(`.${e}`))).map((f) => f.replace(/\.[a-z]+$/, ""));
}
