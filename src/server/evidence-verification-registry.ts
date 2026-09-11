import { randomUUID } from "node:crypto";

const RECEIPT_TTL_MS = 15 * 60 * 1000;

export interface EvidenceVerificationReceipt {
  token: string;
  projectId: string;
  evidenceId: string;
  sha256: string;
  verifiedAt: string;
  expiresAt: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

const receipts = new Map<string, EvidenceVerificationReceipt>();

export function createEvidenceVerificationReceipt(
  projectId: string,
  evidenceId: string,
  sha256: string,
  now = new Date(),
  metadata: {
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
  } = {}
): EvidenceVerificationReceipt {
  const receipt: EvidenceVerificationReceipt = {
    token: randomUUID(),
    projectId,
    evidenceId,
    sha256,
    verifiedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RECEIPT_TTL_MS).toISOString(),
    filename: metadata.filename ?? "",
    mimeType: metadata.mimeType ?? "",
    sizeBytes: metadata.sizeBytes ?? 0
  };
  receipts.set(receipt.token, receipt);
  return receipt;
}

export function validateEvidenceVerificationReceipts(
  projectId: string,
  requested: Array<{
    token: string;
    evidenceId: string;
    sha256: string;
  }>,
  now = new Date()
): string[] {
  const issues: string[] = [];

  if (requested.length === 0) {
    return ["No se recibieron comprobantes de verificación de evidencia."];
  }

  for (const item of requested) {
    const receipt = receipts.get(item.token);
    if (!receipt) {
      issues.push(`${item.evidenceId}: comprobante inexistente o expirado.`);
      continue;
    }

    if (new Date(receipt.expiresAt).getTime() <= now.getTime()) {
      receipts.delete(item.token);
      issues.push(`${item.evidenceId}: comprobante de verificación expirado.`);
      continue;
    }

    if (receipt.projectId !== projectId) {
      issues.push(`${item.evidenceId}: comprobante pertenece a otro proyecto.`);
    }
    if (receipt.evidenceId !== item.evidenceId) {
      issues.push(`${item.evidenceId}: evidencia no coincide con el comprobante.`);
    }
    if (receipt.sha256 !== item.sha256.toLowerCase()) {
      issues.push(`${item.evidenceId}: SHA-256 no coincide con el comprobante.`);
    }
  }

  return issues;
}

export function getEvidenceVerificationReceipt(
  token: string
): EvidenceVerificationReceipt | undefined {
  const receipt = receipts.get(token);
  return receipt ? { ...receipt } : undefined;
}

export function consumeEvidenceVerificationReceipts(
  tokens: string[]
): void {
  for (const token of tokens) {
    receipts.delete(token);
  }
}

export function clearEvidenceVerificationReceipts(): void {
  receipts.clear();
}
