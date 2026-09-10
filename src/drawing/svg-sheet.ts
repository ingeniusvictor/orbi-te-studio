import type { DrawingSheet } from "./sheet-model.js";
import { getSheetSizeMm } from "./a-series.js";
import { esc, line, rect, text } from "./svg-primitives.js";

export interface SvgPanel {
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  title?: string;
}

const style = `
<style>
  .thin{fill:none;stroke:#000;stroke-width:.35}
  .med{fill:none;stroke:#000;stroke-width:.60}
  .thick{fill:none;stroke:#000;stroke-width:1.00}
  .dash{fill:none;stroke:#000;stroke-width:.45;stroke-dasharray:3 2}
  .txt{font-family:Arial,Helvetica,sans-serif;font-size:3.2px;fill:#000}
  .small{font-family:Arial,Helvetica,sans-serif;font-size:2.6px;fill:#000}
  .label{font-family:Arial,Helvetica,sans-serif;font-size:3.2px;font-weight:700;fill:#000}
  .title{font-family:Arial,Helvetica,sans-serif;font-size:6px;font-weight:700;fill:#000}
  .sheet-title{font-family:Arial,Helvetica,sans-serif;font-size:8px;font-weight:700;fill:#000}
</style>`;

export function renderSheetSvg(sheet: DrawingSheet, panels: SvgPanel[]): string {
  const size = getSheetSizeMm(sheet.format, sheet.orientation);
  const border = 10;

  const body = panels
    .map((panel) => {
      const titleHeight = panel.title ? 8 : 0;
      const title = panel.title
        ? [
            line(panel.x, panel.y + titleHeight, panel.x + panel.width, panel.y + titleHeight, "med"),
            text(panel.x + panel.width / 2, panel.y + 5.4, panel.title, "label", "middle")
          ].join("")
        : "";

      return [
        rect(panel.x, panel.y, panel.width, panel.height, "med"),
        title,
        `<g transform="translate(${panel.x},${panel.y + titleHeight})">${panel.content}</g>`
      ].join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}mm" height="${size.height}mm" viewBox="0 0 ${size.width} ${size.height}">
${style}
<rect x="0" y="0" width="${size.width}" height="${size.height}" fill="#fff"/>
${rect(border, border, size.width - border * 2, size.height - border * 2, "thick")}
${text(size.width / 2, 22, sheet.title, "sheet-title", "middle")}
${body}
<text x="${size.width - 12}" y="${size.height - 4}" class="small" text-anchor="end">${esc(sheet.id)}</text>
</svg>`;
}
