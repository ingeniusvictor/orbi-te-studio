import type { ChangeEvent } from "react";
import type { TE1WizardStep } from "../wizard/te1-wizard.js";
import type { TE1FormDraft } from "./te1-form-model.js";

interface Props {
  step: TE1WizardStep;
  draft: TE1FormDraft;
  onChange: (draft: TE1FormDraft) => void;
}

export function StepForm({ step, draft, onChange }: Props) {
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
        <Field label="Foto frontal / referencia" wide>
          <input value={draft.board.frontalPhotoLabel} onChange={updateBoard("frontalPhotoLabel")} placeholder="Archivo o evidencia cargada" />
        </Field>
        <Field label="Foto leyenda / referencia" wide>
          <input value={draft.board.legendPhotoLabel} onChange={updateBoard("legendPhotoLabel")} placeholder="Opcional" />
        </Field>
      </div>
    );
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

function Field({
  label,
  wide = false,
  children
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
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
