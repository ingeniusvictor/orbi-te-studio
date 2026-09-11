import type { ComplianceRule } from "../compliance/rule-types.js";
import { complianceRules } from "../compliance/registry.js";
import { validateRic18Presentation } from "../compliance/ric18-presentation.js";
import { draftToTE1Project } from "./draft-to-project.js";
import type { TE1FormDraft } from "./te1-form-model.js";
import { hasRenderableLocationSketch } from "./location-sketch-readiness.js";

export type ComplianceDisplayStatus =
  | "pass"
  | "warning"
  | "blocker"
  | "not-verifiable";

export interface ComplianceDisplayItem {
  code: string;
  title: string;
  section: string;
  status: ComplianceDisplayStatus;
  message: string;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface ComplianceSummary {
  items: ComplianceDisplayItem[];
  passCount: number;
  blockerCount: number;
  warningCount: number;
  notVerifiableCount: number;
  ready: boolean;
}

function fromRule(
  rule: ComplianceRule,
  draft: TE1FormDraft
): ComplianceDisplayItem {
  const project = draftToTE1Project(draft);
  const result = rule.evaluate(project);

  return {
    code: rule.id,
    title: rule.title,
    section: rule.source.section,
    status: result.status,
    message: result.message,
    sourceLabel: `${rule.source.document} · § ${rule.source.section}`,
    ...(rule.source.url ? { sourceUrl: rule.source.url } : {})
  };
}

export function buildComplianceSummary(
  draft: TE1FormDraft
): ComplianceSummary {
  const ric10 = complianceRules
    .filter((rule) => rule.projectType === "TE1")
    .map((rule) => fromRule(rule, draft));

  const ric18 = validateRic18Presentation({
    isFirstSheet: true,
    hasGeoreference: Boolean(
      draft.location.wgs84.trim() || draft.location.utm.trim()
    ),
    hasLocationSketch: hasRenderableLocationSketch(draft),
    destination: draft.project.destination,
    sheetNumber: 1,
    sheetTotal: 1,
    hasSymbolLegend: true,
    usesAnnex18_2TitleBlock: true
  }).map<ComplianceDisplayItem>((finding) => ({
    code: finding.code,
    title: titleForRic18(finding.code),
    section: finding.section,
    status: finding.status,
    message: finding.message,
    sourceLabel: `RIC N°18 · § ${finding.section}`
  }));

  const items = [...ric10, ...ric18];
  const passCount = items.filter((item) => item.status === "pass").length;
  const blockerCount = items.filter((item) => item.status === "blocker").length;
  const warningCount = items.filter((item) => item.status === "warning").length;
  const notVerifiableCount = items.filter(
    (item) => item.status === "not-verifiable"
  ).length;

  return {
    items,
    passCount,
    blockerCount,
    warningCount,
    notVerifiableCount,
    ready: blockerCount === 0 && notVerifiableCount === 0
  };
}

function titleForRic18(code: string): string {
  const titles: Record<string, string> = {
    "RIC18-6.3.4-TITLE-BLOCK": "Rotulación de la lámina",
    "RIC18-6.3.5-GEOREFERENCE": "Georreferenciación de primera lámina",
    "RIC18-6.3.6-LOCATION-SKETCH": "Croquis de ubicación",
    "RIC18-6.3.7-SHEET-ID": "Identificación y numeración de lámina",
    "RIC18-6.3.9-SYMBOL-LEGEND": "Cuadro de simbología"
  };

  return titles[code] ?? code;
}
