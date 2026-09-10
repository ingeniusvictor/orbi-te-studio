import type { Confidence, EvidenceRef, Protection, DifferentialProtection } from "../domain/types.js";

export type IntakeStatus =
  | "observed"
  | "reported"
  | "calculated"
  | "verified"
  | "pending"
  | "conflict";

export interface IntakeValue<T> {
  value?: T;
  status: IntakeStatus;
  confidence: Confidence;
  evidenceIds: string[];
  notes?: string;
}

export interface PropertyIntake {
  ownerName: IntakeValue<string>;
  ownerRut: IntakeValue<string>;
  address: IntakeValue<string>;
  commune: IntakeValue<string>;
  region: IntakeValue<string>;
  destination: IntakeValue<"casa-habitacion" | "departamento" | "otro">;
  wgs84: IntakeValue<string>;
  utm: IntakeValue<string>;
}

export interface BoardDeviceObservation {
  position: number;
  kind: "main-breaker" | "differential" | "branch-breaker" | "unknown";
  label?: string;
  circuitNumber?: number;
  protection?: Protection;
  differential?: DifferentialProtection;
  confidence: Confidence;
  evidenceIds: string[];
}

export interface BoardIntake {
  boardName: IntakeValue<string>;
  frontalPhoto: IntakeValue<string>;
  legendPhoto: IntakeValue<string>;
  internalPhoto: IntakeValue<string>;
  devices: BoardDeviceObservation[];
}

export interface FieldMeasurement {
  id: string;
  kind:
    | "supply-voltage"
    | "insulation-resistance"
    | "pe-continuity"
    | "earthing-resistance"
    | "rcd-test"
    | "other";
  value?: number;
  unit?: string;
  status: IntakeStatus;
  evidenceIds: string[];
  notes?: string;
}

export interface TE1FieldIntake {
  projectId: string;
  property: PropertyIntake;
  board: BoardIntake;
  measurements: FieldMeasurement[];
  evidence: EvidenceRef[];
}
