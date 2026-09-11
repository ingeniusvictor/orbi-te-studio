import { getEvidenceBlob } from "./evidence-store.js";
import type { EvidenceManifest } from "./evidence-manifest.js";
import {
  blobToBase64,
  type EvidenceVerificationUpload
} from "./generation-api.js";

export async function buildEvidenceVerificationUploads(
  manifest: EvidenceManifest
): Promise<EvidenceVerificationUpload[]> {
  const ids = [...new Set(manifest.entries.map((entry) => entry.evidenceId))];
  const uploads: EvidenceVerificationUpload[] = [];

  for (const id of ids) {
    const record = await getEvidenceBlob(id);
    if (!record) {
      throw new Error(
        `La evidencia ${id} ya no existe en el almacenamiento local.`
      );
    }

    const manifestEntry = manifest.entries.find(
      (entry) => entry.evidenceId === id
    );
    if (!manifestEntry) continue;

    uploads.push({
      evidenceId: id,
      filename: record.filename,
      mimeType: record.mimeType,
      expectedSha256: manifestEntry.sha256,
      contentBase64: await blobToBase64(record.blob)
    });
  }

  return uploads;
}
