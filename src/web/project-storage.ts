import type { TE1WizardState } from "../wizard/te1-wizard.js";
import {
  createEmptyTE1FormDraft,
  type TE1FormDraft
} from "./te1-form-model.js";

export const PROJECT_STORE_KEY = "orbi.te-studio.projects.v2";
export const LEGACY_PROJECT_STORE_KEY = "orbi.te-studio.projects.v1";
export const PROJECT_STORE_SCHEMA = 2 as const;

export interface StoredTE1Project {
  schemaVersion: typeof PROJECT_STORE_SCHEMA;
  projectId: string;
  name: string;
  updatedAt: string;
  draft: TE1FormDraft;
  wizard: TE1WizardState;
}

interface ProjectStoreEnvelope {
  schemaVersion: typeof PROJECT_STORE_SCHEMA;
  projects: StoredTE1Project[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function emptyEnvelope(): ProjectStoreEnvelope {
  return {
    schemaVersion: PROJECT_STORE_SCHEMA,
    projects: []
  };
}

export function decodeProjectStore(raw: string | null): ProjectStoreEnvelope {
  if (!raw) return emptyEnvelope();

  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: number;
      projects?: unknown[];
    };

    if (
      (parsed.schemaVersion !== 1 &&
        parsed.schemaVersion !== PROJECT_STORE_SCHEMA) ||
      !Array.isArray(parsed.projects)
    ) {
      return emptyEnvelope();
    }

    const projects = parsed.projects
      .map(migrateStoredProject)
      .filter((project): project is StoredTE1Project => project !== undefined);

    return {
      schemaVersion: PROJECT_STORE_SCHEMA,
      projects
    };
  } catch {
    return emptyEnvelope();
  }
}

export function listStoredProjects(storage: StorageLike): StoredTE1Project[] {
  const current = decodeProjectStore(storage.getItem(PROJECT_STORE_KEY));
  const envelope =
    current.projects.length > 0
      ? current
      : decodeProjectStore(storage.getItem(LEGACY_PROJECT_STORE_KEY));

  return envelope.projects
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadStoredProject(
  storage: StorageLike,
  projectId: string
): StoredTE1Project | undefined {
  return listStoredProjects(storage).find(
    (project) => project.projectId === projectId
  );
}

export function saveStoredProject(
  storage: StorageLike,
  input: Omit<StoredTE1Project, "schemaVersion" | "updatedAt">
): StoredTE1Project {
  const existing = listStoredProjects(storage);
  const record: StoredTE1Project = {
    schemaVersion: PROJECT_STORE_SCHEMA,
    projectId: input.projectId,
    name: input.name.trim() || "Proyecto TE1 sin nombre",
    updatedAt: new Date().toISOString(),
    draft: structuredClone(normalizeDraft(input.draft)),
    wizard: structuredClone(input.wizard)
  };

  const projects = [
    record,
    ...existing.filter((project) => project.projectId !== input.projectId)
  ];

  storage.setItem(
    PROJECT_STORE_KEY,
    JSON.stringify({
      schemaVersion: PROJECT_STORE_SCHEMA,
      projects
    } satisfies ProjectStoreEnvelope)
  );
  storage.removeItem(LEGACY_PROJECT_STORE_KEY);

  return record;
}

export function deleteStoredProject(
  storage: StorageLike,
  projectId: string
): void {
  const projects = listStoredProjects(storage).filter(
    (project) => project.projectId !== projectId
  );

  if (projects.length === 0) {
    storage.removeItem(PROJECT_STORE_KEY);
    storage.removeItem(LEGACY_PROJECT_STORE_KEY);
    return;
  }

  storage.setItem(
    PROJECT_STORE_KEY,
    JSON.stringify({
      schemaVersion: PROJECT_STORE_SCHEMA,
      projects
    } satisfies ProjectStoreEnvelope)
  );
  storage.removeItem(LEGACY_PROJECT_STORE_KEY);
}

export function createProjectId(now = new Date()): string {
  const stamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 17);
  return `TE1-${stamp}`;
}

function migrateStoredProject(value: unknown): StoredTE1Project | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as {
    projectId?: unknown;
    name?: unknown;
    updatedAt?: unknown;
    draft?: unknown;
    wizard?: unknown;
  };

  if (
    typeof candidate.projectId !== "string" ||
    candidate.projectId.length === 0 ||
    typeof candidate.name !== "string" ||
    typeof candidate.updatedAt !== "string" ||
    !candidate.draft ||
    !candidate.wizard
  ) {
    return undefined;
  }

  return {
    schemaVersion: PROJECT_STORE_SCHEMA,
    projectId: candidate.projectId,
    name: candidate.name,
    updatedAt: candidate.updatedAt,
    draft: normalizeDraft(candidate.draft),
    wizard: candidate.wizard as TE1WizardState
  };
}

function normalizeDraft(value: unknown): TE1FormDraft {
  const base = createEmptyTE1FormDraft();
  if (!value || typeof value !== "object") return base;

  const raw = value as Partial<TE1FormDraft> & {
    measurements?: Array<Partial<TE1FormDraft["measurements"][number]>>;
  };

  return {
    ...base,
    ...raw,
    project: { ...base.project, ...(raw.project ?? {}) },
    owner: { ...base.owner, ...(raw.owner ?? {}) },
    location: {
      ...base.location,
      ...(raw.location ?? {}),
      locationSketchEvidenceId:
        raw.location?.locationSketchEvidenceId ?? ""
    },
    board: {
      ...base.board,
      ...(raw.board ?? {}),
      frontalEvidenceId: raw.board?.frontalEvidenceId ?? "",
      legendEvidenceId: raw.board?.legendEvidenceId ?? ""
    },
    circuits: Array.isArray(raw.circuits)
      ? raw.circuits
      : base.circuits,
    measurements: Array.isArray(raw.measurements)
      ? raw.measurements.map((measurement, index) => ({
          ...(base.measurements[index] ?? base.measurements[0]!),
          ...measurement,
          evidenceId: measurement.evidenceId ?? ""
        }))
      : base.measurements,
    plan: {
      ...base.plan,
      ...(raw.plan ?? {}),
      sourceEvidenceId: raw.plan?.sourceEvidenceId ?? ""
    },
    review: { ...base.review, ...(raw.review ?? {}) }
  };
}
