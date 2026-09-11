import { line, rect, text } from "./svg-primitives.js";

export interface LocationSketchModel {
  status: "verified" | "pending";
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

  if (model.status === "pending") {
    parts.push(
      text(w / 2, 42, "POR COMPLETAR", "label", "middle"),
      text(
        w / 2,
        51,
        "SIN DATOS DE UBICACIÓN VERIFICADOS",
        "small",
        "middle"
      ),
      text(
        w / 2,
        61,
        "No se representan calles ni predio sin evidencia.",
        "small",
        "middle"
      )
    );
    return parts.join("");
  }

  const hasBoundaryData =
    model.northStreet ||
    model.southStreet ||
    model.eastStreet ||
    model.westStreet;

  if (!hasBoundaryData) {
    parts.push(
      text(w / 2, 43, "UBICACIÓN VERIFICADA", "label", "middle"),
      text(
        w / 2,
        53,
        "Croquis vial específico aún no incorporado.",
        "small",
        "middle"
      )
    );
    return parts.join("");
  }

  if (model.northStreet) {
    parts.push(text(w / 2, 15, model.northStreet, "small", "middle"));
  }
  if (model.southStreet) {
    parts.push(text(w / 2, h - 10, model.southStreet, "small", "middle"));
  }
  if (model.westStreet) {
    parts.push(text(12, h / 2, model.westStreet, "small"));
  }
  if (model.eastStreet) {
    parts.push(text(w - 12, h / 2, model.eastStreet, "small", "end"));
  }

  parts.push(rect(35, 28, 80, 40, "thin"));
  parts.push(rect(61, 38, 28, 20, "med"));
  parts.push(
    text(75, 50, model.propertyLabel ?? "PREDIO VERIFICADO", "label", "middle")
  );

  parts.push(line(w - 25, 28, w - 25, 18, "med"));
  parts.push(line(w - 25, 18, w - 28, 23, "med"));
  parts.push(line(w - 25, 18, w - 22, 23, "med"));
  parts.push(text(w - 25, 15, "N", "label", "middle"));

  return parts.join("");
}
