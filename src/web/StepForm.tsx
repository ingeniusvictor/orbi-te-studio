import type { ChangeEvent, ReactNode } from "react";
import type { TE1WizardStep } from "../wizard/te1-wizard.js";
import { MeasurementForm } from "./MeasurementForm.js";
import { PlanForm } from "./PlanForm.js";
import { CompliancePanel } from "./CompliancePanel.js";
import { ReviewForm } from "./ReviewForm.js";
import { ExportPanel } from "./ExportPanel.js";
import { EvidencePicker } from "./EvidencePicker.js";
import {
  createCircuitDraft,
  type TE1CircuitDraft,
  type TE1FormDraft
} from "./te1-form-model.js";

interface Props {
  step: TE1WizardStep;
  draft: TE1FormDraft;
  projectId: string;
  onChange: (draft: TE1FormDraft) => void;
}

export function StepForm({ step, draft, projectId, onChange }: Props) {
  const updateProject =
    (field: keyof TE1FormDraft["project"]) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({
        ...draft,
        project: { ...draft.project, [field]: event.target.value }
      });

  const updateOwner =
    (field: keyof TE1FormDraft["owner"]) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange({
        ...draft,
        owner: { ...draft.owner, [field]: event.target.value }
      });

  const updateLocation =
    (field: keyof TE1FormDraft["location"]) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange({
        ...draft,
        location: { ...draft.location, [field]: event.target.value }
      });

  const updateBoard =
    (field: keyof TE1FormDraft["board"]) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange({
        ...draft,
        board: { ...draft.board, [field]: event.target.value }
      });

  const updateCircuit = (
    index: number,
    patch: Partial<TE1CircuitDraft>
  ) => {
    onChange({
      ...draft,
      circuits: draft.circuits.map((circuit, currentIndex) =>
        currentIndex === index ? { ...circuit, ...patch } : circuit
      )
    });
  };

  const addCircuit = () => {
    const nextNumber =
      Math.max(
        0,
        ...draft.circuits.map((circuit) => Number(circuit.number) || 0)
      ) + 1;

    onChange({
      ...draft,
      circuits: [...draft.circuits, createCircuitDraft(nextNumber)]
    });
  };

  const removeCircuit = (index: number) => {
    onChange({
      ...draft,
      circuits: draft.circuits.filter((_, currentIndex) => currentIndex !== index)
    });
  };

  if (step === "project") {
    return (
      <div className="form-grid">
        <Field label="Nombre del proyecto">
          <input value={draft.project.name} onChange={updateProject("name")} placeholder="Ej. Casa cliente Osorno" />
        </Field>
        <Field label="Destino">
          <select value={draft.project.destination} onChange={updateProject("destination")}>
            <option value="casa-habitacion">Casa habitación</option>
            <option value="departamento">Departamento</option>
            <option value="otro">Otro</option>
          </select>
        </Field>
        <Field label="Sistema">
          <select value={draft.project.system} onChange={updateProject("system")}>
            <option value="monofasico">Monofásico</option>
            <option value="trifasico">Trifásico</option>
          </select>
        </Field>
        <Field label="Tensión nominal (V)">
          <input value={draft.project.voltageV} onChange={updateProject("voltageV")} inputMode="decimal" />
        </Field>
      </div>
    );
  }

  if (step === "owner") {
    return (
      <div className="form-grid">
        <Field label="Nombre completo del propietario">
          <input value={draft.owner.name} onChange={updateOwner("name")} placeholder="Nombre y apellidos" />
        </Field>
        <Field label="RUT">
          <input value={draft.owner.rut} onChange={updateOwner("rut")} placeholder="12.345.678-9" />
        </Field>
      </div>
    );
  }

  if (step === "location") {
    return (
      <div className="form-grid">
        <Field label="Dirección" wide>
          <input value={draft.location.address} onChange={updateLocation("address")} placeholder="Calle, número, villa o sector" />
        </Field>
        <Field label="Comuna">
          <input value={draft.location.commune} onChange={updateLocation("commune")} />
        </Field>
        <Field label="Región">
          <input value={draft.location.region} onChange={updateLocation("region")} />
        </Field>
        <Field label="WGS84">
          <input value={draft.location.wgs84} onChange={updateLocation("wgs84")} placeholder="-40.57, -73.13" />
        </Field>
        <Field label="UTM">
          <input value={draft.location.utm} onChange={updateLocation("utm")} placeholder="Huso / Este / Norte" />
        </Field>
        <div className="wide">
          <EvidencePicker
            projectId={projectId}
            category="location-sketch"
            value={draft.location.locationSketchEvidenceId}
            label="Evidencia croquis de ubicación"
            onSelect={(selection) =>
              onChange({
                ...draft,
                location: {
                  ...draft.location,
                  locationSketchEvidenceId: selection?.id ?? "",
                  locationSketchEvidenceLabel: selection?.filename ?? ""
                }
              })
            }
          />
        </div>
        <label className="verify-check wide">
          <input
            type="checkbox"
            checked={draft.location.locationSketchVerified}
            onChange={(event) =>
              onChange({
                ...draft,
                location: {
                  ...draft.location,
                  locationSketchVerified: event.target.checked
                }
              })
            }
          />
          <span>Croquis de ubicación verificado contra evidencia real</span>
        </label>
      </div>
    );
  }

  if (step === "board") {
    return (
      <div className="form-grid">
        <Field label="Nombre del tablero">
          <input value={draft.board.name} onChange={updateBoard("name")} placeholder="Ej. TDA CASA" />
        </Field>
        <Field label="Cantidad de módulos">
          <input value={draft.board.totalWays} onChange={updateBoard("totalWays")} inputMode="numeric" />
        </Field>
        <div className="wide">
          <EvidencePicker
            projectId={projectId}
            category="board-front"
            value={draft.board.frontalEvidenceId}
            label="Foto frontal del tablero"
            onSelect={(selection) =>
              onChange({
                ...draft,
                board: {
                  ...draft.board,
                  frontalEvidenceId: selection?.id ?? "",
                  frontalPhotoLabel: selection?.filename ?? ""
                }
              })
            }
          />
        </div>
        <div className="wide">
          <EvidencePicker
            projectId={projectId}
            category="board-legend"
            value={draft.board.legendEvidenceId}
            label="Foto de leyenda del tablero"
            onSelect={(selection) =>
              onChange({
                ...draft,
                board: {
                  ...draft.board,
                  legendEvidenceId: selection?.id ?? "",
                  legendPhotoLabel: selection?.filename ?? ""
                }
              })
            }
          />
        </div>

        <div className="subsection wide">
          <strong>Protección general</strong>
          <div className="form-grid compact-grid">
            <Field label="Polos">
              <input value={draft.board.mainPoles} onChange={updateBoard("mainPoles")} inputMode="numeric" />
            </Field>
            <Field label="Corriente nominal (A)">
              <input value={draft.board.mainCurrentA} onChange={updateBoard("mainCurrentA")} inputMode="decimal" />
            </Field>
            <Field label="Poder de corte (kA)">
              <input value={draft.board.mainBreakingCapacityKA} onChange={updateBoard("mainBreakingCapacityKA")} inputMode="decimal" />
            </Field>
          </div>
        </div>

        <div className="subsection wide">
          <strong>Protección diferencial</strong>
          <div className="form-grid compact-grid">
            <Field label="Polos">
              <input value={draft.board.differentialPoles} onChange={updateBoard("differentialPoles")} inputMode="numeric" />
            </Field>
            <Field label="Corriente nominal (A)">
              <input value={draft.board.differentialCurrentA} onChange={updateBoard("differentialCurrentA")} inputMode="decimal" />
            </Field>
            <Field label="Sensibilidad IΔn (mA)">
              <input value={draft.board.differentialResidualMA} onChange={updateBoard("differentialResidualMA")} inputMode="decimal" />
            </Field>
          </div>
        </div>
      </div>
    );
  }

  if (step === "circuits") {
    return (
      <CircuitEditor
        mode="circuits"
        circuits={draft.circuits}
        onUpdate={updateCircuit}
        onAdd={addCircuit}
        onRemove={removeCircuit}
      />
    );
  }

  if (step === "loads") {
    return (
      <CircuitEditor
        mode="loads"
        circuits={draft.circuits}
        onUpdate={updateCircuit}
        onAdd={addCircuit}
        onRemove={removeCircuit}
      />
    );
  }

  if (step === "conductors") {
    return (
      <CircuitEditor
        mode="conductors"
        circuits={draft.circuits}
        onUpdate={updateCircuit}
        onAdd={addCircuit}
        onRemove={removeCircuit}
      />
    );
  }

  if (step === "measurements") {
    return (
      <MeasurementForm
        draft={draft}
        projectId={projectId}
        onChange={onChange}
      />
    );
  }

  if (step === "plans") {
    return <PlanForm draft={draft} projectId={projectId} onChange={onChange} />;
  }

  if (step === "compliance") {
    return <CompliancePanel draft={draft} />;
  }

  if (step === "review") {
    return <ReviewForm draft={draft} projectId={projectId} onChange={onChange} />;
  }

  if (step === "export") {
    return <ExportPanel draft={draft} projectId={projectId} />;
  }

  return (
    <div className="future-step">
      <strong>{labelFor(step)}</strong>
      <p>
        La lógica de este paso ya existe en el motor. Su formulario editable se
        incorporará en la siguiente iteración.
      </p>
    </div>
  );
}

