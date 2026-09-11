import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildProjectEvidenceReport } from "../src/server/project-evidence-report.js";
import { buildTE1PhotographicReport } from "../src/server/te1-photographic-report.js";
import {
  clearEvidenceVerificationReceipts,
  createEvidenceVerificationReceipt
} from "../src/server/evidence-verification-registry.js";
import {
  clearVerifiedEvidenceBuffers,
  storeVerifiedEvidenceBuffer
} from "../src/server/verified-evidence-buffer-registry.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

const PROJECT_ID = "TE1-QA-EVIDENCE";
const OUTPUT = join(
  process.cwd(),
  "artifacts",
  "qa-evidence-report"
);

const ONE_PIXEL_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZK6QAAAAASUVORK5CYII=";

async function main(): Promise<void> {
  clearEvidenceVerificationReceipts();
  clearVerifiedEvidenceBuffers();

  const bytes = Buffer.from(ONE_PIXEL_PNG, "base64");
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  const draft = createCasaGoyoDemoDraft();
  draft.project.name = "ORBI QA - Informe de Evidencia";
  draft.board.frontalEvidenceId = "EV-QA-BOARD";
  draft.board.frontalPhotoLabel = "qa-tablero.png";
  draft.review.reviewerName = "Revisor QA ORBI";

  const verifiedAt = new Date("2026-09-11T07:30:00.000Z");
  const receipt = createEvidenceVerificationReceipt(
    PROJECT_ID,
    "EV-QA-BOARD",
    sha256,
    verifiedAt,
    {
      filename: "qa-tablero.png",
      mimeType: "image/png",
      sizeBytes: bytes.byteLength
    }
  );

  storeVerifiedEvidenceBuffer(
    receipt.token,
    ONE_PIXEL_PNG,
    receipt.expiresAt
  );

  const refs = [
    {
      token: receipt.token,
      evidenceId: receipt.evidenceId,
      sha256: receipt.sha256
    }
  ];

  const [evidenceReport, photoReport] = await Promise.all([
    buildProjectEvidenceReport(
      PROJECT_ID,
      draft,
      refs,
      new Date("2026-09-11T07:31:00.000Z")
    ),
    buildTE1PhotographicReport(
      PROJECT_ID,
      draft,
      refs,
      new Date("2026-09-11T07:31:00.000Z")
    )
  ]);

  await mkdir(OUTPUT, { recursive: true });
  await writeFile(
    join(OUTPUT, evidenceReport.filename),
    Buffer.from(evidenceReport.bytes)
  );
  await writeFile(
    join(OUTPUT, photoReport.filename),
    Buffer.from(photoReport.bytes)
  );

  process.stdout.write(
    `Generated visual QA PDFs in ${OUTPUT}\n`
  );
}

void main();
