import type {
  ElectricalFloorPlanModel,
  ElectricalPointKind
} from "./floor-plan.js";
import { circle, line, rect, text } from "./svg-primitives.js";

function pointSymbol(kind: ElectricalPointKind, x: number, y: number): string {
  switch (kind) {
    case "light":
      return [circle(x, y, 3, "thin"), line(x - 2, y - 2, x + 2, y + 2), line(x - 2, y + 2, x + 2, y - 2)].join("");
    case "switch":
      return [circle(x, y, 2, "thin"), line(x, y, x + 4, y - 4)].join("");
    case "outlet":
    case "dedicated-outlet":
      return [rect(x - 3, y - 2, 6, 4, "thin"), line(x, y - 2, x, y + 2)].join("");
    case "junction-box":
      return [rect(x - 2.5, y - 2.5, 5, 5, "thin"), line(x - 2, y - 2, x + 2, y + 2)].join("");
    case "board":
      return [rect(x - 5, y - 4, 10, 8, "med"), text(x, y + 1.2, "TDA", "small", "middle")].join("");
  }
}

export function renderElectricalFloorPlanPanel(
  plan: ElectricalFloorPlanModel
): string {
  const parts: string[] = [];

  parts.push(rect(0, 0, plan.widthMm, plan.heightMm, "med"));

  for (const room of plan.rooms) {
    if (room.points.length < 2) continue;
    room.points.forEach((point, index) => {
      const next = room.points[(index + 1) % room.points.length]!;
      parts.push(line(point.xMm, point.yMm, next.xMm, next.yMm, "med"));
    });
    const avgX =
      room.points.reduce((sum, p) => sum + p.xMm, 0) / room.points.length;
    const avgY =
      room.points.reduce((sum, p) => sum + p.yMm, 0) / room.points.length;
    parts.push(text(avgX, avgY, room.name, "small", "middle"));
  }

  for (const path of plan.paths) {
    for (let i = 0; i < path.points.length - 1; i += 1) {
      const a = path.points[i]!;
      const b = path.points[i + 1]!;
      parts.push(line(a.xMm, a.yMm, b.xMm, b.yMm, "dash"));
    }
  }

  for (const point of plan.points) {
    parts.push(pointSymbol(point.kind, point.xMm, point.yMm));
    if (point.circuitNumber !== undefined) {
      parts.push(text(point.xMm + 4, point.yMm - 3, `C${point.circuitNumber}`, "small"));
    }
    if (point.label) {
      parts.push(text(point.xMm + 4, point.yMm + 5, point.label, "small"));
    }
  }

  return parts.join("");
}
