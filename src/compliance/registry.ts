import type { ComplianceRule } from "./rule-types.js";
import { ric10Rules } from "./ric10.js";

/**
 * Rules enter this registry only after the exact SEC/RIC/RGR source clause
 * has been checked and recorded. Discovery-time assumptions must never be
 * promoted into executable compliance rules.
 */
export const complianceRules: ComplianceRule[] = [...ric10Rules];
