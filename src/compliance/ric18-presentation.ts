export interface PresentationState {
  isFirstSheet: boolean;
  hasGeoreference: boolean;
  hasLocationSketch: boolean;
  destination?: string;
  sheetNumber?: number;
  sheetTotal?: number;
  hasSymbolLegend: boolean;
  usesAnnex18_2TitleBlock: boolean;
}

export interface PresentationFinding {
  code: string;
  status: "pass" | "blocker";
  section: string;
  message: string;
}

export function validateRic18Presentation(
  state: PresentationState
): PresentationFinding[] {
  const findings: PresentationFinding[] = [];

  if (!state.usesAnnex18_2TitleBlock) {
    findings.push({
      code: "RIC18-6.3.4-TITLE-BLOCK",
      status: "blocker",
      section: "6.3.4",
      message: "La rotulación debe seguir la forma y distribución del Anexo 18.2."
    });
  } else {
    findings.push({
      code: "RIC18-6.3.4-TITLE-BLOCK",
      status: "pass",
      section: "6.3.4",
      message: "Se registra rotulación basada en Anexo 18.2."
    });
  }

  if (state.isFirstSheet) {
    findings.push({
      code: "RIC18-6.3.5-GEOREFERENCE",
      status: state.hasGeoreference ? "pass" : "blocker",
      section: "6.3.5",
      message: state.hasGeoreference
        ? "La primera lámina incluye georreferenciación UTM o WGS84."
        : "La primera lámina requiere georreferenciación UTM o WGS84."
    });

    findings.push({
      code: "RIC18-6.3.6-LOCATION-SKETCH",
      status: state.hasLocationSketch ? "pass" : "blocker",
      section: "6.3.6",
      message: state.hasLocationSketch
        ? "La primera lámina incluye croquis de ubicación."
        : "La primera lámina requiere croquis de ubicación."
    });
  }

  const numberingOk =
    Boolean(state.destination?.trim()) &&
    state.sheetNumber !== undefined &&
    state.sheetTotal !== undefined &&
    state.sheetNumber >= 1 &&
    state.sheetTotal >= state.sheetNumber;

  findings.push({
    code: "RIC18-6.3.7-SHEET-ID",
    status: numberingOk ? "pass" : "blocker",
    section: "6.3.7",
    message: numberingOk
      ? "La lámina identifica destino, número correlativo y total."
      : "La lámina debe indicar destino, número correlativo y total de láminas."
  });

  findings.push({
    code: "RIC18-6.3.9-SYMBOL-LEGEND",
    status: state.hasSymbolLegend ? "pass" : "blocker",
    section: "6.3.9",
    message: state.hasSymbolLegend
      ? "Se registra cuadro de simbología."
      : "El plano requiere cuadro de simbología con descripción y características técnicas."
  });

  return findings;
}
