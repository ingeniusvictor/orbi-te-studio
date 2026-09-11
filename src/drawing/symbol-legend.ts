import type { TE1Project } from "../domain/types.js";
import { circle, line, rect, text } from "./svg-primitives.js";

export type SymbolKind =
  | "main-breaker"
  | "differential"
  | "branch-breaker"
  | "earth"
  | "junction";

export interface SymbolLegendItem {
  kind: SymbolKind;
  code: string;
  description: string;
}

export const defaultTE1SymbolLegend: SymbolLegendItem[] = [
  { kind: "main-breaker", code: "AG", description: "Interruptor automático general" },
  { kind: "differential", code: "ID", description: "Interruptor diferencial" },
  { kind: "branch-breaker", code: "C", description: "Interruptor automático de circuito" },
  { kind: "earth", code: "TP/TS", description: "Puesta a tierra" },
  { kind: "junction", code: "●", description: "Punto de conexión" }
];

export function symbolLegendForProject(
  project: TE1Project
): SymbolLegendItem[] {
  const items: SymbolLegendItem[] = [];

  if (project.mainProtection) {
    items.push(defaultTE1SymbolLegend[0]!);
  }
  if (project.differentialProtection) {
    items.push(defaultTE1SymbolLegend[1]!);
  }
  if (project.circuits.length > 0) {
    items.push(defaultTE1SymbolLegend[2]!);
  }

  // Earth symbols are intentionally omitted until grounding topology is
  // represented explicitly in the project model.
  items.push(defaultTE1SymbolLegend[4]!);
  return items;
}

function renderSymbol(kind: SymbolKind, x: number, y: number): string {
  switch (kind) {
    case "main-breaker":
    case "branch-breaker":
      return [
        rect(x, y - 3, 12, 6, "med"),
        line(x + 3, y + 2, x + 9, y - 2, "med")
      ].join("");
    case "differential":
      return [
        rect(x, y - 3, 12, 6, "med"),
        circle(x + 6, y, 2, "thin")
      ].join("");
    case "earth":
      return [
        line(x + 6, y - 4, x + 6, y, "med"),
        line(x, y, x + 12, y, "thin"),
        line(x + 2, y + 2.5, x + 10, y + 2.5, "thin"),
        line(x + 4, y + 5, x + 8, y + 5, "thin")
      ].join("");
    case "junction":
      return circle(x + 6, y, 1.2, "med");
  }
}

export function renderSymbolLegendPanel(
  items: SymbolLegendItem[] = defaultTE1SymbolLegend,
  options?: { showTitle?: boolean }
): string {
  const showTitle = options?.showTitle ?? true;
  const width = 160;
  const rowHeight = 9;
  const headerHeight = showTitle ? 9 : 0;
  const height = headerHeight + items.length * rowHeight;
  const parts: string[] = [rect(0, 0, width, height, "med")];

  if (showTitle) {
    parts.push(text(width / 2, 6, "CUADRO DE SIMBOLOGÍA", "label", "middle"));
    parts.push(line(0, 9, width, 9, "med"));
  }

  items.forEach((item, index) => {
    const y = headerHeight + index * rowHeight;
    if (index > 0) parts.push(line(0, y, width, y));
    parts.push(renderSymbol(item.kind, 4, y + rowHeight / 2));
    parts.push(text(22, y + 6, item.code, "small"));
    parts.push(text(42, y + 6, item.description, "small"));
  });

  return parts.join("");
}
