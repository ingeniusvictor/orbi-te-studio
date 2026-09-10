import { createHash } from "node:crypto";

const MAX_EVIDENCE_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

export interface EvidenceVerificationUpload {
  evidenceId: string;
  filename: string;
  mimeType: string;
  expectedSha256: string;
  contentBase64: string;
}

export interface EvidenceVerificationItem {
  evidenceId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  expectedSha256: string;
  actualSha256: string;
  verified: boolean;
  issues: string[];
}

export interface EvidenceVerificationResult {
  ok: boolean;
  algorithm: "SHA-256";
  verifiedAt: string;
  items: EvidenceVerificationItem[];
}

export function verifyEvidenceUploads(
  uploads: EvidenceVerificationUpload[],
  verifiedAt = new Date()
): EvidenceVerificationResult {
  const items = uploads.map((upload) => verifyOne(upload));

  return {
    ok: items.length > 0 && items.every((item) => item.verified),
    algorithm: "SHA-256",
    verifiedAt: verifiedAt.toISOString(),
    items
  };
}

function verifyOne(
  upload: EvidenceVerificationUpload
): EvidenceVerificationItem {
  const issues: string[] = [];
  const expected = upload.expectedSha256.trim().toLowerCase();

  if (!upload.evidenceId.trim()) issues.push("evidenceId es obligatorio.");
  if (!upload.filename.trim()) issues.push("filename es obligatorio.");

  if (!ALLOWED_MIME_TYPES.has(upload.mimeType)) {
    issues.push("MIME type no permitido.");
  }

  if (!/^[a-f0-9]{64}$/.test(expected)) {
    issues.push("expectedSha256 no es un SHA-256 hexadecimal válido.");
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(upload.contentBase64, "base64");
  } catch {
    bytes = Buffer.alloc(0);
    issues.push("contentBase64 no es válido.");
  }

  if (bytes.byteLength <= 0) {
    issues.push("El archivo recibido está vacío.");
  }

  if (bytes.byteLength > MAX_EVIDENCE_FILE_BYTES) {
    issues.push("El archivo recibido supera 20 MB.");
  }

  const actualSha256 = createHash("sha256").update(bytes).digest("hex");
  if (/^[a-f0-9]{64}$/.test(expected) && actualSha256 !== expected) {
    issues.push("La huella SHA-256 recibida no coincide con los bytes del archivo.");
  }

  return {
    evidenceId: upload.evidenceId,
    filename: upload.filename,
    mimeType: upload.mimeType,
    sizeBytes: bytes.byteLength,
    expectedSha256: expected,
    actualSha256,
    verified: issues.length === 0,
    issues
  };
}
