import type { VisionEvidenceKind } from "../ai/vision-provider.js";

export interface VisionAnalyzeRequest {
  projectId: string;
  receiptToken: string;
  evidenceId: string;
  kind: VisionEvidenceKind;
  instruction: string;
}

export interface VisionRequestValidationResult {
  ok: boolean;
  value?: VisionAnalyzeRequest;
  issues: string[];
}

const KINDS = new Set<VisionEvidenceKind>([
  "board-front",
  "board-internal",
  "board-legend",
  "architectural-plan",
  "measured-sketch",
  "legacy-plan",
  "measurement",
  "service",
  "grounding",
  "general"
]);

export function validateVisionAnalyzeRequest(
  payload: unknown
): VisionRequestValidationResult {
  if (!isRecord(payload)) {
    return {
      ok: false,
      issues: ["El cuerpo debe ser un objeto JSON."]
    };
  }

  const issues: string[] = [];
  const projectId = field(payload, "projectId", 120, issues);
  const receiptToken = field(
    payload,
    "receiptToken",
    200,
    issues
  );
  const evidenceId = field(payload, "evidenceId", 160, issues);
  const instruction = field(
    payload,
    "instruction",
    4000,
    issues
  );
  const kindRaw = field(payload, "kind", 80, issues);

  if (!KINDS.has(kindRaw as VisionEvidenceKind)) {
    issues.push("kind no corresponde a una categoría visual soportada.");
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      projectId,
      receiptToken,
      evidenceId,
      kind: kindRaw as VisionEvidenceKind,
      instruction
    },
    issues: []
  };
}

function field(
  object: Record<string, unknown>,
  key: string,
  max: number,
  issues: string[]
): string {
  const value = object[key];
  if (typeof value !== "string") {
    issues.push(`${key} debe ser texto.`);
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    issues.push(`${key} es obligatorio.`);
  }
  if (value.length > max) {
    issues.push(`${key} supera ${max} caracteres.`);
  }

  return trimmed;
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}
