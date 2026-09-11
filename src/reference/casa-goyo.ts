import type { TE1Project } from "../domain/types.js";

const boardPhoto = {
  id: "EV-GOYO-BOARD-001",
  kind: "photo" as const,
  label: "Fotografía frontal del tablero Casa Goyo",
  confidence: "high" as const,
  notes:
    "Permite identificar AG C25 6kA, ID 25A/30mA y tres circuitos C10/C16/C16."
};

export const casaGoyoReference: TE1Project = {
  id: "TE1-REF-002",
  name: "Casa Goyo - Osorno",
  destination: "casa-habitacion",
  system: "monofasico",
  voltageV: 220,
  boardName: "TDA CASA GOYO",
  location: {
    commune: "Osorno",
    region: "Los Lagos"
  },
  mainProtection: {
    poles: 1,
    ratedCurrentA: 25,
    breakingCapacityKA: 6,
    curve: "C"
  },
  differentialProtection: {
    poles: 2,
    ratedCurrentA: 25,
    residualCurrentMA: 30,
    type: "unknown"
  },
  circuits: [
    {
      id: "GOYO-C1",
      number: 1,
      description: "ALUMBRADO",
      voltageV: 220,
      protection: {
        poles: 1,
        ratedCurrentA: 10,
        breakingCapacityKA: 6,
        curve: "C"
      },
      evidence: [boardPhoto]
    },
    {
      id: "GOYO-C2",
      number: 2,
      description: "ENCHUFES COMUNES",
      voltageV: 220,
      protection: {
        poles: 1,
        ratedCurrentA: 16,
        breakingCapacityKA: 6,
        curve: "C"
      },
      evidence: [boardPhoto]
    },
    {
      id: "GOYO-C3",
      number: 3,
      description: "ENCHUFES COCINA - LOGIA",
      voltageV: 220,
      protection: {
        poles: 1,
        ratedCurrentA: 16,
        breakingCapacityKA: 6,
        curve: "C"
      },
      evidence: [boardPhoto]
    }
  ],
  evidence: [boardPhoto],
  professionalReview: {
    status: "pending"
  }
};
