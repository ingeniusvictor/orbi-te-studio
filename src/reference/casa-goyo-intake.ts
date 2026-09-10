import type { TE1FieldIntake } from "../field/intake-types.js";

export const casaGoyoFieldIntake: TE1FieldIntake = {
  projectId: "TE1-REF-002",
  property: {
    ownerName: {
      status: "pending",
      confidence: "unknown",
      evidenceIds: []
    },
    ownerRut: {
      status: "pending",
      confidence: "unknown",
      evidenceIds: []
    },
    address: {
      status: "pending",
      confidence: "unknown",
      evidenceIds: []
    },
    commune: {
      value: "Osorno",
      status: "reported",
      confidence: "high",
      evidenceIds: []
    },
    region: {
      value: "Los Lagos",
      status: "reported",
      confidence: "high",
      evidenceIds: []
    },
    destination: {
      value: "casa-habitacion",
      status: "reported",
      confidence: "high",
      evidenceIds: []
    },
    wgs84: {
      status: "pending",
      confidence: "unknown",
      evidenceIds: []
    },
    utm: {
      status: "pending",
      confidence: "unknown",
      evidenceIds: []
    }
  },
  board: {
    boardName: {
      value: "TDA CASA GOYO",
      status: "reported",
      confidence: "high",
      evidenceIds: ["EV-GOYO-BOARD-001"]
    },
    frontalPhoto: {
      value: "EV-GOYO-BOARD-001",
      status: "observed",
      confidence: "high",
      evidenceIds: ["EV-GOYO-BOARD-001"]
    },
    legendPhoto: {
      value: "EV-GOYO-BOARD-001",
      status: "observed",
      confidence: "high",
      evidenceIds: ["EV-GOYO-BOARD-001"]
    },
    internalPhoto: {
      status: "pending",
      confidence: "unknown",
      evidenceIds: []
    },
    devices: [
      {
        position: 1,
        kind: "main-breaker",
        label: "Aut. General",
        protection: {
          poles: 1,
          ratedCurrentA: 25,
          breakingCapacityKA: 6,
          curve: "C"
        },
        confidence: "high",
        evidenceIds: ["EV-GOYO-BOARD-001"]
      },
      {
        position: 2,
        kind: "differential",
        label: "Diferencial",
        differential: {
          poles: 2,
          ratedCurrentA: 25,
          residualCurrentMA: 30,
          type: "unknown"
        },
        confidence: "high",
        evidenceIds: ["EV-GOYO-BOARD-001"]
      },
      {
        position: 3,
        kind: "branch-breaker",
        label: "Aut. Alumbrado",
        circuitNumber: 1,
        protection: {
          poles: 1,
          ratedCurrentA: 10,
          breakingCapacityKA: 6,
          curve: "C"
        },
        confidence: "high",
        evidenceIds: ["EV-GOYO-BOARD-001"]
      },
      {
        position: 4,
        kind: "branch-breaker",
        label: "Aut. Enchufe comunes",
        circuitNumber: 2,
        protection: {
          poles: 1,
          ratedCurrentA: 16,
          breakingCapacityKA: 6,
          curve: "C"
        },
        confidence: "high",
        evidenceIds: ["EV-GOYO-BOARD-001"]
      },
      {
        position: 5,
        kind: "branch-breaker",
        label: "Aut. Enchufes cocina - logia",
        circuitNumber: 3,
        protection: {
          poles: 1,
          ratedCurrentA: 16,
          breakingCapacityKA: 6,
          curve: "C"
        },
        confidence: "high",
        evidenceIds: ["EV-GOYO-BOARD-001"]
      }
    ]
  },
  measurements: [],
  evidence: [
    {
      id: "EV-GOYO-BOARD-001",
      kind: "photo",
      label: "Fotografía frontal del tablero Casa Goyo",
      confidence: "high"
    }
  ]
};
