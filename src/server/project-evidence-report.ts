import PDFDocument from "pdfkit";
import type { TE1FormDraft } from "../web/te1-form-model.js";
import { evidenceRolesFromDraft, type EvidenceReceiptRef } from "./evidence-generation-gate.js";
import { getEvidenceVerificationReceipt } from "./evidence-verification-registry.js";
import { getVerifiedEvidenceBuffer } from "./verified-evidence-buffer-registry.js";

export interface ProjectEvidenceReportArtifact {
  filename: string;
  mimeType: "application/pdf";
  bytes: Uint8Array;
}

export async function buildProjectEvidenceReport(
  projectId: string,
  draft: TE1FormDraft,
  receipts: EvidenceReceiptRef[],
  generatedAt = new Date()
): Promise<ProjectEvidenceReportArtifact> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 42, right: 42, bottom: 42, left: 42 },
    info: {
      Title: `ORBI TE Studio - Informe de Evidencia - ${projectId}`,
      Author: "ORBI TE Studio"
    }
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(20).text("ORBI TE Studio - Informe de Evidencia TE1");
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#444444");
  doc.text(`Proyecto: ${draft.project.name || projectId}`);
  doc.text(`ID: ${projectId}`);
  doc.text(`Generado: ${generatedAt.toISOString()}`);
  doc.text(
    "Este informe documenta evidencia verificada por ORBI TE Studio. No constituye aprobación ni declaración SEC."
  );
  doc.fillColor("#000000");
  doc.moveDown();

  const roles = evidenceRolesFromDraft(draft);
  const sorted = receipts.slice().sort((a, b) =>
    a.evidenceId.localeCompare(b.evidenceId)
  );

  for (let index = 0; index < sorted.length; index += 1) {
    const ref = sorted[index]!;
    const receipt = getEvidenceVerificationReceipt(ref.token);
    if (!receipt) {
      throw new Error(
        `${ref.evidenceId}: comprobante no disponible para informe de evidencia.`
      );
    }

    const fileRoles = roles
      .filter((role) => role.evidenceId === ref.evidenceId)
      .map((role) => role.role)
      .sort();

    if (index > 0) doc.addPage();

    doc.fontSize(15).text(`Evidencia ${index + 1}`);
    doc.moveDown(0.4);
    doc.fontSize(10);
    doc.text(`Evidence ID: ${receipt.evidenceId}`);
    doc.text(`Rol(es): ${fileRoles.join(", ") || "Sin rol registrado"}`);
    doc.text(`Archivo: ${receipt.filename || "SIN NOMBRE"}`);
    doc.text(`Tipo: ${receipt.mimeType || "DESCONOCIDO"}`);
    doc.text(`Tamaño verificado: ${receipt.sizeBytes} bytes`);
    doc.text(`SHA-256: ${receipt.sha256}`);
    doc.text(`Verificado: ${receipt.verifiedAt}`);
    doc.moveDown();

    const bytes = getVerifiedEvidenceBuffer(ref.token);
    if (!bytes) {
      doc.fillColor("#8a1c1c");
      doc.text("Vista previa no disponible: bytes verificados no encontrados.");
      doc.fillColor("#000000");
      continue;
    }

    if (
      receipt.mimeType === "image/jpeg" ||
      receipt.mimeType === "image/png"
    ) {
      try {
        const maxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const maxHeight = 430;
        doc.image(bytes, {
          fit: [maxWidth, maxHeight],
          align: "center",
          valign: "center"
        });
      } catch {
        doc.fillColor("#8a1c1c");
        doc.text("No fue posible renderizar la imagen dentro del informe.");
        doc.fillColor("#000000");
      }
    } else if (receipt.mimeType === "image/webp") {
      doc.fillColor("#555555");
      doc.text(
        "Archivo WEBP verificado. La vista previa no se inserta en esta versión del generador PDF."
      );
      doc.fillColor("#000000");
    } else if (receipt.mimeType === "application/pdf") {
      doc.fillColor("#555555");
      doc.text(
        "PDF de evidencia verificado. Esta versión registra su identidad y SHA-256, sin rasterizar sus páginas dentro del informe."
      );
      doc.fillColor("#000000");
    }
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });

  return {
    filename: `${safeName(projectId)}_TE1_evidence_report.pdf`,
    mimeType: "application/pdf",
    bytes: new Uint8Array(Buffer.concat(chunks))
  };
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
