import { line, rect, text } from "./svg-primitives.js";

export interface ConnectionDetailModel {
  status: "verified" | "pending";
  supplyLabel?: string;
  hasMeter?: boolean;
  hasProtectiveEarth?: boolean;
  hasServiceEarth?: boolean;
}

export function renderConnectionDetailPanel(
  model: ConnectionDetailModel = { status: "pending" }
): string {
  const parts: string[] = [];

  if (model.status === "pending") {
    parts.push(rect(6, 8, 190, 62, "dash"));
    parts.push(text(101, 29, "POR VERIFICAR EN TERRENO", "label", "middle"));
    parts.push(
      text(
        101,
        40,
        "DETALLE DE EMPALME / MEDIDOR / TIERRAS NO VALIDADO",
        "small",
        "middle"
      )
    );
    parts.push(
      text(
        101,
        51,
        "ORBI no representa una topología sin evidencia.",
        "small",
        "middle"
      )
    );
    return parts.join("");
  }

  const y = 34;
  parts.push(text(15, 18, model.supplyLabel ?? "Red BT verificada", "label"));
  parts.push(line(20, y, 48, y, "med"));
  parts.push(rect(48, y - 8, 28, 16, "med"));
  parts.push(text(62, y + 1.5, "EMPALME", "small", "middle"));

  if (model.hasMeter) {
    parts.push(line(76, y, 104, y, "med"));
    parts.push(rect(104, y - 8, 28, 16, "med"));
    parts.push(text(118, y + 1.5, "MEDIDOR", "small", "middle"));
    parts.push(line(132, y, 164, y, "med"));
  } else {
    parts.push(line(76, y, 164, y, "med"));
  }

  parts.push(text(165, y + 1.5, "AL TDA", "small"));

  if (model.hasProtectiveEarth) {
    parts.push(line(62, y + 8, 62, y + 36, "dash"));
    parts.push(text(62, y + 44, "TP", "label", "middle"));
    parts.push(line(55, y + 38, 69, y + 38, "thin"));
    parts.push(line(57, y + 41, 67, y + 41, "thin"));
    parts.push(line(59, y + 44, 65, y + 44, "thin"));
  }

  if (model.hasServiceEarth) {
    const x = 118;
    parts.push(line(x, y + 8, x, y + 36, "dash"));
    parts.push(text(x, y + 44, "TS", "label", "middle"));
    parts.push(line(x - 7, y + 38, x + 7, y + 38, "thin"));
    parts.push(line(x - 5, y + 41, x + 5, y + 41, "thin"));
    parts.push(line(x - 3, y + 44, x + 3, y + 44, "thin"));
  }

  return parts.join("");
}
