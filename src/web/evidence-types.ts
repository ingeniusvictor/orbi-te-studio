export type EvidenceCategory =
  | "board-front"
  | "board-internal"
  | "board-legend"
  | "location-sketch"
  | "architectural-plan"
  | "measured-sketch"
  | "legacy-plan"
  | "measurement"
  | "service"
  | "grounding"
  | "general";

export interface LocalEvidenceRecord {
  id: string;
  projectId: string;
  category: EvidenceCategory;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  lastModified: number;
  createdAt: string;
  notes: string;
  blob: Blob;
}

export interface LocalEvidenceMetadata {
  id: string;
  projectId: string;
  category: EvidenceCategory;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  lastModified: number;
  createdAt: string;
  notes: string;
}

export const EVIDENCE_MAX_FILE_BYTES = 20 * 1024 * 1024;

export const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

export function validateEvidenceFile(file: File): string[] {
  const issues: string[] = [];

  if (!ALLOWED_EVIDENCE_MIME_TYPES.has(file.type)) {
    issues.push(
      "Formato no soportado. Use PDF, JPG, PNG o WEBP."
    );
  }

  if (file.size <= 0) {
    issues.push("El archivo está vacío.");
  }

  if (file.size > EVIDENCE_MAX_FILE_BYTES) {
    issues.push("El archivo supera el límite local de 20 MB.");
  }

  return issues;
}

export function toEvidenceMetadata(
  record: LocalEvidenceRecord
): LocalEvidenceMetadata {
  const { blob: _blob, ...metadata } = record;
  return metadata;
}

export function formatEvidenceSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
