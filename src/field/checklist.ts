import type { TE1FieldIntake } from "./intake-types.js";

export type ChecklistStatus = "complete" | "missing" | "review";

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
  message: string;
}

function hasValue<T>(value: { value?: T }): boolean {
  return value.value !== undefined && value.value !== null && value.value !== "";
}

export function buildMinimumFieldChecklist(intake: TE1FieldIntake): ChecklistItem[] {
  const boardPhotoOk = hasValue(intake.board.frontalPhoto);
  const hasDevices = intake.board.devices.length > 0;
  const hasMain = intake.board.devices.some((d) => d.kind === "main-breaker");
  const hasDifferential = intake.board.devices.some((d) => d.kind === "differential");
  const hasBranches = intake.board.devices.some((d) => d.kind === "branch-breaker");

  return [
    {
      id: "FIELD-OWNER",
      label: "Datos del propietario",
      status:
        hasValue(intake.property.ownerName) && hasValue(intake.property.ownerRut)
          ? "complete"
          : "missing",
      message: "Nombre y RUT del propietario."
    },
    {
      id: "FIELD-ADDRESS",
      label: "Dirección completa",
      status:
        hasValue(intake.property.address) &&
        hasValue(intake.property.commune) &&
        hasValue(intake.property.region)
          ? "complete"
          : "missing",
      message: "Dirección, comuna y región."
    },
    {
      id: "FIELD-GEOREF",
      label: "Georreferenciación",
      status:
        hasValue(intake.property.wgs84) || hasValue(intake.property.utm)
          ? "complete"
          : "missing",
      message: "Coordenadas WGS84 o UTM."
    },
    {
      id: "FIELD-BOARD-FRONTAL",
      label: "Fotografía frontal del tablero",
      status: boardPhotoOk ? "complete" : "missing",
      message: "Fotografía frontal legible del tablero."
    },
    {
      id: "FIELD-BOARD-DEVICES",
      label: "Identificación de protecciones",
      status: hasDevices && hasMain && hasDifferential && hasBranches ? "complete" : "review",
      message: "General, diferencial y protecciones de circuitos."
    },
    {
      id: "FIELD-MEASUREMENTS",
      label: "Mediciones de verificación",
      status: intake.measurements.length > 0 ? "review" : "missing",
      message: "Las mediciones reales deben registrarse con evidencia de instrumento."
    }
  ];
}

export function fieldIntakeCompletionPercent(intake: TE1FieldIntake): number {
  const items = buildMinimumFieldChecklist(intake);
  const complete = items.filter((item) => item.status === "complete").length;
  return Math.round((complete / items.length) * 100);
}
