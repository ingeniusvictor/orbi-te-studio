import type { EvidenceManifest } from "../web/evidence-manifest.js";
import type { EvidenceReceiptRef } from "./evidence-generation-gate.js";

export function validateEvidenceManifestAgainstReceipts(
  projectId: string,
  manifest: EvidenceManifest,
  receipts: EvidenceReceiptRef[]
): string[] {
  const issues: string[] = [];

  if (manifest.projectId !== projectId) {
    issues.push("El projectId del evidence manifest no coincide.");
  }

  if (manifest.algorithm !== "SHA-256") {
    issues.push("El evidence manifest debe usar SHA-256.");
  }

  const receiptHashes = new Map(
    receipts.map((receipt) => [
      receipt.evidenceId,
      receipt.sha256.toLowerCase()
    ])
  );

  const manifestIds = new Set<string>();

  for (const entry of manifest.entries) {
    manifestIds.add(entry.evidenceId);
    const expectedHash = receiptHashes.get(entry.evidenceId);

    if (!expectedHash) {
      issues.push(
        `${entry.evidenceId}: aparece en evidence manifest pero no tiene receipt verificado.`
      );
      continue;
    }

    if (entry.sha256.toLowerCase() !== expectedHash) {
      issues.push(
        `${entry.evidenceId}: SHA-256 del evidence manifest no coincide con el receipt.`
      );
    }
  }

  for (const receipt of receipts) {
    if (!manifestIds.has(receipt.evidenceId)) {
      issues.push(
        `${receipt.evidenceId}: receipt verificado ausente del evidence manifest.`
      );
    }
  }

  return issues;
}
