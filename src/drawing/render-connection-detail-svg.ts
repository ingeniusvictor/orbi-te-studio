import { line, rect, text } from "./svg-primitives.js";

export function renderConnectionDetailPanel(): string {
  const parts: string[] = [];
  const y = 34;

  parts.push(text(15, 18, "Red BT", "label"));
  parts.push(line(20, y, 48, y, "med"));
  parts.push(rect(48, y - 8, 28, 16, "med"));
  parts.push(text(62, y + 1.5, "EMPALME", "small", "middle"));
  parts.push(line(76, y, 104, y, "med"));
  parts.push(rect(104, y - 8, 28, 16, "med"));
  parts.push(text(118, y + 1.5, "MEDIDOR", "small", "middle"));
  parts.push(line(132, y, 164, y, "med"));
  parts.push(text(165, y + 1.5, "AL TDA", "small"));

  parts.push(line(62, y + 8, 62, y + 36, "dash"));
  parts.push(line(118, y + 8, 118, y + 36, "dash"));
  parts.push(text(62, y + 44, "TP", "label", "middle"));
  parts.push(text(118, y + 44, "TS", "label", "middle"));

  for (const x of [62, 118]) {
    parts.push(line(x - 7, y + 38, x + 7, y + 38, "thin"));
    parts.push(line(x - 5, y + 41, x + 5, y + 41, "thin"));
    parts.push(line(x - 3, y + 44, x + 3, y + 44, "thin"));
  }

  return parts.join("");
}
