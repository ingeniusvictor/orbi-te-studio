import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import type { SheetFormat, SheetOrientation } from "../drawing/sheet-model.js";
import { getSheetSizeMm } from "../drawing/a-series.js";

export interface PdfArtifact {
  filename: string;
  mimeType: "application/pdf";
  bytes: Uint8Array;
}

function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

export async function svgToPdfArtifact(
  filename: string,
  svg: string,
  format: SheetFormat,
  orientation: SheetOrientation
): Promise<PdfArtifact> {
  if (!filename.endsWith(".pdf")) {
    throw new Error("PDF artifact filename must end with .pdf");
  }
  if (!svg.includes("<svg")) {
    throw new Error("SVG content is invalid");
  }

  const size = getSheetSizeMm(format, orientation);
  const chunks: Buffer[] = [];

  const doc = new PDFDocument({
    autoFirstPage: false,
    compress: true
  });

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const complete = new Promise<Uint8Array>((resolve, reject) => {
    doc.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    doc.on("error", reject);
  });

  doc.addPage({
    size: [mmToPt(size.width), mmToPt(size.height)],
    margin: 0
  });

  SVGtoPDF(doc, svg, 0, 0, {
    width: mmToPt(size.width),
    height: mmToPt(size.height),
    preserveAspectRatio: "xMinYMin meet"
  });

  doc.end();

  return {
    filename,
    mimeType: "application/pdf",
    bytes: await complete
  };
}
