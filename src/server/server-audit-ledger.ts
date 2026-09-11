import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type {
  ProjectAuditEvent,
  ProjectAuditHistory
} from "../web/audit-log.js";

export const SERVER_LEDGER_SCHEMA = 1 as const;

let ledgerMutationQueue: Promise<void> = Promise.resolve();

export type ServerLedgerAction =
  | "client-approved"
  | "client-approval-invalidated"
  | "package-generated";

export interface ServerLedgerEvent {
  schemaVersion: typeof SERVER_LEDGER_SCHEMA;
  id: string;
  projectId: string;
  action: ServerLedgerAction;
  actor: string;
  occurredAt: string;
  revisionFingerprint: string;
  sourceEventHash: string;
  previousHash: string;
  hash: string;
}

export interface ServerAuditLedger {
  schemaVersion: typeof SERVER_LEDGER_SCHEMA;
  events: ServerLedgerEvent[];
}


export async function loadServerAuditLedger(
  filePath: string
): Promise<ServerAuditLedger> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ServerAuditLedger>;
    if (
      parsed.schemaVersion !== SERVER_LEDGER_SCHEMA ||
      !Array.isArray(parsed.events)
    ) {
      throw new Error(
        "El ledger server-side tiene una estructura o versión no soportada."
      );
    }

    if (!parsed.events.every(isServerLedgerEvent)) {
      throw new Error(
        "El ledger server-side contiene eventos estructuralmente inválidos."
      );
    }

    return {
      schemaVersion: SERVER_LEDGER_SCHEMA,
      events: parsed.events
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return emptyLedger();
    }
    throw error;
  }
}

export async function syncClientAuditHistoryToServerLedger(
  filePath: string,
  history: ProjectAuditHistory
): Promise<ServerAuditLedger> {
  return serializeLedgerMutation(async () => {
    const ledger = await loadServerAuditLedger(filePath);
    let next = ledger;

    for (const event of history.events) {
      if (
        event.action !== "approved" &&
        event.action !== "approval-invalidated"
      ) {
        continue;
      }

      validateClientEventHash(event);

      if (
        next.events.some(
          (stored) => stored.sourceEventHash === event.hash
        )
      ) {
        continue;
      }

      next = appendLedgerEvent(next, {
        projectId: event.projectId,
        action:
          event.action === "approved"
            ? "client-approved"
            : "client-approval-invalidated",
        actor: event.actor,
        occurredAt: event.occurredAt,
        revisionFingerprint: event.revisionFingerprint,
        sourceEventHash: event.hash
      });
    }

    await saveServerAuditLedger(filePath, next);
    return next;
  });
}

export async function appendServerPackageEvent(
  filePath: string,
  input: {
    projectId: string;
    actor: string;
    revisionFingerprint: string;
    occurredAt?: Date;
  }
): Promise<ServerAuditLedger> {
  return serializeLedgerMutation(async () => {
    const ledger = await loadServerAuditLedger(filePath);
    const next = appendLedgerEvent(ledger, {
      projectId: input.projectId,
      action: "package-generated",
      actor: input.actor,
      occurredAt: (input.occurredAt ?? new Date()).toISOString(),
      revisionFingerprint: input.revisionFingerprint,
      sourceEventHash: ""
    });
    await saveServerAuditLedger(filePath, next);
    return next;
  });
}

export function validateServerLedgerChain(
  ledger: ServerAuditLedger,
  projectId?: string
): string[] {
  const events = projectId
    ? ledger.events.filter((event) => event.projectId === projectId)
    : ledger.events;
  const issues: string[] = [];
  let previousHash = "";

  for (const event of events) {
    if (event.previousHash !== previousHash) {
      issues.push(`${event.id}: previousHash del ledger no coincide.`);
    }

    const { hash, ...withoutHash } = event;
    const expected = sha256Text(JSON.stringify(withoutHash));
    if (hash !== expected) {
      issues.push(`${event.id}: hash del ledger no coincide.`);
    }

    previousHash = event.hash;
  }

  return issues;
}

