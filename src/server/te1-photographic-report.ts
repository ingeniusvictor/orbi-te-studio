import PDFDocument from "pdfkit";
import type { TE1FormDraft } from "../web/te1-form-model.js";
import {
  evidenceRolesFromDraft,
  type EvidenceReceiptRef
} from "./evidence-generation-gate.js";
import { getEvidenceVerificationReceipt } from "./evidence-verification-registry.js";
import { getVerifiedEvidenceBuffer } from "./verified-evidence-buffer-registry.js";

export interface TE1PhotographicReportArtifact {
  filename: string;
  mimeType: "application/pdf";
  bytes: Uint8Array;
}

interface PhotoEntry {
  evidenceId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  verifiedAt: string;
  roles: string[];
  categoryLabel: string;
  caption: string;
  bytes?: Buffer;
}

export async function buildTE1PhotographicReport(
  projectId: string,
  draft: TE1FormDraft,
  receipts: EvidenceReceiptRef[],
  generatedAt = new Date()
): Promise<TE1PhotographicReportArtifact> {
  const entries = collectEntries(draft, receipts);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 42, right: 42, bottom: 42, left: 42 },
    info: {
      Title: `ORBI TE Studio - Informe Fotografico TE1 - ${projectId}`,
      Author: "ORBI TE Studio"
    }
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  renderCover(doc, projectId, draft, generatedAt, entries.length);
  renderIndex(doc, entries);

  for (let index = 0; index < entries.length; index += 1) {
    renderEntryPage(doc, entries[index]!, index + 1, entries.length);
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });

  return {
    filename: `${safeName(projectId)}_TE1_informe_fotografico.pdf`,
    mimeType: "application/pdf",
    bytes: new Uint8Array(Buffer.concat(chunks))
  };
}

function collectEntries(
  draft: TE1FormDraft,
  receipts: EvidenceReceiptRef[]
): PhotoEntry[] {
  const roles = evidenceRolesFromDraft(draft);

  return receipts
    .map((ref) => {
      const receipt = getEvidenceVerificationReceipt(ref.token);
      if (!receipt) {
        throw new Error(
          `${ref.evidenceId}: comprobante no disponible para informe fotografico.`
        );
      }

      const fileRoles = roles
        .filter((item) => item.evidenceId === ref.evidenceId)
        .map((item) => item.role)
        .sort();

      return {
        evidenceId: receipt.evidenceId,
        filename: receipt.filename,
        mimeType: receipt.mimeType,
        sizeBytes: receipt.sizeBytes,
        sha256: receipt.sha256,
        verifiedAt: receipt.verifiedAt,
        roles: fileRoles,
        categoryLabel: categoryFromRoles(fileRoles),
        caption: captionFromRoles(fileRoles, draft),
        bytes: getVerifiedEvidenceBuffer(ref.token)
      };
    })
    .sort((a, b) => {
      const byCategory = a.categoryLabel.localeCompare(b.categoryLabel);
      return byCategory !== 0
        ? byCategory
        : a.filename.localeCompare(b.filename);
    });
}

