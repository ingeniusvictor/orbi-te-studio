import type { StorageLike } from "./project-storage.js";

export const AUDIT_STORE_KEY = "orbi.te-studio.audit.v1";
export const AUDIT_SCHEMA_VERSION = 1 as const;

export type AuditAction =
  | "approved"
  | "approval-invalidated"
  | "ai-proposal-accepted"
  | "package-generated";

export interface ProjectAuditEvent {
  schemaVersion: typeof AUDIT_SCHEMA_VERSION;
  id: string;
  projectId: string;
  action: AuditAction;
  actor: string;
  occurredAt: string;
  revisionFingerprint: string;
  details: string;
  previousHash: string;
  hash: string;
}

export interface ProjectAuditHistory {
  schemaVersion: typeof AUDIT_SCHEMA_VERSION;
  projectId: string;
  events: ProjectAuditEvent[];
}

export interface AppendAuditInput {
  projectId: string;
  action: AuditAction;
  actor: string;
  revisionFingerprint: string;
  details?: string;
  occurredAt?: Date;
}

interface AuditEnvelope {
  schemaVersion: typeof AUDIT_SCHEMA_VERSION;
  events: ProjectAuditEvent[];
}

let auditAppendQueue: Promise<void> = Promise.resolve();

function emptyEnvelope(): AuditEnvelope {
  return {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    events: []
  };
}

export function decodeAuditEnvelope(raw: string | null): AuditEnvelope {
  if (!raw) return emptyEnvelope();

  try {
    const parsed = JSON.parse(raw) as Partial<AuditEnvelope>;
    if (
      parsed.schemaVersion !== AUDIT_SCHEMA_VERSION ||
      !Array.isArray(parsed.events)
    ) {
      return emptyEnvelope();
    }

    return {
      schemaVersion: AUDIT_SCHEMA_VERSION,
      events: parsed.events.filter(isAuditEvent)
    };
  } catch {
    return emptyEnvelope();
  }
}

export function listProjectAuditEvents(
  storage: StorageLike,
  projectId: string
): ProjectAuditEvent[] {
  return decodeAuditEnvelope(storage.getItem(AUDIT_STORE_KEY)).events.filter(
    (event) => event.projectId === projectId
  );
}

export async function appendProjectAuditEvent(
  storage: StorageLike,
  input: AppendAuditInput
): Promise<ProjectAuditEvent> {
  let created!: ProjectAuditEvent;

  const run = async () => {
    const envelope = decodeAuditEnvelope(
      storage.getItem(AUDIT_STORE_KEY)
    );
    const projectEvents = envelope.events.filter(
      (event) => event.projectId === input.projectId
    );
    const previousHash = projectEvents.at(-1)?.hash ?? "";

    const eventWithoutHash = {
      schemaVersion: AUDIT_SCHEMA_VERSION,
      id: createAuditId(),
      projectId: input.projectId,
      action: input.action,
      actor: input.actor.trim() || "ORBI TE Studio",
      occurredAt: (input.occurredAt ?? new Date()).toISOString(),
      revisionFingerprint: await sha256Text(
        input.revisionFingerprint
      ),
      details: input.details?.trim() ?? "",
      previousHash
    };

    created = {
      ...eventWithoutHash,
      hash: await sha256Text(JSON.stringify(eventWithoutHash))
    };

    storage.setItem(
      AUDIT_STORE_KEY,
      JSON.stringify({
        schemaVersion: AUDIT_SCHEMA_VERSION,
        events: [...envelope.events, created]
      } satisfies AuditEnvelope)
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("orbi:audit-changed", {
          detail: { projectId: input.projectId }
        })
      );
    }
  };

  const previous = auditAppendQueue;
  auditAppendQueue = previous.then(run, run);
  await auditAppendQueue;
  return created;
}

export function buildProjectAuditHistory(
  storage: StorageLike,
  projectId: string
): ProjectAuditHistory {
  return {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    projectId,
    events: listProjectAuditEvents(storage, projectId)
  };
}

export function projectAuditHistoryToJson(
  history: ProjectAuditHistory
): string {
  return JSON.stringify(history, null, 2);
}

export function replaceProjectAuditHistory(
  storage: StorageLike,
  history: ProjectAuditHistory
): void {
  const envelope = decodeAuditEnvelope(storage.getItem(AUDIT_STORE_KEY));
  const otherEvents = envelope.events.filter(
    (event) => event.projectId !== history.projectId
  );

  storage.setItem(
    AUDIT_STORE_KEY,
    JSON.stringify({
      schemaVersion: AUDIT_SCHEMA_VERSION,
      events: [...otherEvents, ...history.events]
    } satisfies AuditEnvelope)
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("orbi:audit-changed", {
        detail: { projectId: history.projectId }
      })
    );
  }
}

export async function validateProjectAuditChain(
  storage: StorageLike,
  projectId: string
): Promise<string[]> {
  const events = listProjectAuditEvents(storage, projectId);
  const issues: string[] = [];
  let previousHash = "";

  for (const event of events) {
    if (event.previousHash !== previousHash) {
      issues.push(`${event.id}: previousHash no coincide.`);
    }

    const { hash, ...withoutHash } = event;
    const expected = await sha256Text(JSON.stringify(withoutHash));
    if (hash !== expected) {
      issues.push(`${event.id}: hash del evento no coincide.`);
    }

    previousHash = event.hash;
  }

  return issues;
}

async function sha256Text(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createAuditId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isAuditEvent(value: unknown): value is ProjectAuditEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProjectAuditEvent>;

  return (
    candidate.schemaVersion === AUDIT_SCHEMA_VERSION &&
    typeof candidate.id === "string" &&
    typeof candidate.projectId === "string" &&
    typeof candidate.action === "string" &&
    typeof candidate.actor === "string" &&
    typeof candidate.occurredAt === "string" &&
    typeof candidate.revisionFingerprint === "string" &&
    typeof candidate.details === "string" &&
    typeof candidate.previousHash === "string" &&
    typeof candidate.hash === "string"
  );
}
