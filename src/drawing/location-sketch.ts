import { line, rect, text } from "./svg-primitives.js";

export interface LocationSketchModel {
  northStreet?: string;
  southStreet?: string;
  eastStreet?: string;
  westStreet?: string;
  propertyLabel?: string;
}

export function renderLocationSketchPanel(model: LocationSketchModel): string {
  const w = 150;
  const h = 95;
  const parts: string[] = [];

  parts.push(rect(8, 8, w - 16, h - 16, "med"));
  parts.push(text(w / 2, 15, model.northStreet ?? "CALLE NORTE", "small", "middle"));
  parts.push(text(w / 2, h - 10, model.southStreet ?? "CALLE SUR", "small", "middle"));
  parts.push(text(12, h / 2, model.westStreet ?? "CALLE PONIENTE", "small"));
  parts.push(text(w - 12, h / 2, model.eastStreet ?? "CALLE ORIENTE", "small", "end"));

  parts.push(rect(35, 28, 80, 40, "thin"));
  parts.push(rect(61, 38, 28, 20, "med"));
  parts.push(text(75, 50, model.propertyLabel ?? "PREDIO", "label", "middle"));

  parts.push(line(w - 25, 28, w - 25, 18, "med"));
  parts.push(line(w - 25, 18, w - 28, 23, "med"));
  parts.push(line(w - 25, 18, w - 22, 23, "med"));
  parts.push(text(w - 25, 15, "N", "label", "middle"));

  return parts.join("");
}
