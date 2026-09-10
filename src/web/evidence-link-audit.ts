import { listEvidence } from "./evidence-store.js";
import type {
  EvidenceCategory,
  LocalEvidenceMetadata
} from "./evidence-types.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export interface EvidenceLinkAudit {
  valid: boolean;
  issues: string[];
}

interface RequiredLink {
  label: string;
  id: string;
  categories: EvidenceCategory[];
}

export function auditEvidenceLinks(
  draft: TE1FormDraft,
  evidence: LocalEvidenceMetadata[]
): EvidenceLinkAudit {
  const required: RequiredLink[] = [
    {
      label: "Foto frontal del tablero",
      id: draft.board.frontalEvidenceId,
      categories: ["board-front"]
    },
    {
      label: "Croquis de ubicación",
      id: draft.location.locationSketchEvidenceId,
      categories: ["location-sketch"]
    }
  ];

  if (draft.board.legendEvidenceId) {
    required.push({
      label: "Leyenda del tablero",
      id: draft.board.legendEvidenceId,
      categories: ["board-legend"]
    });
  }

  for (const measurement of draft.measurements) {
    required.push({
      label: `Medición ${measurement.kind}`,
      id: measurement.evidenceId,
      categories: ["measurement"]
    });
  }

  required.push({
    label: "Fuente de plano",
    id: draft.plan.sourceEvidenceId,
    categories: expectedPlanCategories(draft.plan.sourceType)
  });

  const byId = new Map(evidence.map((item) => [item.id, item]));
  const issues: string[] = [];

  for (const link of required) {
    if (!link.id) {
      issues.push(`${link.label}: sin evidencia vinculada.`);
      continue;
    }

    const item = byId.get(link.id);
    if (!item) {
      issues.push(`${link.label}: el archivo vinculado ya no existe.`);
      continue;
    }

    if (!link.categories.includes(item.category)) {
      issues.push(
        `${link.label}: categoría incompatible (${item.category}).`
      );
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export async function auditProjectEvidenceLinks(
  projectId: string,
  draft: TE1FormDraft
): Promise<EvidenceLinkAudit> {
  const evidence = await listEvidence(projectId);
  return auditEvidenceLinks(draft, evidence);
}

function expectedPlanCategories(
  sourceType: TE1FormDraft["plan"]["sourceType"]
): EvidenceCategory[] {
  if (sourceType === "architectural-plan") return ["architectural-plan"];
  if (sourceType === "legacy-plan") return ["legacy-plan"];
  if (sourceType === "measured-sketch") return ["measured-sketch"];
  return ["architectural-plan", "measured-sketch", "legacy-plan", "general"];
}
