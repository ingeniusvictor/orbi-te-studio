import { useMemo, useState } from "react";
import {
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

type ProjectMode = "home" | "te1";

export function App() {
  const [mode, setMode] = useState<ProjectMode>("home");
  const [wizard, setWizard] = useState<TE1WizardState>(() =>
    createTE1Wizard(casaGoyoReference.id)
  );

  const checklist = useMemo(
    () => buildMinimumFieldChecklist(casaGoyoFieldIntake),
    []
  );
  const validation = useMemo(() => validateTE1(casaGoyoReference), []);
  const manifest = useMemo(() => buildProjectManifest(casaGoyoReference), []);

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
            <button className="project-card active" onClick={() => setMode("te1")}>
              <span className="project-code">TE1</span>
              <strong>Instalación eléctrica interior</strong>
              <small>Viviendas, departamentos y otros consumos.</small>
            </button>

            <button className="project-card disabled" disabled>
              <span className="project-code">TE4</span>
              <strong>Generación distribuida</strong>
              <small>Próxima fase · Fotovoltaico y RGR.</small>
            </button>
          </div>
        </section>
      </main>
    );
  }

  const progress = wizardProgress(wizard);
  const current = wizard.steps.find((step) => step.id === wizard.currentStep)!;

  const advance = () => {
    if (current.status === "locked") return;
    setWizard((state) => completeWizardStep(state, current.id));
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <button className="back-link" onClick={() => setMode("home")}>
            ← Proyectos
          </button>
          <p className="eyebrow">TE1 · PROYECTO DE REFERENCIA</p>
          <h1>{casaGoyoReference.name}</h1>
        </div>
        <span className="status-pill warning">Datos incompletos</span>
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

            <div className="info-grid">
              <Info label="Proyecto" value={casaGoyoReference.id} />
              <Info label="Destino" value="Casa habitación" />
              <Info label="Comuna" value={casaGoyoReference.location.commune ?? "PENDIENTE"} />
              <Info label="Región" value={casaGoyoReference.location.region ?? "PENDIENTE"} />
              <Info label="Circuitos" value={String(casaGoyoReference.circuits.length)} />
              <Info label="Potencia instalada" value={String(manifest.totals.installedPowerW)} />
            </div>

            <div className="action-row">
              <button className="secondary" onClick={() => setWizard(createTE1Wizard(casaGoyoReference.id))}>
                Reiniciar demo
              </button>
              <button className="primary" onClick={advance}>
                Completar paso y continuar →
              </button>
            </div>
          </div>

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
