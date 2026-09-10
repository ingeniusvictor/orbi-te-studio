import type { TE1WizardState } from "../wizard/te1-wizard.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export const PROJECT_STORE_KEY = "orbi.te-studio.projects.v1";
export const PROJECT_STORE_SCHEMA = 1 as const;

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
    const parsed = JSON.parse(raw) as Partial<ProjectStoreEnvelope>;

    if (
      parsed.schemaVersion !== PROJECT_STORE_SCHEMA ||
      !Array.isArray(parsed.projects)
    ) {
      return emptyEnvelope();
    }

    const projects = parsed.projects.filter(isStoredTE1Project);
    return {
      schemaVersion: PROJECT_STORE_SCHEMA,
      projects
    };
  } catch {
    return emptyEnvelope();
  }
}

export function listStoredProjects(storage: StorageLike): StoredTE1Project[] {
  return decodeProjectStore(storage.getItem(PROJECT_STORE_KEY)).projects
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
  const envelope = decodeProjectStore(storage.getItem(PROJECT_STORE_KEY));
  const record: StoredTE1Project = {
    schemaVersion: PROJECT_STORE_SCHEMA,
    projectId: input.projectId,
    name: input.name.trim() || "Proyecto TE1 sin nombre",
    updatedAt: new Date().toISOString(),
    draft: structuredClone(input.draft),
    wizard: structuredClone(input.wizard)
  };

  const projects = [
    record,
    ...envelope.projects.filter(
      (project) => project.projectId !== input.projectId
    )
  ];

  storage.setItem(
    PROJECT_STORE_KEY,
    JSON.stringify({
      schemaVersion: PROJECT_STORE_SCHEMA,
      projects
    } satisfies ProjectStoreEnvelope)
  );

  return record;
}

export function deleteStoredProject(
  storage: StorageLike,
  projectId: string
): void {
  const envelope = decodeProjectStore(storage.getItem(PROJECT_STORE_KEY));
  const projects = envelope.projects.filter(
    (project) => project.projectId !== projectId
  );

  if (projects.length === 0) {
    storage.removeItem(PROJECT_STORE_KEY);
    return;
  }

  storage.setItem(
    PROJECT_STORE_KEY,
    JSON.stringify({
      schemaVersion: PROJECT_STORE_SCHEMA,
      projects
    } satisfies ProjectStoreEnvelope)
  );
}

export function createProjectId(now = new Date()): string {
  const stamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 17);
  return `TE1-${stamp}`;
}

function isStoredTE1Project(value: unknown): value is StoredTE1Project {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredTE1Project>;

  return (
    candidate.schemaVersion === PROJECT_STORE_SCHEMA &&
    typeof candidate.projectId === "string" &&
    candidate.projectId.length > 0 &&
    typeof candidate.name === "string" &&
    typeof candidate.updatedAt === "string" &&
    Boolean(candidate.draft) &&
    Boolean(candidate.wizard)
  );
}
