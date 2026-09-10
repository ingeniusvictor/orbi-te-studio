import type { TitleBlock } from "./sheet-model.js";
import { rect, text } from "./svg-primitives.js";
import { renderLocationSketchPanel } from "./location-sketch.js";
import { renderRic18TitleBlock } from "./render-ric18-title-block.js";

export function renderRic18Footer(
  titleBlock: TitleBlock,
  croquisLabel = "PREDIO"
): string {
  const parts: string[] = [];

  parts.push(rect(0, 0, 300, 80, "med"));

  parts.push(rect(0, 0, 80, 80, "med"));
  parts.push(text(40, 6, "CROQUIS DE UBICACIÓN", "label", "middle"));
  parts.push(`<g transform="translate(0,8) scale(0.52)">${renderLocationSketchPanel({
    propertyLabel: croquisLabel
  })}</g>`);

  parts.push(rect(80, 0, 110, 80, "med"));
  parts.push(text(135, 8, "TIMBRE DE INSCRIPCIÓN", "label", "middle"));

  parts.push(`<g transform="translate(190,0)">${renderRic18TitleBlock(titleBlock)}</g>`);

  return parts.join("");
}