type CircuitMode = "circuits" | "loads" | "conductors";

function CircuitEditor({
  mode,
  circuits,
  onUpdate,
  onAdd,
  onRemove
}: {
  mode: CircuitMode;
  circuits: TE1CircuitDraft[];
  onUpdate: (index: number, patch: Partial<TE1CircuitDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="circuit-editor">
      <div className="circuit-toolbar">
        <div>
          <strong>{circuitModeTitle(mode)}</strong>
          <small>{circuits.length} circuito(s)</small>
        </div>
        <button type="button" className="secondary compact" onClick={onAdd}>
          + Agregar circuito
        </button>
      </div>

      <div className="circuit-stack">
        {circuits.map((circuit, index) => (
          <section className="circuit-card" key={circuit.id}>
            <div className="circuit-card-head">
              <strong>Circuito {circuit.number || "?"}</strong>
              {circuits.length > 1 && (
                <button
                  type="button"
                  className="danger-link"
                  onClick={() => onRemove(index)}
                >
                  Eliminar
                </button>
              )}
            </div>

            {mode === "circuits" && (
              <div className="form-grid compact-grid">
                <Field label="N° circuito">
                  <input
                    value={circuit.number}
                    inputMode="numeric"
                    onChange={(event) =>
                      onUpdate(index, { number: event.target.value })
                    }
                  />
                </Field>
                <Field label="Descripción">
                  <input
                    value={circuit.description}
                    placeholder="Ej. Alumbrado"
                    onChange={(event) =>
                      onUpdate(index, { description: event.target.value })
                    }
                  />
                </Field>
                <Field label="ITM (A)">
                  <input
                    value={circuit.breakerA}
                    inputMode="decimal"
                    onChange={(event) =>
                      onUpdate(index, { breakerA: event.target.value })
                    }
                  />
                </Field>
                <Field label="Poder de corte (kA)">
                  <input
                    value={circuit.breakingCapacityKA}
                    inputMode="decimal"
                    onChange={(event) =>
                      onUpdate(index, {
                        breakingCapacityKA: event.target.value
                      })
                    }
                  />
                </Field>
                <Field label="Curva">
                  <input
                    value={circuit.curve}
                    onChange={(event) =>
                      onUpdate(index, { curve: event.target.value })
                    }
                  />
                </Field>
              </div>
            )}

            {mode === "loads" && (
              <div className="form-grid compact-grid">
                <InfoField label="Circuito" value={circuit.description || "SIN DESCRIPCIÓN"} />
                <InfoField label="ITM" value={circuit.breakerA ? `${circuit.breakerA} A` : "PENDIENTE"} />
                <Field label="Potencia instalada (W)">
                  <input
                    value={circuit.installedPowerW}
                    inputMode="decimal"
                    onChange={(event) =>
                      onUpdate(index, { installedPowerW: event.target.value })
                    }
                  />
                </Field>
                <Field label="Potencia demandada (W)">
                  <input
                    value={circuit.demandedPowerW}
                    inputMode="decimal"
                    placeholder="Opcional en esta etapa"
                    onChange={(event) =>
                      onUpdate(index, { demandedPowerW: event.target.value })
                    }
                  />
                </Field>
              </div>
            )}

            {mode === "conductors" && (
              <div className="form-grid compact-grid">
                <InfoField label="Circuito" value={circuit.description || "SIN DESCRIPCIÓN"} />
                <Field label="Fase (mm²)">
                  <input
                    value={circuit.conductorPhaseMm2}
                    inputMode="decimal"
                    onChange={(event) =>
                      onUpdate(index, { conductorPhaseMm2: event.target.value })
                    }
                  />
                </Field>
                <Field label="Neutro (mm²)">
                  <input
                    value={circuit.conductorNeutralMm2}
                    inputMode="decimal"
                    onChange={(event) =>
                      onUpdate(index, { conductorNeutralMm2: event.target.value })
                    }
                  />
                </Field>
                <Field label="PE (mm²)">
                  <input
                    value={circuit.conductorPeMm2}
                    inputMode="decimal"
                    onChange={(event) =>
                      onUpdate(index, { conductorPeMm2: event.target.value })
                    }
                  />
                </Field>
                <Field label="Material">
                  <select
                    value={circuit.conductorMaterial}
                    onChange={(event) =>
                      onUpdate(index, {
                        conductorMaterial: event.target.value as "Cu" | "Al"
                      })
                    }
                  >
                    <option value="Cu">Cobre</option>
                    <option value="Al">Aluminio</option>
                  </select>
                </Field>
                <Field label="Método de instalación" wide>
                  <input
                    value={circuit.installationMethod}
                    placeholder="Debe verificarse en terreno"
                    onChange={(event) =>
                      onUpdate(index, { installationMethod: event.target.value })
                    }
                  />
                </Field>
                <label className="verify-check wide">
                  <input
                    type="checkbox"
                    checked={circuit.conductorVerified}
                    onChange={(event) =>
                      onUpdate(index, {
                        conductorVerified: event.target.checked
                      })
                    }
                  />
                  <span>Conductor verificado en terreno / documentación confiable</span>
                </label>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  wide = false,
  children
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="field readonly">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function circuitModeTitle(mode: CircuitMode): string {
  if (mode === "circuits") return "Circuitos y protecciones";
  if (mode === "loads") return "Potencias por circuito";
  return "Conductores por circuito";
}

function labelFor(step: TE1WizardStep): string {
  const labels: Record<TE1WizardStep, string> = {
    project: "Proyecto",
    owner: "Propietario",
    location: "Ubicación",
    board: "Tablero",
    circuits: "Circuitos",
    loads: "Cargas",
    conductors: "Conductores",
    measurements: "Mediciones",
    plans: "Planos",
    compliance: "Verificación RIC",
    review: "Revisión profesional",
    export: "Paquete TE1"
  };
  return labels[step];
}
