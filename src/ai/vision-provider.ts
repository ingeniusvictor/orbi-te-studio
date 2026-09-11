export type VisionEvidenceKind =
  | "board-front"
  | "board-internal"
  | "board-legend"
  | "architectural-plan"
  | "measured-sketch"
  | "legacy-plan"
  | "measurement"
  | "service"
  | "grounding"
  | "general";

export interface VisionEvidenceInput {
  evidenceId: string;
  kind: VisionEvidenceKind;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  bytes: Uint8Array;
}

export interface VisionObservation {
  field: string;
  value: string;
  confidence: "high" | "medium" | "low" | "unknown";
  status: "OBSERVED" | "PENDING";
  evidenceId: string;
  note: string;
}

export interface VisionAnalysisResult {
  provider: string;
  model: string;
  observations: VisionObservation[];
  warnings: string[];
}

export interface VisionProvider {
  readonly id: string;
  readonly model: string;

  analyze(
    evidence: VisionEvidenceInput,
    instruction: string
  ): Promise<VisionAnalysisResult>;
}

/**
 * Vision output is deliberately observation-only.
 * It must never directly mutate TE1/TE4 engineering values,
 * compliance state, calculations, or professional approval.
 */
export function isObservationOnlyStatus(
  value: string
): value is VisionObservation["status"] {
  return value === "OBSERVED" || value === "PENDING";
}
