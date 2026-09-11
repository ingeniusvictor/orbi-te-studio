const DEFAULT_TTL_MS = 15 * 60 * 1000;
const MAX_TOTAL_BUFFER_BYTES = 100 * 1024 * 1024;

interface VerifiedEvidenceBufferRecord {
  bytes: Buffer;
  expiresAt: number;
}

const verifiedEvidenceBuffers = new Map<
  string,
  VerifiedEvidenceBufferRecord
>();

export function storeVerifiedEvidenceBuffer(
  receiptToken: string,
  contentBase64: string,
  expiresAt?: string
): void {
  pruneExpiredVerifiedEvidenceBuffers();

  const bytes = Buffer.from(contentBase64, "base64");
  const expiry = expiresAt
    ? new Date(expiresAt).getTime()
    : Date.now() + DEFAULT_TTL_MS;

  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    throw new Error(
      "No se puede almacenar evidencia con expiración inválida o vencida."
    );
  }

  const current = totalVerifiedEvidenceBufferBytes();
  const previous =
    verifiedEvidenceBuffers.get(receiptToken)?.bytes.byteLength ?? 0;
  const projected = current - previous + bytes.byteLength;

  if (projected > MAX_TOTAL_BUFFER_BYTES) {
    throw new Error(
      "El buffer temporal de evidencia supera el límite total de 100 MB."
    );
  }

  verifiedEvidenceBuffers.set(receiptToken, {
    bytes,
    expiresAt: expiry
  });
}

export function getVerifiedEvidenceBuffer(
  receiptToken: string
): Buffer | undefined {
  const record = verifiedEvidenceBuffers.get(receiptToken);
  if (!record) return undefined;

  if (record.expiresAt <= Date.now()) {
    verifiedEvidenceBuffers.delete(receiptToken);
    return undefined;
  }

  return Buffer.from(record.bytes);
}

export function consumeVerifiedEvidenceBuffers(
  receiptTokens: string[]
): void {
  for (const token of receiptTokens) {
    verifiedEvidenceBuffers.delete(token);
  }
}

export function pruneExpiredVerifiedEvidenceBuffers(
  now = new Date()
): number {
  let removed = 0;
  const threshold = now.getTime();

  for (const [token, record] of verifiedEvidenceBuffers) {
    if (record.expiresAt <= threshold) {
      verifiedEvidenceBuffers.delete(token);
      removed += 1;
    }
  }

  return removed;
}

export function totalVerifiedEvidenceBufferBytes(): number {
  let total = 0;
  for (const record of verifiedEvidenceBuffers.values()) {
    total += record.bytes.byteLength;
  }
  return total;
}

export function clearVerifiedEvidenceBuffers(): void {
  verifiedEvidenceBuffers.clear();
}
