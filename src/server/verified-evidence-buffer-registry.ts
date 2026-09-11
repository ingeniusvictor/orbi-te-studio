const verifiedEvidenceBuffers = new Map<string, Buffer>();

export function storeVerifiedEvidenceBuffer(
  receiptToken: string,
  contentBase64: string
): void {
  verifiedEvidenceBuffers.set(
    receiptToken,
    Buffer.from(contentBase64, "base64")
  );
}

export function getVerifiedEvidenceBuffer(
  receiptToken: string
): Buffer | undefined {
  const value = verifiedEvidenceBuffers.get(receiptToken);
  return value ? Buffer.from(value) : undefined;
}

export function consumeVerifiedEvidenceBuffers(
  receiptTokens: string[]
): void {
  for (const token of receiptTokens) {
    verifiedEvidenceBuffers.delete(token);
  }
}

export function clearVerifiedEvidenceBuffers(): void {
  verifiedEvidenceBuffers.clear();
}
