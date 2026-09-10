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
  };
  board: {
    name: string;
    totalWays: string;
    frontalPhotoLabel: string;
    legendPhotoLabel: string;
  };
  circuits: TE1CircuitDraft[];
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
      utm: ""
    },
    board: {
      name: "",
      totalWays: "12",
      frontalPhotoLabel: "",
      legendPhotoLabel: ""
    },
    circuits: [createCircuitDraft(1)]
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
      utm: ""
    },
    board: {
      name: "TDA CASA GOYO",
      totalWays: "12",
      frontalPhotoLabel: "Fotografía frontal tablero Casa Goyo",
      legendPhotoLabel: "Leyenda visible en fotografía frontal"
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
    ]
  };
}