function renderCover(
  doc: PDFKit.PDFDocument,
  projectId: string,
  draft: TE1FormDraft,
  generatedAt: Date,
  evidenceCount: number
): void {
  doc.fontSize(22).text("ORBI TE Studio", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(18).text("INFORME FOTOGRAFICO TE1", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(11);
  line(doc, "Proyecto", draft.project.name || projectId);
  line(doc, "ID", projectId);
  line(doc, "Destino", destinationLabel(draft.project.destination));
  line(
    doc,
    "Ubicacion",
    [
      draft.location.address,
      draft.location.commune,
      draft.location.region
    ]
      .filter(Boolean)
      .join(", ") || "PENDIENTE"
  );
  line(
    doc,
    "Georreferencia",
    draft.location.wgs84 || draft.location.utm || "PENDIENTE"
  );
  line(
    doc,
    "Profesional revisor",
    draft.review.reviewerName || "PENDIENTE"
  );
  line(doc, "Cantidad de evidencias", String(evidenceCount));
  line(doc, "Fecha de generacion", generatedAt.toISOString());

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#555555");
  doc.text(
    "Documento de apoyo preparado por ORBI TE Studio a partir de evidencia verificada mediante SHA-256. No constituye aprobacion, declaracion ni recepcion por parte de la SEC.",
    { align: "justify" }
  );
  doc.fillColor("#000000");
}

function renderIndex(
  doc: PDFKit.PDFDocument,
  entries: PhotoEntry[]
): void {
  doc.addPage();
  doc.fontSize(17).text("Indice de evidencias");
  doc.moveDown();

  if (entries.length === 0) {
    doc.fontSize(10).text("No hay evidencias registradas.");
    return;
  }

  entries.forEach((entry, index) => {
    doc.fontSize(10).text(
      `${index + 1}. ${entry.categoryLabel} - ${entry.filename}`
    );
    doc.fontSize(8).fillColor("#666666");
    doc.text(
      `   ${entry.roles.join(", ") || "sin rol"} | SHA-256 ${entry.sha256.slice(0, 16)}...`
    );
    doc.fillColor("#000000");
    doc.moveDown(0.35);
  });
}

function renderEntryPage(
  doc: PDFKit.PDFDocument,
  entry: PhotoEntry,
  ordinal: number,
  total: number
): void {
  doc.addPage();

  doc.fontSize(9).fillColor("#666666");
  doc.text(`EVIDENCIA ${ordinal} DE ${total}`, { align: "right" });
  doc.fillColor("#000000");
  doc.fontSize(16).text(entry.categoryLabel);
  doc.moveDown(0.3);
  doc.fontSize(10).text(entry.caption || "Sin descripcion tecnica adicional.");
  doc.moveDown();

  if (
    entry.bytes &&
    (entry.mimeType === "image/jpeg" || entry.mimeType === "image/png")
  ) {
    try {
      const maxWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;
      doc.image(entry.bytes, {
        fit: [maxWidth, 390],
        align: "center",
        valign: "center"
      });
      doc.moveDown();
    } catch {
      renderPreviewUnavailable(doc, "No fue posible insertar la imagen.");
    }
  } else if (entry.mimeType === "image/webp") {
    renderPreviewUnavailable(
      doc,
      "Archivo WEBP verificado. Vista previa no incorporada en esta version."
    );
  } else if (entry.mimeType === "application/pdf") {
    renderPreviewUnavailable(
      doc,
      "PDF de evidencia verificado. Sus paginas no se rasterizan en esta version."
    );
  } else {
    renderPreviewUnavailable(
      doc,
      "Vista previa no disponible para este tipo de evidencia."
    );
  }

  doc.moveDown();
  doc.fontSize(9);
  line(doc, "Evidence ID", entry.evidenceId);
  line(doc, "Archivo", entry.filename || "SIN NOMBRE");
  line(doc, "Tipo", entry.mimeType || "DESCONOCIDO");
  line(doc, "Tamano", `${entry.sizeBytes} bytes`);
  line(doc, "Rol(es)", entry.roles.join(", ") || "Sin rol registrado");
  line(doc, "Verificado", entry.verifiedAt);
  line(doc, "SHA-256", entry.sha256);
}

function renderPreviewUnavailable(
  doc: PDFKit.PDFDocument,
  message: string
): void {
  doc
    .roundedRect(
      doc.page.margins.left,
      doc.y,
      doc.page.width - doc.page.margins.left - doc.page.margins.right,
      120,
      6
    )
    .stroke("#bbbbbb");
  doc.moveDown(2.2);
  doc.fontSize(10).fillColor("#555555").text(message, { align: "center" });
  doc.fillColor("#000000");
  doc.moveDown(2.2);
}

function categoryFromRoles(roles: string[]): string {
  if (roles.some((role) => role.startsWith("board."))) {
    return "TABLERO ELECTRICO";
  }
  if (roles.includes("location.sketch")) {
    return "UBICACION";
  }
  if (roles.includes("plan.source")) {
    return "PLANO / LEVANTAMIENTO";
  }
  if (roles.some((role) => role.startsWith("measurement."))) {
    return "MEDICIONES";
  }
  return "OTRAS EVIDENCIAS";
}

function captionFromRoles(
  roles: string[],
  draft: TE1FormDraft
): string {
  const captions: string[] = [];

  if (roles.includes("board.front")) {
    captions.push(
      `Vista frontal del ${draft.board.name || "tablero"}.`
    );
  }

  if (roles.includes("board.legend")) {
    captions.push(
      `Leyenda asociada al ${draft.board.name || "tablero"}.`
    );
  }

  if (roles.includes("location.sketch")) {
    captions.push(
      `Croquis o evidencia de ubicacion para ${[
        draft.location.address,
        draft.location.commune,
        draft.location.region
      ]
        .filter(Boolean)
        .join(", ") || "ubicacion pendiente"}.`
    );
  }

  if (roles.includes("plan.source")) {
    captions.push(
      `Fuente de plano: ${draft.plan.sourceType || "tipo pendiente"}${draft.plan.scale ? `, escala ${draft.plan.scale}` : ""}.`
    );
  }

  for (const role of roles.filter((item) =>
    item.startsWith("measurement.")
  )) {
    const kind = role.slice("measurement.".length);
    const measurement = draft.measurements.find(
      (item) => item.kind === kind
    );
    if (!measurement) continue;

    captions.push(
      `${measurementLabel(measurement.kind)}: ${measurement.value && measurement.unit ? `${measurement.value} ${measurement.unit}` : "valor pendiente"}${measurement.verified ? " (verificada)" : " (pendiente)"}.`
    );
  }

  return captions.join(" ");
}

function measurementLabel(
  kind: TE1FormDraft["measurements"][number]["kind"]
): string {
  const labels: Record<
    TE1FormDraft["measurements"][number]["kind"],
    string
  > = {
    "supply-voltage": "Tension de alimentacion",
    "insulation-resistance": "Resistencia de aislamiento",
    "pe-continuity": "Continuidad PE",
    "earthing-resistance": "Resistencia de puesta a tierra",
    "rcd-test": "Prueba de diferencial"
  };
  return labels[kind];
}

function destinationLabel(
  value: TE1FormDraft["project"]["destination"]
): string {
  if (value === "casa-habitacion") return "Casa habitacion";
  if (value === "departamento") return "Departamento";
  return "Otro";
}

function line(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string
): void {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value);
}

function safeName(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 70) || "TE1"
  );
}
