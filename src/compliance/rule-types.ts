import type { FindingSeverity } from "../domain/findings.js";
import type { TE1Project } from "../domain/types.js";

export interface RuleSource {
  authority: "SEC";
  document: string;
  version?: string;
  effectiveFrom?: string;
  url?: string;
  section: string;
  verifiedAt: string;
}

export interface ComplianceRule {
  id: string;
  title: string;
  projectType: "TE1" | "TE4";
  severity: FindingSeverity;
  source: RuleSource;
  evaluate(project: TE1Project): {
    status: "pass" | "warning" | "blocker" | "not-verifiable";
    message: string;
  };
}
