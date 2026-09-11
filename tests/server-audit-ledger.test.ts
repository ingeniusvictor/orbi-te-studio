import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  appendServerPackageEvent,
  loadServerAuditLedger,
  serverAuditLedgerForProject,
  syncClientAuditHistoryToServerLedger,
  validateServerApprovalForRevision,
  validateServerLedgerChain
} from "../src/server/server-audit-ledger.js";
import type {
  ProjectAuditEvent,
  ProjectAuditHistory
} from "../src/web/audit-log.js";

function clientEvent(
  action: "approved" | "approval-invalidated",
  previousHash = ""
): ProjectAuditEvent {
  const withoutHash = {
    schemaVersion: 1 as const,
    id: `CLIENT-${action}`,
    projectId: "TE1-1",
    action,
    actor: "Profesional Prueba",
    occurredAt: "2026-09-11T04:00:00.000Z",
    revisionFingerprint: "a".repeat(64),
    details: "",
    previousHash
  };

  return {
    ...withoutHash,
    hash: createHash("sha256")
      .update(JSON.stringify(withoutHash))
      .digest("hex")
  };
}

describe("persistent server audit ledger", () => {
  it("persists observed approval independently from browser storage", async () => {
    const dir = await mkdtemp(join(tmpdir(), "orbi-ledger-"));
    const file = join(dir, "ledger.json");
    const approved = clientEvent("approved");
    const history: ProjectAuditHistory = {
      schemaVersion: 1,
      projectId: "TE1-1",
      events: [approved]
    };

    const synced = await syncClientAuditHistoryToServerLedger(
      file,
      history
    );

    expect(synced.events).toHaveLength(1);
    expect(synced.events[0]?.action).toBe("client-approved");
    expect(synced.events[0]?.sourceEventHash).toBe(approved.hash);
    expect(
      validateServerApprovalForRevision(
        synced,
        "TE1-1",
        "a".repeat(64)
      )
    ).toEqual([]);

    const disk = JSON.parse(await readFile(file, "utf8")) as {
      events: unknown[];
    };
    expect(disk.events).toHaveLength(1);
  });

  it("chains server-authored package generation events", async () => {
    const dir = await mkdtemp(join(tmpdir(), "orbi-ledger-"));
    const file = join(dir, "ledger.json");
    const history: ProjectAuditHistory = {
      schemaVersion: 1,
      projectId: "TE1-1",
      events: [clientEvent("approved")]
    };

    await syncClientAuditHistoryToServerLedger(file, history);
    const next = await appendServerPackageEvent(file, {
      projectId: "TE1-1",
      actor: "ORBI TE Studio API",
      revisionFingerprint: "a".repeat(64),
      occurredAt: new Date("2026-09-11T04:10:00.000Z")
    });

    expect(next.events).toHaveLength(2);
    expect(next.events[1]?.action).toBe("package-generated");
    expect(validateServerLedgerChain(next, "TE1-1")).toEqual([]);
  });

  it("marks the revision invalid after a synced invalidation", async () => {
    const dir = await mkdtemp(join(tmpdir(), "orbi-ledger-"));
    const file = join(dir, "ledger.json");
    const approved = clientEvent("approved");
    const invalidated = clientEvent(
      "approval-invalidated",
      approved.hash
    );
    const history: ProjectAuditHistory = {
      schemaVersion: 1,
      projectId: "TE1-1",
      events: [approved, invalidated]
    };

    const ledger = await syncClientAuditHistoryToServerLedger(
      file,
      history
    );

    expect(
      validateServerApprovalForRevision(
        ledger,
        "TE1-1",
        "a".repeat(64)
      )[0]
    ).toContain("no registra una aprobación");
  });

  it("fails closed on malformed persisted ledger content", async () => {
    const dir = await mkdtemp(join(tmpdir(), "orbi-ledger-"));
    const file = join(dir, "ledger.json");
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(
        file,
        JSON.stringify({
          schemaVersion: 1,
          events: [{ id: "BROKEN" }]
        }),
        "utf8"
      )
    );

    await expect(loadServerAuditLedger(file)).rejects.toThrow(
      "eventos estructuralmente inválidos"
    );
  });

  it("serializes concurrent package ledger mutations", async () => {
    const dir = await mkdtemp(join(tmpdir(), "orbi-ledger-"));
    const file = join(dir, "ledger.json");
    const history: ProjectAuditHistory = {
      schemaVersion: 1,
      projectId: "TE1-1",
      events: [clientEvent("approved")]
    };

    await syncClientAuditHistoryToServerLedger(file, history);

    await Promise.all([
      appendServerPackageEvent(file, {
        projectId: "TE1-1",
        actor: "API-A",
        revisionFingerprint: "a".repeat(64)
      }),
      appendServerPackageEvent(file, {
        projectId: "TE1-1",
        actor: "API-B",
        revisionFingerprint: "a".repeat(64)
      })
    ]);

    const ledger = await loadServerAuditLedger(file);
    expect(ledger.events).toHaveLength(3);
    expect(validateServerLedgerChain(ledger, "TE1-1")).toEqual([]);
  });

  it("serializes concurrent server package events without losing chain links", async () => {
    const dir = await mkdtemp(join(tmpdir(), "orbi-ledger-"));
    const file = join(dir, "ledger.json");
    const history: ProjectAuditHistory = {
      schemaVersion: 1,
      projectId: "TE1-1",
      events: [clientEvent("approved")]
    };

    await syncClientAuditHistoryToServerLedger(file, history);

    await Promise.all([
      appendServerPackageEvent(file, {
        projectId: "TE1-1",
        actor: "ORBI TE Studio API",
        revisionFingerprint: "a".repeat(64)
      }),
      appendServerPackageEvent(file, {
        projectId: "TE1-1",
        actor: "ORBI TE Studio API",
        revisionFingerprint: "a".repeat(64)
      })
    ]);

    const ledger = await loadServerAuditLedger(file);
    expect(ledger.events).toHaveLength(3);
    expect(validateServerLedgerChain(ledger, "TE1-1")).toEqual([]);
  });

  it("loads only the selected project for package export", async () => {
    const dir = await mkdtemp(join(tmpdir(), "orbi-ledger-"));
    const file = join(dir, "ledger.json");
    const ledger = await loadServerAuditLedger(file);
    expect(serverAuditLedgerForProject(ledger, "TE1-1").events).toEqual([]);
  });
});
