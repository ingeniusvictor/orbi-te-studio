import type { TE1FormDraft } from "../web/te1-form-model.js";

export interface TE1PackageReadmeArtifact {
  filename: "LEEME_ORBI_TE1.txt";
  mimeType: "text/plain";
  encoding: "utf8";
  content: string;
}

export function buildTE1PackageReadme(
  projectId: string,
  draft: TE1FormDraft,
  generatedAt = new Date()
): TE1PackageReadmeArtifact {
  const reviewStatus = draft.review.approved
    ? "APROBADO PARA PREPARACION DE EXPORTACION EN ORBI"
    : draft.review.invalidated
      ? "APROBACION INVALIDADA - REQUIERE NUEVA REVISION"
      : "PENDIENTE EN ORBI";

  const location = [
    draft.location.address,
    draft.location.commune,
    draft.location.region
  ]
    .filter(Boolean)
    .join(", ") || "PENDIENTE";

  const content = [
    "ORBI TE STUDIO - PAQUETE TECNICO TE1",
    "====================================",
    "",
    `Proyecto: ${draft.project.name || projectId}`,
    `Project ID: ${projectId}`,
    `Destino: ${draft.project.destination}`,
    `Ubicacion: ${location}`,
    `Generado: ${generatedAt.toISOString()}`,
    "",
    "ESTADO DE REVISION",
    "------------------",
    `Estado ORBI: ${reviewStatus}`,
    `Profesional revisor: ${draft.review.reviewerName || "PENDIENTE"}`,
    `Fecha de aprobacion ORBI: ${draft.review.approvedAt || "PENDIENTE"}`,
    `Aprobacion invalidada: ${draft.review.invalidated ? "SI" : "NO"}`,
    `Fecha de invalidacion: ${draft.review.invalidatedAt || "NO APLICA"}`,
    `Motivo de invalidacion: ${draft.review.invalidationReason || "NO APLICA"}`,
    "",
    "ESTRUCTURA DEL PAQUETE",
    "---------------------",
    "00_Proyecto/",
    "  Manifest general del proyecto.",
    "",
    "01_Planos/",
    "  Plano tecnico TE1 en PDF y SVG.",
    "",
    "02_Informes/",
    "  Informe de evidencia e informe fotografico.",
    "",
    "03_Evidencia/",
    "  Manifest de evidencia vinculada con huellas SHA-256.",
    "",
    "04_Integridad/",
    "  Historial de auditoria, manifest de verificacion server-side e indice",
    "  SHA-256 del paquete.",
    "",
    "COMO VERIFICAR LA INTEGRIDAD",
    "---------------------------",
    "1. Abra 04_Integridad/*_TE1_package_index.json.",
    "2. Calcule SHA-256 del archivo que desea comprobar.",
    "3. Compare el resultado con el campo sha256 del indice.",
    "4. Revise *_TE1_audit_history.json para la secuencia de aprobaciones,",
    "   invalidaciones y generaciones registradas.",
    "",
    "Windows PowerShell:",
    "  Get-FileHash -Algorithm SHA256 .\\archivo.ext",
    "",
    "Linux / macOS:",
    "  sha256sum archivo.ext",
    "",
    "IMPORTANTE",
    "----------",
    "Este paquete fue preparado por ORBI TE Studio para apoyo de ingenieria,",
    "revision y preparacion documental TE1.",
    "",
    "La aprobacion registrada corresponde al flujo interno de revision de ORBI.",
    "No constituye declaracion, aprobacion, recepcion ni certificacion de la SEC.",
    "",
    "La presentacion formal ante SEC permanece bajo responsabilidad del",
    "profesional autorizado, quien debe revisar el expediente y confirmar",
    "que la informacion y documentos sean adecuados antes de su uso.",
    "",
    "Las huellas SHA-256 permiten comprobar integridad de archivos; no prueban",
    "por si solas cumplimiento normativo, autoria profesional ni aprobacion SEC.",
    ""
  ].join("\n");

  return {
    filename: "LEEME_ORBI_TE1.txt",
    mimeType: "text/plain",
    encoding: "utf8",
    content
  };
}
