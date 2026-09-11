import type { Finding } from "../domain/findings.js";
import type { TE1Project } from "../domain/types.js";
import type { ChecklistItem } from "../field/checklist.js";

export type ExportReadiness =
  | "blocked"
  | "field-data-incomplete"
  | "ready-for-professional-review"
  | "approved-for-export";

export interface ExportReadinessResult {
  status: ExportReadiness;
  reasons: string[];
}

export function evaluateExportReadiness(
  project: TE1Project,
  checklist: ChecklistItem[],
  findings: Finding[]
): ExportReadinessResult {
  const blockers = findings.filter((finding) => finding.severity === "blocker");
  if (blockers.length > 0) {
    return {
      status: "blocked",
      reasons: blockers.map((finding) => finding.message)
    };
  }

  const missing = checklist.filter((item) => item.status === "missing");
  if (missing.length > 0) {
    return {
      status: "field-data-incomplete",
      reasons: missing.map((item) => item.message)
    };
  }

  if (project.professionalReview.status !== "approved") {
    return {
      status: "ready-for-professional-review",
      reasons: ["El proyecto aún no cuenta con aprobación profesional explícita."]
    };
  }

  return {
    status: "approved-for-export",
    reasons: []
  };
}
