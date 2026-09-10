export type ElectricalPointKind =
  | "light"
  | "switch"
  | "outlet"
  | "dedicated-outlet"
  | "junction-box"
  | "board";

export interface PlanPoint {
  id: string;
  kind: ElectricalPointKind;
  xMm: number;
  yMm: number;
  circuitNumber?: number;
  label?: string;
}

export interface RoomPolygon {
  id: string;
  name: string;
  points: Array<{ xMm: number; yMm: number }>;
}

export interface PlanCircuitPath {
  circuitNumber: number;
  points: Array<{ xMm: number; yMm: number }>;
}

export interface ElectricalFloorPlanModel {
  projectId: string;
  sourceScale?: string;
  widthMm: number;
  heightMm: number;
  rooms: RoomPolygon[];
  points: PlanPoint[];
  paths: PlanCircuitPath[];
  sourceEvidenceIds: string[];
}

export function validateFloorPlanModel(
  plan: ElectricalFloorPlanModel
): string[] {
  const issues: string[] = [];

  if (plan.widthMm <= 0 || plan.heightMm <= 0) {
    issues.push("Las dimensiones generales del plano deben ser mayores que cero.");
  }

  if (plan.sourceEvidenceIds.length === 0) {
    issues.push("El plano debe conservar referencia a evidencia fuente.");
  }

  for (const point of plan.points) {
    if (point.xMm < 0 || point.yMm < 0) {
      issues.push(`Punto ${point.id}: coordenadas negativas no válidas.`);
    }
    if (
      point.kind !== "board" &&
      point.circuitNumber === undefined
    ) {
      issues.push(`Punto ${point.id}: circuito pendiente.`);
    }
  }

  return issues;
}
