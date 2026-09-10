import type { UnilinearModel } from "./unilinear.js";
import { circle, line, rect, text } from "./svg-primitives.js";

export function renderUnilinearPanel(model: UnilinearModel): string {
  const width = 330;
  const height = 150;
  const cx = width / 2;
  const parts: string[] = [];

  parts.push(rect(10, 10, width - 20, height - 20, "dash"));
  parts.push(text(16, 18, model.boardName, "label"));
  parts.push(text(cx, 18, `${model.supply.system.toUpperCase()} - ${model.supply.voltageV} V`, "small", "middle"));

  let y = 28;
  const main = model.devices.find((device) => device.kind === "main-breaker");
  const differential = model.devices.find((device) => device.kind === "differential");
  const branches = model.devices.filter((device) => device.kind === "branch-breaker");

  parts.push(line(cx, y, cx, y + 10, "med"));
  y += 10;

  if (main) {
    parts.push(rect(cx - 9, y, 18, 10, "med"));
    parts.push(text(cx, y + 4, main.id, "label", "middle"));
    parts.push(text(cx + 13, y + 4, main.rating, "small"));
    y += 16;
  }

  if (differential) {
    parts.push(line(cx, y - 6, cx, y, "med"));
    parts.push(rect(cx - 9, y, 18, 10, "med"));
    parts.push(text(cx, y + 4, differential.id, "label", "middle"));
    parts.push(text(cx + 13, y + 4, differential.rating, "small"));
    y += 19;
  }

  const busY = y;
  const spacing = 72;
  const startX = cx - ((branches.length - 1) * spacing) / 2;
  if (branches.length > 0) {
    parts.push(line(startX, busY, startX + spacing * (branches.length - 1), busY, "med"));
  }

  branches.forEach((branch, index) => {
    const x = startX + index * spacing;
    parts.push(line(x, busY, x, busY + 10, "med"));
    parts.push(rect(x - 8, busY + 10, 16, 9, "med"));
    parts.push(text(x, busY + 14, branch.rating, "small", "middle"));
    parts.push(line(x, busY + 19, x, busY + 45, "med"));
    parts.push(circle(x, busY + 51, 5, "med"));
    parts.push(text(x, busY + 52.3, String(branch.circuitNumber ?? ""), "label", "middle"));
    parts.push(text(x, busY + 64, branch.label, "small", "middle"));
  });

  return parts.join("");
}
