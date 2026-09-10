export type Confidence = "high" | "medium" | "low" | "unknown";

export type EvidenceKind =
  | "photo"
  | "pdf"
  | "field-measurement"
  | "owner-data"
  | "legacy-plan"
  | "manual-review";

export interface EvidenceRef {
  id: string;
  kind: EvidenceKind;
  label: string;
  confidence: Confidence;
  sourcePath?: string;
  notes?: string;
}

export interface Protection {
  poles: number;
  ratedCurrentA: number;
  breakingCapacityKA?: number;
  curve?: string;
}

export interface DifferentialProtection {
  poles: number;
  ratedCurrentA: number;
  residualCurrentMA: number;
  type?: "AC" | "A" | "F" | "B" | "unknown";
}

export interface ConductorSet {
  phaseMm2?: number;
  neutralMm2?: number;
  peMm2?: number;
  material?: "Cu" | "Al";
  installationMethod?: string;
  verified: boolean;
}

export interface Circuit {
  id: string;
  number: number;
  description: string;
  voltageV: number;
  protection: Protection;
  conductor?: ConductorSet;
  installedPowerW?: number;
  demandedPowerW?: number;
  currentA?: number;
  evidence: EvidenceRef[];
}

export interface ProjectLocation {
  address?: string;
  commune?: string;
  region?: string;
  utm?: string;
  wgs84?: string;
}

export interface TE1Project {
  id: string;
  name: string;
  destination: "casa-habitacion" | "departamento" | "otro";
  system: "monofasico" | "trifasico";
  voltageV: number;
  boardName: string;
  location: ProjectLocation;
  mainProtection?: Protection;
  differentialProtection?: DifferentialProtection;
  circuits: Circuit[];
  evidence: EvidenceRef[];
  professionalReview: {
    status: "pending" | "approved" | "rejected";
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
  };
}
