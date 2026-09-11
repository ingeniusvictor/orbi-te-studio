import type { TE1FormDraft } from "./te1-form-model.js";

export function buildTEAssistantContext(
  projectId: string,
  draft: TE1FormDraft
): string {
  const lines = [
    `Project ID: ${projectId}`,
    `Proyecto: ${draft.project.name || "PENDIENTE"}`,
    `Destino: ${draft.project.destination}`,
    `Sistema: ${draft.project.system}`,
    `Tensión nominal declarada: ${draft.project.voltageV || "PENDIENTE"} V`,
    `Superficie vivienda: ${draft.project.surfaceM2 ? `${draft.project.surfaceM2} m²` : "PENDIENTE"}`,
    `Comuna: ${draft.location.commune || "PENDIENTE"}`,
    `Región: ${draft.location.region || "PENDIENTE"}`,
    `Tablero: ${draft.board.name || "PENDIENTE"}`,
    `Protección general: ${draft.board.mainCurrentA ? `${draft.board.mainCurrentA} A` : "PENDIENTE"}`,
    `Diferencial: ${draft.board.differentialCurrentA && draft.board.differentialResidualMA ? `${draft.board.differentialCurrentA} A / ${draft.board.differentialResidualMA} mA` : "PENDIENTE"}`,
    `Circuitos: ${draft.circuits.length}`,
    `Foto frontal vinculada: ${draft.board.frontalEvidenceId ? "SÍ" : "NO"}`,
    `Croquis ubicación vinculado: ${draft.location.locationSketchEvidenceId ? "SÍ" : "NO"}`,
    `Plano fuente vinculado: ${draft.plan.sourceEvidenceId ? "SÍ" : "NO"}`,
    `Aprobación profesional ORBI: ${draft.review.approved ? "VIGENTE" : "NO VIGENTE"}`
  ];

  for (const circuit of draft.circuits) {
    lines.push(
      [
        `Circuito ${circuit.number || "?"}`,
        circuit.description || "SIN DESCRIPCIÓN",
        circuit.breakerA ? `ITM ${circuit.breakerA} A` : "ITM PENDIENTE",
        circuit.installedPowerW
          ? `${circuit.installedPowerW} W`
          : "POTENCIA PENDIENTE",
        circuit.conductorVerified
          ? "CONDUCTOR VERIFICADO"
          : "CONDUCTOR POR VERIFICAR"
      ].join(" | ")
    );
  }

  for (const measurement of draft.measurements) {
    lines.push(
      [
        `Medición ${measurement.kind}`,
        measurement.value && measurement.unit
          ? `${measurement.value} ${measurement.unit}`
          : "VALOR PENDIENTE",
        measurement.verified ? "VERIFICADA" : "PENDIENTE",
        measurement.evidenceId
          ? "CON EVIDENCIA"
          : "SIN EVIDENCIA"
      ].join(" | ")
    );
  }

  lines.push(
    "Nota de privacidad: este contexto técnico excluye nombre y RUT del propietario."
  );

  return lines.join("\n");
}
