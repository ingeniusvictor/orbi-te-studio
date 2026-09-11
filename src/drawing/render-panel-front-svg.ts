import type { PanelFrontModel } from "./panel-front.js";
import { line, rect, text } from "./svg-primitives.js";

export function renderPanelFrontPanel(model: PanelFrontModel): string {
  const width = 330;
  const height = 180;
  const left = 18;
  const top = 24;
  const innerWidth = 294;
  const rowHeight = 54;
  const slotWidth = innerWidth / model.totalWays;
  const parts: string[] = [];

  parts.push(rect(8, 8, width - 16, height - 16, "med"));
  parts.push(text(14, 18, model.boardName, "label"));
  parts.push(text(width - 14, 18, `${model.totalWays} WAYS`, "small", "end"));

  parts.push(rect(left, top, innerWidth, rowHeight, "med"));

  model.slots.forEach((slot, index) => {
    const x = left + index * slotWidth;
    if (index > 0) parts.push(line(x, top, x, top + rowHeight));

    if (slot.kind === "blank") {
      parts.push(text(x + slotWidth / 2, top + 29, "RES", "small", "middle"));
      return;
    }

    parts.push(rect(x + 1.6, top + 5, slotWidth - 3.2, rowHeight - 10, "thin"));
    const code =
      slot.kind === "main-breaker"
        ? "AG"
        : slot.kind === "differential"
          ? "ID"
          : slot.circuitNumber !== undefined
            ? `C${slot.circuitNumber}`
            : "?";
    parts.push(text(x + slotWidth / 2, top + 15, code, "label", "middle"));
    parts.push(text(x + slotWidth / 2, top + 24, slot.rating ?? "VERIFY", "small", "middle"));
    parts.push(rect(x + slotWidth * 0.35, top + 31, slotWidth * 0.30, 10, "med"));
  });

  const legendY = top + rowHeight + 12;
  parts.push(text(left, legendY, "IDENTIFICACIÓN", "label"));
  model.legend.slice(0, 6).forEach((item, index) => {
    parts.push(text(left, legendY + 7 + index * 6, item, "small"));
  });

  return parts.join("");
}
