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
