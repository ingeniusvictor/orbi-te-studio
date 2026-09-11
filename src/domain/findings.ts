export type FindingSeverity = "info" | "warning" | "blocker";

export interface Finding {
  code: string;
  severity: FindingSeverity;
  message: string;
  field?: string;
  circuitId?: string;
  sourceRule?: string;
}

export interface ValidationResult {
  readyForProfessionalReview: boolean;
  findings: Finding[];
}
