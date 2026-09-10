import type { TE1FormDraft } from "./te1-form-model.js";

export interface ApiGeneratedArtifact {
  filename: string;
  mimeType: string;
  encoding: "utf8" | "base64";
  content: string;
}

export interface GeneratePackageSuccess {
  ok: true;
  projectId: string;
  artifacts: ApiGeneratedArtifact[];
}

export interface GeneratePackageFailure {
  ok: false;
  code: string;
  message: string;
  issues: string[];
}

export type GeneratePackageResponse =
  | GeneratePackageSuccess
  | GeneratePackageFailure;

export async function requestTE1Package(
  draft: TE1FormDraft,
  projectId: string
): Promise<GeneratePackageResponse> {
  const response = await fetch("/api/te1/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ draft, projectId })
  });

  const body = (await response.json()) as GeneratePackageResponse;

  if (!response.ok) {
    if (body.ok) {
      throw new Error("La API devolvió un estado HTTP de error inconsistente.");
    }
    return body;
  }

  if (!body.ok) {
    throw new Error(body.message || "La API no pudo generar el paquete TE1.");
  }

  return body;
}

export function artifactToBlob(artifact: ApiGeneratedArtifact): Blob {
  if (artifact.encoding === "utf8") {
    return new Blob([artifact.content], { type: artifact.mimeType });
  }

  const binary = atob(artifact.content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: artifact.mimeType });
}

export function downloadArtifact(artifact: ApiGeneratedArtifact): void {
  const blob = artifactToBlob(artifact);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = artifact.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}


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

export interface EvidenceVerificationResponse {
  ok: boolean;
  algorithm: "SHA-256";
  verifiedAt: string;
  items: EvidenceVerificationItem[];
  message?: string;
  issues?: string[];
}

export async function requestEvidenceVerification(
  uploads: EvidenceVerificationUpload[]
): Promise<EvidenceVerificationResponse> {
  const response = await fetch("/api/te1/evidence/verify", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ uploads })
  });

  const body = (await response.json()) as EvidenceVerificationResponse;
  return body;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
