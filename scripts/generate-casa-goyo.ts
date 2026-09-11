import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderCasaGoyoRic18A2Svg } from "../src/drawing/casa-goyo-ric18-sheet.js";
import { svgToPdfArtifact } from "../src/export/pdf-export.js";

const outputDir = join(process.cwd(), "artifacts", "TE1-REF-002-casa-goyo");
await mkdir(outputDir, { recursive: true });

const svg = renderCasaGoyoRic18A2Svg();
const svgPath = join(outputDir, "Casa_Goyo_TE1_A2.svg");
await writeFile(svgPath, svg, "utf8");

const pdf = await svgToPdfArtifact(
  "Casa_Goyo_TE1_A2.pdf",
  svg,
  "A2",
  "landscape"
);
const pdfPath = join(outputDir, pdf.filename);
await writeFile(pdfPath, pdf.bytes);

console.log(`Generated: ${svgPath}`);
console.log(`Generated: ${pdfPath}`);
