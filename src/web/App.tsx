import { useMemo, useState } from "react";
import {
  blockWizardStep,
  completeWizardStep,
  createTE1Wizard,
  wizardProgress,
  type TE1WizardState
} from "../wizard/te1-wizard.js";
import { casaGoyoReference } from "../reference/casa-goyo.js";
import { casaGoyoFieldIntake } from "../reference/casa-goyo-intake.js";
import { buildMinimumFieldChecklist } from "../field/checklist.js";
import { validateTE1 } from "../engine/validate-te1.js";
import { buildProjectManifest } from "../export/project-manifest.js";
import { draftToTE1Project } from "./draft-to-project.js";
import { StepForm } from "./StepForm.js";
import {
  createCasaGoyoDemoDraft,
  createEmptyTE1FormDraft,
  type TE1FormDraft
} from "./te1-form-model.js";
import { validateFormStep } from "./te1-form-validation.js";
import { DrawingPreview } from "./DrawingPreview.js";
import { createProjectId } from "./project-storage.js";
import { useProjectStorage } from "./use-project-storage.js";
import { EvidenceManager } from "./EvidenceManager.js";
import { deleteProjectEvidence } from "./evidence-store.js";
import { applyTechnicalDraftChange, technicalDraftFingerprint } from "./review-integrity.js";
import { appendProjectAuditEvent } from "./audit-log.js";
import { LocalAssistantPanel } from "./LocalAssistantPanel.js";

type ProjectMode = "home" | "te1";

