import { createHash } from "node:crypto";

export interface PackageArtifactInput {
  filename: string;
  mimeType: string;
  encoding: "utf8" | "base64";
  content: string;
}

export interface TE1PackageIndexEntry {
  filename: string;
  mimeType: string;
  encoding: "utf8" | "base64";
  sizeBytes: number;
  sha256: string;
}

export interface TE1PackageIndex {
  schemaVersion: 1;
  projectId: string;
  generatedAt: string;
  algorithm: "SHA-256";
  artifactCount: number;
  artifacts: TE1PackageIndexEntry[];
}

export function buildTE1PackageIndex(
  projectId: string,
  artifacts: PackageArtifactInput[],
  generatedAt = new Date()
): TE1PackageIndex {
  const entries = artifacts.map((artifact) => {
    const bytes =
      artifact.encoding === "base64"
        ? Buffer.from(artifact.content, "base64")
        : Buffer.from(artifact.content, "utf8");

    return {
      filename: artifact.filename,
      mimeType: artifact.mimeType,
      encoding: artifact.encoding,
      sizeBytes: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex")
    };
  });

  return {
    schemaVersion: 1,
    projectId,
    generatedAt: generatedAt.toISOString(),
    algorithm: "SHA-256",
    artifactCount: entries.length,
    artifacts: entries.sort((a, b) => a.filename.localeCompare(b.filename))
  };
}

export function te1PackageIndexToJson(index: TE1PackageIndex): string {
  return JSON.stringify(index, null, 2);
}