export function validateServerApprovalForRevision(
  ledger: ServerAuditLedger,
  projectId: string,
  revisionFingerprint: string
): string[] {
  const issues = validateServerLedgerChain(ledger, projectId);
  if (issues.length > 0) return issues;

  const revisionEvents = ledger.events.filter(
    (event) =>
      event.projectId === projectId &&
      event.revisionFingerprint === revisionFingerprint
  );

  let approved = false;
  for (const event of revisionEvents) {
    if (event.action === "client-approved") approved = true;
    if (event.action === "client-approval-invalidated") approved = false;
  }

  if (!approved) {
    issues.push(
      "El ledger server-side no registra una aprobación profesional vigente para la revisión actual."
    );
  }

  return issues;
}

export function serverAuditLedgerForProject(
  ledger: ServerAuditLedger,
  projectId: string
): ServerAuditLedger {
  return {
    schemaVersion: SERVER_LEDGER_SCHEMA,
    events: ledger.events.filter(
      (event) => event.projectId === projectId
    )
  };
}

export function serverAuditLedgerToJson(
  ledger: ServerAuditLedger
): string {
  return JSON.stringify(ledger, null, 2);
}

async function saveServerAuditLedger(
  filePath: string,
  ledger: ServerAuditLedger
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, JSON.stringify(ledger, null, 2), "utf8");
  await rename(tempPath, filePath);
}

async function mutateLedger<T>(
  task: () => Promise<T>
): Promise<T> {
  let value!: T;
  const run = async () => {
    value = await task();
  };

  const previous = ledgerMutationQueue;
  ledgerMutationQueue = previous.then(run, run);
  await ledgerMutationQueue;
  return value;
}

function appendLedgerEvent(
  ledger: ServerAuditLedger,
  input: Omit<
    ServerLedgerEvent,
    "schemaVersion" | "id" | "previousHash" | "hash"
  >
): ServerAuditLedger {
  const projectEvents = ledger.events.filter(
    (event) => event.projectId === input.projectId
  );
  const previousHash = projectEvents.at(-1)?.hash ?? "";

  const withoutHash = {
    schemaVersion: SERVER_LEDGER_SCHEMA,
    id: randomUUID(),
    projectId: input.projectId,
    action: input.action,
    actor: input.actor.trim() || "ORBI TE Studio API",
    occurredAt: input.occurredAt,
    revisionFingerprint: input.revisionFingerprint,
    sourceEventHash: input.sourceEventHash,
    previousHash
  };

  const event: ServerLedgerEvent = {
    ...withoutHash,
    hash: sha256Text(JSON.stringify(withoutHash))
  };

  return {
    schemaVersion: SERVER_LEDGER_SCHEMA,
    events: [...ledger.events, event]
  };
}

function validateClientEventHash(event: ProjectAuditEvent): void {
  const { hash, ...withoutHash } = event;
  const expected = sha256Text(JSON.stringify(withoutHash));
  if (hash !== expected) {
    throw new Error(
      `${event.id}: el evento cliente no supera validación SHA-256.`
    );
  }
}

function sha256Text(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function emptyLedger(): ServerAuditLedger {
  return {
    schemaVersion: SERVER_LEDGER_SCHEMA,
    events: []
  };
}

async function serializeLedgerMutation<T>(
  task: () => Promise<T>
): Promise<T> {
  const previous = ledgerMutationQueue;
  let release!: () => void;
  ledgerMutationQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    return await task();
  } finally {
    release();
  }
}

function isServerLedgerEvent(
  value: unknown
): value is ServerLedgerEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ServerLedgerEvent>;

  return (
    candidate.schemaVersion === SERVER_LEDGER_SCHEMA &&
    typeof candidate.id === "string" &&
    typeof candidate.projectId === "string" &&
    typeof candidate.action === "string" &&
    typeof candidate.actor === "string" &&
    typeof candidate.occurredAt === "string" &&
    typeof candidate.revisionFingerprint === "string" &&
    typeof candidate.sourceEventHash === "string" &&
    typeof candidate.previousHash === "string" &&
    typeof candidate.hash === "string"
  );
}
