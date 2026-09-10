import type { ExportReadinessResult } from "../qa/export-readiness.js";
import type { ProjectManifest } from "./project-manifest.js";

export interface GeneratedDocument {
  id: string;
  filename: string;
  kind:
    | "electrical-plan"
    | "unilinear"
    | "load-schedule"
    | "verification-report"
    | "image-report"
    | "manifest";
  status: "generated" | "pending";
}

export interface TE1DocumentPackage {
  projectId: string;
  readiness: ExportReadinessResult["status"];
  documents: GeneratedDocument[];
  manifest: ProjectManifest;
}

export function buildTE1DocumentPackage(
  manifest: ProjectManifest,
  readiness: ExportReadinessResult,
  generated: Partial<Record<GeneratedDocument["kind"], string>>
): TE1DocumentPackage {
  const kinds: GeneratedDocument["kind"][] = [
    "electrical-plan",
    "unilinear",
    "load-schedule",
    "verification-report",
    "image-report",
    "manifest"
  ];

  return {
    projectId: manifest.projectId,
    readiness: readiness.status,
    documents: kinds.map((kind) => ({
      id: `${manifest.projectId}-${kind}`,
      filename: generated[kind] ?? "",
      kind,
      status: generated[kind] ? "generated" : "pending"
    })),
    manifest
  };
}
