import { buildComplianceSummary } from "./compliance-summary.js";
import type { TE1FormDraft } from "./te1-form-model.js";
import { validateFormStep } from "./te1-form-validation.js";

export interface ReviewGateItem {
  id: string;
  label: string;
  completed: boolean;
  detail: string;
}

export interface ReviewGateSummary {
  items: ReviewGateItem[];
  readyForApproval: boolean;
}

export function buildReviewGateSummary(
  draft: TE1FormDraft
): ReviewGateSummary {
  const compliance = buildComplianceSummary(draft);

  const items: ReviewGateItem[] = [
    {
      id: "IDENTITY",
      label: "Identificación del proyecto",
      completed:
        validateFormStep("project", draft).valid &&
        validateFormStep("owner", draft).valid &&
        validateFormStep("location", draft).valid,
      detail: "Proyecto, propietario, dirección y georreferencia."
    },
    {
      id: "BOARD",
      label: "Tablero y circuitos",
      completed:
        validateFormStep("board", draft).valid &&
        validateFormStep("circuits", draft).valid,
      detail: "Protecciones, circuitos y evidencia frontal."
    },
    {
      id: "DESIGN",
      label: "Cargas y conductores",
      completed:
        validateFormStep("loads", draft).valid &&
        validateFormStep("conductors", draft).valid,
      detail: "Potencias y conductores respaldados."
    },
    {
      id: "MEASUREMENTS",
      label: "Mediciones",
      completed: validateFormStep("measurements", draft).valid,
      detail: "Ensayos registrados y verificados con evidencia."
    },
    {
      id: "PLANS",
      label: "Planos",
      completed: validateFormStep("plans", draft).valid,
      detail: "Fuente geométrica revisada y suficiente."
    },
    {
      id: "COMPLIANCE",
      label: "Verificación RIC",
      completed: compliance.ready,
      detail: "Sin blockers ni reglas no verificables de las reglas implementadas."
    }
  ];

  return {
    items,
    readyForApproval: items.every((item) => item.completed)
  };
}
