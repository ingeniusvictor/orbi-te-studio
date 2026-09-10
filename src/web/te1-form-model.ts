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
      utm: ""
    },
    board: {
      name: "TDA CASA GOYO",
      totalWays: "12",
      frontalPhotoLabel: "Fotografía frontal tablero Casa Goyo",
      legendPhotoLabel: "Leyenda visible en fotografía frontal"
    }
  };
}
