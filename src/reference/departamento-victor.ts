import type { TE1Project } from "../domain/types.js";

const legacyUnilinear = {
  id: "EV-VICTOR-UNILINEAR-001",
  kind: "legacy-plan" as const,
  label: "Diagrama unilineal escaneado del departamento",
  confidence: "high" as const
};

const boardPhoto = {
  id: "EV-VICTOR-BOARD-001",
  kind: "photo" as const,
  label: "Fotografía frontal del tablero del departamento",
  confidence: "high" as const
};

export const departamentoVictorReference: TE1Project = {
  id: "TE1-REF-001",
  name: "Departamento Víctor",
  destination: "departamento",
  system: "monofasico",
  voltageV: 220,
  boardName: "TDA DEPTOS",
  location: {},
  differentialProtection: {
    poles: 2,
    ratedCurrentA: 40,
    residualCurrentMA: 30,
    type: "unknown"
  },
  circuits: [
    {
      id: "VICTOR-C1",
      number: 1,
      description: "ILUMINACIÓN DEPARTAMENTO",
      voltageV: 220,
      protection: { poles: 1, ratedCurrentA: 10, breakingCapacityKA: 6 },
      evidence: [legacyUnilinear, boardPhoto]
    },
    {
      id: "VICTOR-C2",
      number: 2,
      description: "ENCHUFES DEPARTAMENTO",
      voltageV: 220,
      protection: { poles: 1, ratedCurrentA: 10, breakingCapacityKA: 6 },
      evidence: [legacyUnilinear, boardPhoto]
    },
    {
      id: "VICTOR-C3",
      number: 3,
      description: "ENCH. COC.-LOGIA: REFRI.-CAMP.-MULTIUSOS-CALEFONT-LAV./SEC.",
      voltageV: 220,
      protection: { poles: 1, ratedCurrentA: 16, breakingCapacityKA: 6 },
      evidence: [legacyUnilinear, boardPhoto]
    },
    {
      id: "VICTOR-C4",
      number: 4,
      description: "ENCH. COCINA: HORNO ELÉCTRICO",
      voltageV: 220,
      protection: { poles: 1, ratedCurrentA: 16, breakingCapacityKA: 6 },
      evidence: [legacyUnilinear, boardPhoto]
    },
    {
      id: "VICTOR-C5",
      number: 5,
      description: "ENCH. COCINA: ENCIMERA ELÉCTRICA",
      voltageV: 220,
      protection: { poles: 1, ratedCurrentA: 32, breakingCapacityKA: 6 },
      evidence: [legacyUnilinear, boardPhoto]
    }
  ],
  evidence: [legacyUnilinear, boardPhoto],
  professionalReview: { status: "pending" }
};
