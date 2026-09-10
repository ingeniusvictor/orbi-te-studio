export interface TE1CircuitDraft {
  id: string;
  number: string;
  description: string;
  breakerA: string;
  breakingCapacityKA: string;
  curve: string;
  installedPowerW: string;
  demandedPowerW: string;
  conductorPhaseMm2: string;
  conductorNeutralMm2: string;
  conductorPeMm2: string;
  conductorMaterial: "Cu" | "Al";
  installationMethod: string;
  conductorVerified: boolean;
}

export type MeasurementDraftKind =
  | "supply-voltage"
  | "insulation-resistance"
  | "pe-continuity"
  | "earthing-resistance"
  | "rcd-test";

export interface TE1MeasurementDraft {
  id: string;
  kind: MeasurementDraftKind;
  value: string;
  unit: string;
  evidenceId: string;
  evidenceLabel: string;
  verified: boolean;
  notes: string;
}

export interface TE1PlanDraft {
  sourceType: "architectural-plan" | "measured-sketch" | "legacy-plan" | "";
  sourceEvidenceId: string;
  sourceLabel: string;
  scale: string;
  hasElectricalPoints: boolean;
  hasDimensions: boolean;
  reviewed: boolean;
  notes: string;
}

export interface TE1FormDraft {
  project: {
    name: string;
    destination: "casa-habitacion" | "departamento" | "otro";
    system: "monofasico" | "trifasico";
    voltageV: string;
  };
  owner: {
    name: string;
    rut: string;
  };
  location: {
    address: string;
    commune: string;
    region: string;
    wgs84: string;
    utm: string;
    locationSketchEvidenceId: string;
    locationSketchEvidenceLabel: string;
    locationSketchVerified: boolean;
  };
  board: {
    name: string;
    totalWays: string;
    frontalEvidenceId: string;
    frontalPhotoLabel: string;
    legendEvidenceId: string;
    legendPhotoLabel: string;
    mainPoles: string;
    mainCurrentA: string;
    mainBreakingCapacityKA: string;
    differentialPoles: string;
    differentialCurrentA: string;
    differentialResidualMA: string;
  };
  circuits: TE1CircuitDraft[];
  measurements: TE1MeasurementDraft[];
  plan: TE1PlanDraft;
  review: {
    reviewerName: string;
    notes: string;
    approved: boolean;
    approvedAt: string;
  };
}

export function createCircuitDraft(number: number): TE1CircuitDraft {
  return {
    id: `CIRCUIT-${number}`,
    number: String(number),
    description: "",
    breakerA: "",
    breakingCapacityKA: "6",
    curve: "C",
    installedPowerW: "",
    demandedPowerW: "",
    conductorPhaseMm2: "",
    conductorNeutralMm2: "",
    conductorPeMm2: "",
    conductorMaterial: "Cu",
    installationMethod: "",
    conductorVerified: false
  };
}

export function createMeasurementDrafts(): TE1MeasurementDraft[] {
  return [
    {
      id: "M-VOLTAGE",
      kind: "supply-voltage",
      value: "",
      unit: "V",
      evidenceId: "",
      evidenceLabel: "",
      verified: false,
      notes: ""
    },
    {
      id: "M-INSULATION",
      kind: "insulation-resistance",
      value: "",
      unit: "MΩ",
      evidenceId: "",
      evidenceLabel: "",
      verified: false,
      notes: ""
    },
    {
      id: "M-PE",
      kind: "pe-continuity",
      value: "",
      unit: "Ω",
      evidenceId: "",
      evidenceLabel: "",
      verified: false,
      notes: ""
    },
    {
      id: "M-EARTH",
      kind: "earthing-resistance",
      value: "",
      unit: "Ω",
      evidenceId: "",
      evidenceLabel: "",
      verified: false,
      notes: ""
    },
    {
      id: "M-RCD",
      kind: "rcd-test",
      value: "",
      unit: "ms",
      evidenceId: "",
      evidenceLabel: "",
      verified: false,
      notes: ""
    }
  ];
}

function emptyPlan(): TE1PlanDraft {
  return {
    sourceType: "",
    sourceEvidenceId: "",
    sourceLabel: "",
    scale: "",
    hasElectricalPoints: false,
    hasDimensions: false,
    reviewed: false,
    notes: ""
  };
}

export function createEmptyTE1FormDraft(): TE1FormDraft {
  return {
    project: {
      name: "",
      destination: "casa-habitacion",
      system: "monofasico",
      voltageV: "220"
    },
    owner: {
      name: "",
      rut: ""
    },
    location: {
      address: "",
      commune: "",
      region: "",
      wgs84: "",
      utm: "",
      locationSketchEvidenceId: "",
      locationSketchEvidenceLabel: "",
      locationSketchVerified: false
    },
    board: {
      name: "",
      totalWays: "12",
      frontalEvidenceId: "",
      frontalPhotoLabel: "",
      legendEvidenceId: "",
      legendPhotoLabel: "",
      mainPoles: "",
      mainCurrentA: "",
      mainBreakingCapacityKA: "",
      differentialPoles: "",
      differentialCurrentA: "",
      differentialResidualMA: ""
    },
    circuits: [createCircuitDraft(1)],
    measurements: createMeasurementDrafts(),
    plan: emptyPlan(),
    review: {
      reviewerName: "",
      notes: "",
      approved: false,
      approvedAt: ""
    }
  };
}

export function createCasaGoyoDemoDraft(): TE1FormDraft {
  return {
    project: {
      name: "Casa Goyo - Osorno",
      destination: "casa-habitacion",
      system: "monofasico",
      voltageV: "220"
    },
    owner: {
      name: "",
      rut: ""
    },
    location: {
      address: "",
      commune: "Osorno",
      region: "Los Lagos",
      wgs84: "",
      utm: "",
      locationSketchEvidenceId: "",
      locationSketchEvidenceLabel: "",
      locationSketchVerified: false
    },
    board: {
      name: "TDA CASA GOYO",
      totalWays: "12",
      frontalEvidenceId: "",
      frontalPhotoLabel: "Fotografía frontal tablero Casa Goyo",
      legendEvidenceId: "",
      legendPhotoLabel: "Leyenda visible en fotografía frontal",
      mainPoles: "1",
      mainCurrentA: "25",
      mainBreakingCapacityKA: "6",
      differentialPoles: "2",
      differentialCurrentA: "25",
      differentialResidualMA: "30"
    },
    circuits: [
      {
        ...createCircuitDraft(1),
        description: "Alumbrado",
        breakerA: "10"
      },
      {
        ...createCircuitDraft(2),
        description: "Enchufes comunes",
        breakerA: "16"
      },
      {
        ...createCircuitDraft(3),
        description: "Enchufes cocina - logia",
        breakerA: "16"
      }
    ],
    measurements: createMeasurementDrafts(),
    plan: emptyPlan(),
    review: {
      reviewerName: "",
      notes: "",
      approved: false,
      approvedAt: ""
    }
  };
}