export function App() {
  const [mode, setMode] = useState<ProjectMode>("home");
  const [wizard, setWizard] = useState<TE1WizardState>(() =>
    createTE1Wizard(casaGoyoReference.id)
  );
  const [draft, setDraft] = useState<TE1FormDraft>(() =>
    createCasaGoyoDemoDraft()
  );
  const [saveNotice, setSaveNotice] = useState("");
  const projectStorage = useProjectStorage();

  const checklist = useMemo(
    () => buildMinimumFieldChecklist(casaGoyoFieldIntake),
    []
  );
  const liveProject = useMemo(
    () => draftToTE1Project(draft, wizard.projectId),
    [draft, wizard.projectId]
  );
  const validation = useMemo(() => validateTE1(liveProject), [liveProject]);
  const manifest = useMemo(() => buildProjectManifest(liveProject), [liveProject]);

  const startProject = (demo: boolean) => {
    const projectId = demo ? casaGoyoReference.id : createProjectId();
    setDraft(demo ? createCasaGoyoDemoDraft() : createEmptyTE1FormDraft());
    setWizard(createTE1Wizard(projectId));
    setSaveNotice("");
    setMode("te1");
  };

  const openStoredProject = (projectId: string) => {
    const stored = projectStorage.load(projectId);
    if (!stored) return;
    setDraft(stored.draft);
    setWizard(stored.wizard);
    setSaveNotice("");
    setMode("te1");
  };

  const updateDraft = (next: TE1FormDraft) => {
    const result = applyTechnicalDraftChange(draft, next);
    setDraft(result.draft);
    if (result.invalidated) {
      if (typeof window !== "undefined") {
        void appendProjectAuditEvent(window.localStorage, {
          projectId: wizard.projectId,
          action: "approval-invalidated",
          actor: draft.review.reviewerName.trim() || "ORBI TE Studio",
          revisionFingerprint: technicalDraftFingerprint(result.draft),
          details: result.draft.review.invalidationReason
        });
      }
      setSaveNotice(
        "La aprobación profesional quedó invalidada porque cambió información técnica del proyecto."
      );
    } else {
      setSaveNotice("");
    }
  };

  const saveProject = () => {
    projectStorage.save(wizard.projectId, draft, wizard);
    setSaveNotice("Proyecto guardado localmente en este navegador.");
  };

  const deleteProject = async (projectId: string) => {
    projectStorage.remove(projectId);
    try {
      await deleteProjectEvidence(projectId);
    } catch {
      // Project metadata deletion remains valid even if binary cleanup is unavailable.
    }
  };

  if (mode === "home") {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">ORBI ECOSYSTEM</p>
            <h1>ORBI TE Studio</h1>
            <p className="subtitle">
              Ingeniería eléctrica asistida por IA · TE1 · TE4 · RIC · RGR
            </p>
          </div>
          <span className="status-pill">Foundation v0.1</span>
        </header>

        <section className="hero-card">
          <div>
            <p className="eyebrow">NUEVO PROYECTO</p>
            <h2>¿Qué declaración deseas preparar?</h2>
            <p>
              El sistema organiza evidencia, cálculos, revisión normativa,
              planos y paquete documental sin ocultar datos pendientes.
            </p>
          </div>

          <div className="project-grid">
            <button className="project-card active" onClick={() => startProject(false)}>
              <span className="project-code">TE1</span>
              <strong>Instalación eléctrica interior</strong>
              <small>Crear un proyecto nuevo desde cero.</small>
            </button>

            <button className="project-card demo" onClick={() => startProject(true)}>
              <span className="project-code">DEMO</span>
              <strong>Casa Goyo - Osorno</strong>
              <small>Abrir el caso de referencia con datos parciales.</small>
            </button>

            <button className="project-card disabled" disabled>
              <span className="project-code">TE4</span>
              <strong>Generación distribuida</strong>
              <small>Próxima fase · Fotovoltaico y RGR.</small>
            </button>
          </div>
          {projectStorage.projects.length > 0 && (
            <div className="saved-projects-block">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">PROYECTOS GUARDADOS</p>
                  <h3>Continuar trabajo</h3>
                </div>
                <span className="status-pill">
                  {projectStorage.projects.length}
                </span>
              </div>

              <div className="saved-projects-list">
                {projectStorage.projects.map((project) => (
                  <div className="saved-project-row" key={project.projectId}>
                    <button
                      className="saved-project-main"
                      onClick={() => openStoredProject(project.projectId)}
                    >
                      <strong>{project.name}</strong>
                      <small>{project.projectId}</small>
                      <span>
                        Última actualización: {formatStoredDate(project.updatedAt)}
                      </span>
                    </button>
                    <button
                      className="danger-link saved-delete"
                      onClick={() => void deleteProject(project.projectId)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              <p className="storage-note">
                Guardado local v2: los datos del proyecto permanecen en este
                navegador y los archivos de evidencia se almacenan en IndexedDB.
                Todavía no existe sincronización con nube.
              </p>
            </div>
          )}
        </section>
      </main>
    );
  }

  const progress = wizardProgress(wizard);
  const current = wizard.steps.find((step) => step.id === wizard.currentStep)!;
  const stepValidation = validateFormStep(current.id, draft);

  const advance = () => {
    const result = validateFormStep(current.id, draft);
    if (!result.valid) {
      setWizard((state) => blockWizardStep(state, current.id, result.issues));
      return;
    }

    setWizard((state) => completeWizardStep(state, current.id));
  };

  const reset = () => {
    const isDemo = wizard.projectId === casaGoyoReference.id;
    setDraft(isDemo ? createCasaGoyoDemoDraft() : createEmptyTE1FormDraft());
    setWizard(createTE1Wizard(wizard.projectId));
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <button className="back-link" onClick={() => setMode("home")}>
            ← Proyectos
          </button>
          <p className="eyebrow">
            TE1 · {wizard.projectId === casaGoyoReference.id ? "PROYECTO DE REFERENCIA" : "NUEVO PROYECTO"}
          </p>
          <h1>{draft.project.name || "Nuevo proyecto TE1"}</h1>
          <small className="project-id-label">{wizard.projectId}</small>
        </div>
        <div className="header-actions">
          <button className="save-button" onClick={saveProject}>
            Guardar proyecto
          </button>
          <span className={`status-pill ${draft.review.approved ? "complete" : "warning"}`}>
            {draft.review.approved ? "Aprobación ORBI vigente" : "Borrador"}
          </span>
        </div>
      </header>

      <div className="workspace">
        <aside className="stepper">
          <div className="progress-block">
            <div className="progress-row">
              <strong>Avance</strong>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {wizard.steps.map((step, index) => (
            <div
              key={step.id}
              className={`step ${step.status} ${step.id === wizard.currentStep ? "selected" : ""}`}
            >
              <span className="step-number">{index + 1}</span>
              <div>
                <strong>{step.label}</strong>
                <small>{step.status}</small>
              </div>
            </div>
          ))}
        </aside>

        <section className="content-column">
          {saveNotice && <div className="save-notice">{saveNotice}</div>}
          <div className="section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">PASO ACTUAL</p>
                <h2>{current.label}</h2>
              </div>
              <span className={`status-pill ${current.status}`}>
                {current.status}
              </span>
            </div>

            <StepForm
              step={current.id}
              draft={draft}
              projectId={wizard.projectId}
              onChange={updateDraft}
            />

            {!stepValidation.valid && (
              <div className="validation-box">
                <strong>Información requerida</strong>
                <ul>
                  {stepValidation.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="action-row">
              <button className="secondary" onClick={reset}>
                Reiniciar
              </button>
              <button className="primary" onClick={advance}>
                Validar y continuar →
              </button>
            </div>
          </div>

          <div className="info-grid">
            <Info label="Proyecto" value={draft.project.name || "PENDIENTE"} />
            <Info label="Destino" value={destinationLabel(draft.project.destination)} />
            <Info label="Comuna" value={draft.location.commune || "PENDIENTE"} />
            <Info label="Región" value={draft.location.region || "PENDIENTE"} />
            <Info label="Tablero" value={draft.board.name || "PENDIENTE"} />
            <Info label="Circuitos" value={String(liveProject.circuits.length)} />
            <Info label="Potencia instalada" value={String(manifest.totals.installedPowerW)} />
          </div>

          <DrawingPreview draft={draft} projectId={wizard.projectId} />

          <LocalAssistantPanel
            draft={draft}
            projectId={wizard.projectId}
          />

          <EvidenceManager projectId={wizard.projectId} />

          <div className="split-grid">
              <div className="section-card">
                <p className="eyebrow">EVIDENCIA DE TERRENO</p>
                <h3>Checklist mínimo</h3>
                <div className="list">
                  {checklist.map((item) => (
                    <div className="list-item" key={item.id}>
                      <span className={`dot ${item.status}`} />
                      <div>
                        <strong>{item.label}</strong>
                        <small>{item.message}</small>
                      </div>
                      <b>{item.status.toUpperCase()}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <p className="eyebrow">QA TÉCNICO</p>
                <h3>Hallazgos actuales</h3>
                <div className="list">
                  {validation.findings.slice(0, 6).map((finding) => (
                    <div className="list-item" key={finding.code}>
                      <span className={`dot ${finding.severity}`} />
                      <div>
                        <strong>{finding.code}</strong>
                        <small>{finding.message}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-box">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function destinationLabel(value: TE1FormDraft["project"]["destination"]): string {
  if (value === "casa-habitacion") return "Casa habitación";
  if (value === "departamento") return "Departamento";
  return "Otro";
}

function formatStoredDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}
