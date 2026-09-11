import type { Confidence } from "../domain/types.js";

export type PhotoIssue =
  | "blurred"
  | "overexposed"
  | "underexposed"
  | "cropped-device"
  | "perspective"
  | "rating-unreadable"
  | "legend-unreadable"
  | "obstructed";

export interface PhotoAssessment {
  evidenceId: string;
  confidence: Confidence;
  issues: PhotoIssue[];
  readableDevicePositions: number[];
  unreadableDevicePositions: number[];
}

export interface RetakeRequest {
  required: boolean;
  reasons: string[];
  instructions: string[];
}

export function buildRetakeRequest(
  assessment: PhotoAssessment
): RetakeRequest {
  const reasons: string[] = [];
  const instructions: string[] = [];

  for (const issue of assessment.issues) {
    switch (issue) {
      case "blurred":
        reasons.push("La imagen está borrosa.");
        instructions.push("Repita la fotografía manteniendo el teléfono estable y perpendicular al tablero.");
        break;
      case "overexposed":
        reasons.push("Existe sobreexposición que impide leer etiquetas.");
        instructions.push("Desactive el flash o cambie el ángulo para evitar reflejos.");
        break;
      case "underexposed":
        reasons.push("La imagen tiene iluminación insuficiente.");
        instructions.push("Aumente la iluminación general sin producir reflejos sobre los equipos.");
        break;
      case "cropped-device":
        reasons.push("Uno o más dispositivos están cortados.");
        instructions.push("Capture el tablero completo dentro del encuadre.");
        break;
      case "perspective":
        reasons.push("La perspectiva dificulta identificar posiciones y etiquetas.");
        instructions.push("Tome una fotografía frontal, centrada y lo más perpendicular posible.");
        break;
      case "rating-unreadable":
        reasons.push("No se pueden leer todos los calibres de las protecciones.");
        instructions.push("Tome acercamientos de los dispositivos con datos ilegibles.");
        break;
      case "legend-unreadable":
        reasons.push("La leyenda de circuitos no es legible.");
        instructions.push("Tome una fotografía exclusiva de la leyenda o rotulado del tablero.");
        break;
      case "obstructed":
        reasons.push("Hay elementos que obstruyen la visualización.");
        instructions.push("Retire únicamente obstrucciones externas que puedan moverse de forma segura y repita la foto.");
        break;
    }
  }

  for (const position of assessment.unreadableDevicePositions) {
    reasons.push(`La posición ${position} no es legible con suficiente confianza.`);
    instructions.push(`Tome un acercamiento nítido de la protección en posición ${position}.`);
  }

  return {
    required: reasons.length > 0 || assessment.confidence === "low" || assessment.confidence === "unknown",
    reasons: [...new Set(reasons)],
    instructions: [...new Set(instructions)]
  };
}
