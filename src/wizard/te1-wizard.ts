export type TE1WizardStep =
  | "project"
  | "owner"
  | "location"
  | "board"
  | "circuits"
  | "loads"
  | "conductors"
  | "measurements"
  | "plans"
  | "compliance"
  | "review"
  | "export";

export type WizardStepStatus =
  | "locked"
  | "available"
  | "in-progress"
  | "complete"
  | "blocked";

export interface WizardStepState {
  id: TE1WizardStep;
  label: string;
  status: WizardStepStatus;
  issues: string[];
}

export interface TE1WizardState {
  projectId: string;
  currentStep: TE1WizardStep;
  steps: WizardStepState[];
}

const orderedSteps: Array<{ id: TE1WizardStep; label: string }> = [
  { id: "project", label: "Proyecto" },
  { id: "owner", label: "Propietario" },
  { id: "location", label: "Ubicación" },
  { id: "board", label: "Tablero" },
  { id: "circuits", label: "Circuitos" },
  { id: "loads", label: "Cargas" },
  { id: "conductors", label: "Conductores" },
  { id: "measurements", label: "Mediciones" },
  { id: "plans", label: "Planos" },
  { id: "compliance", label: "Verificación RIC" },
  { id: "review", label: "Revisión profesional" },
  { id: "export", label: "Paquete TE1" }
];

export function createTE1Wizard(projectId: string): TE1WizardState {
  return {
    projectId,
    currentStep: "project",
    steps: orderedSteps.map((step, index) => ({
      ...step,
      status: index === 0 ? "in-progress" : "locked",
      issues: []
    }))
  };
}

export function completeWizardStep(
  state: TE1WizardState,
  stepId: TE1WizardStep
): TE1WizardState {
  const index = state.steps.findIndex((step) => step.id === stepId);
  if (index < 0) throw new Error(`Unknown wizard step: ${stepId}`);

  const steps = state.steps.map((step) => ({
    ...step,
    issues: [...step.issues]
  }));

  const current = steps[index]!;
  if (current.status === "locked") {
    throw new Error(`Wizard step ${stepId} is locked`);
  }

  current.status = "complete";
  current.issues = [];

  const next = steps[index + 1];
  if (next && next.status === "locked") next.status = "available";

  return {
    ...state,
    currentStep: next?.id ?? stepId,
    steps
  };
}

export function blockWizardStep(
  state: TE1WizardState,
  stepId: TE1WizardStep,
  issues: string[]
): TE1WizardState {
  return {
    ...state,
    currentStep: stepId,
    steps: state.steps.map((step) =>
      step.id === stepId
        ? { ...step, status: "blocked", issues: [...issues] }
        : { ...step, issues: [...step.issues] }
    )
  };
}

export function wizardProgress(state: TE1WizardState): number {
  const completed = state.steps.filter((step) => step.status === "complete").length;
  return Math.round((completed / state.steps.length) * 100);
}
