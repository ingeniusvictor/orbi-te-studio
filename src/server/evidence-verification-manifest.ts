import { createHash } from "node:crypto";
import { getEvidenceVerificationReceipt } from "./evidence-verification-registry.js";
import {
  evidenceRolesFromDraft,
  type EvidenceReceiptRef
} from "./evidence-generation-gate.js";
import type { TE1FormDraft } from "../web/te1-form-model.js";

export interface ServerEvidenceVerificationManifestEntry {
  evidenceId: string;
  roles: string[];
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  verifiedAt: string;
  receiptExpiresAt: string;
  receiptFingerprint: string;
  verifiedBy: "orbi-te-studio-api";
}

export interface ServerEvidenceVerificationManifest {
  schemaVersion: 1;
  projectId: string;
  generatedAt: string;
  algorithm: "SHA-256";
  verifier: "orbi-te-studio-api";
  entries: ServerEvidenceVerificationManifestEntry[];
}

export function buildServerEvidenceVerificationManifest(
  projectId: string,
  draft: TE1FormDraft,
  requested: EvidenceReceiptRef[],
  generatedAt = new Date()
): ServerEvidenceVerificationManifest {
  const roles = evidenceRolesFromDraft(draft);

  const entries: ServerEvidenceVerificationManifestEntry[] = [];

  for (const item of requested) {
    const receipt = getEvidenceVerificationReceipt(item.token);
    if (!receipt) {
      throw new Error(
        `${item.evidenceId}: no existe un comprobante server-side activo.`
      );
    }

    if (
      receipt.projectId !== projectId ||
      receipt.evidenceId !== item.evidenceId ||
      receipt.sha256 !== item.sha256.toLowerCase()
    ) {
      throw new Error(
        `${item.evidenceId}: el comprobante no corresponde al proyecto, evidencia o hash solicitado.`
      );
    }

    entries.push({
      evidenceId: receipt.evidenceId,
      roles: roles
        .filter((ref) => ref.evidenceId === receipt.evidenceId)
        .map((ref) => ref.role)
        .sort(),
      filename: receipt.filename,
      mimeType: receipt.mimeType,
      sizeBytes: receipt.sizeBytes,
      sha256: receipt.sha256,
      verifiedAt: receipt.verifiedAt,
      receiptExpiresAt: receipt.expiresAt,
      receiptFingerprint: createHash("sha256")
        .update(receipt.token)
        .digest("hex"),
      verifiedBy: "orbi-te-studio-api"
    });
  }

  return {
    schemaVersion: 1,
    projectId,
    generatedAt: generatedAt.toISOString(),
    algorithm: "SHA-256",
    verifier: "orbi-te-studio-api",
    entries: entries.sort((a, b) =>
      a.evidenceId.localeCompare(b.evidenceId)
    )
  };
}

export function serverEvidenceVerificationManifestToJson(
  manifest: ServerEvidenceVerificationManifest
): string {
  return JSON.stringify(manifest, null, 2);
}
