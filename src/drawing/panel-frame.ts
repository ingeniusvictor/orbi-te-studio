import { rect, text } from "./svg-primitives.js";

export function renderPanelFrame(
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  body: string,
  options?: {
    scale?: number;
    offsetX?: number;
    offsetY?: number;
  }
): string {
  const scale = options?.scale ?? 1;
  const offsetX = options?.offsetX ?? 4;
  const offsetY = options?.offsetY ?? 11;

  return [
    rect(x, y, width, height, "med"),
    text(x + width / 2, y + 6, title, "label", "middle"),
    `<g transform="translate(${x + offsetX},${y + offsetY}) scale(${scale})">${body}</g>`
  ].join("");
}
