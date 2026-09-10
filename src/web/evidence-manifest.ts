import { auditEvidenceLinks } from "./evidence-link-audit.js";
import type { LocalEvidenceMetadata } from "./evidence-types.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export interface EvidenceManifestEntry {
  evidenceId: string;
  role: string;
  filename: string;
  category: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  createdAt: string;
}

export interface EvidenceManifest {
  schemaVersion: 1;
  projectId: string;
  generatedAt: string;
  algorithm: "SHA-256";
  entries: EvidenceManifestEntry[];
}

export function buildEvidenceManifest(
  projectId: string,
  draft: TE1FormDraft,
  evidence: LocalEvidenceMetadata[],
  generatedAt = new Date()
): EvidenceManifest {
  const audit = auditEvidenceLinks(draft, evidence);
  if (!audit.valid) {
    throw new Error(
      `No se puede generar el manifest de evidencia: ${audit.issues.join(" ")}`
    );
  }

  const byId = new Map(evidence.map((item) => [item.id, item]));
  const links: Array<{ id: string; role: string }> = [
    {
      id: draft.board.frontalEvidenceId,
      role: "board.front"
    },
    {
      id: draft.location.locationSketchEvidenceId,
      role: "location.sketch"
    },
    {
      id: draft.plan.sourceEvidenceId,
      role: "plan.source"
    }
  ];

  if (draft.board.legendEvidenceId) {
    links.push({
      id: draft.board.legendEvidenceId,
      role: "board.legend"
    });
  }

  for (const measurement of draft.measurements) {
    links.push({
      id: measurement.evidenceId,
      role: `measurement.${measurement.kind}`
    });
  }

  const unique = new Map<string, EvidenceManifestEntry>();
  for (const link of links) {
    const item = byId.get(link.id);
    if (!item) continue;

    const key = `${link.role}::${item.id}`;
    unique.set(key, {
      evidenceId: item.id,
      role: link.role,
      filename: item.filename,
      category: item.category,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      sha256: item.sha256,
      createdAt: item.createdAt
    });
  }

  return {
    schemaVersion: 1,
    projectId,
    generatedAt: generatedAt.toISOString(),
    algorithm: "SHA-256",
    entries: [...unique.values()]
  };
}

export function evidenceManifestToJson(manifest: EvidenceManifest): string {
  return JSON.stringify(manifest, null, 2);
}
