import fs from "node:fs/promises";
import pngToIco from "png-to-ico";

const [, , pngPath, icoPath] = process.argv;

if (!pngPath || !icoPath) {
  throw new Error("Usage: node png-to-ico.mjs <input-png> <output-ico>");
}

const icoBuffer = await pngToIco(pngPath);
await fs.writeFile(icoPath, icoBuffer);
