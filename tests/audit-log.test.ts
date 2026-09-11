import { describe, expect, it } from "vitest";
import {
  AUDIT_STORE_KEY,
  appendProjectAuditEvent,
  listProjectAuditEvents,
  validateProjectAuditChain
} from "../src/web/audit-log.js";
import type { StorageLike } from "../src/web/project-storage.js";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("project audit history", () => {
  it("appends events and chains their hashes", async () => {
    const storage = new MemoryStorage();

    const first = await appendProjectAuditEvent(storage, {
      projectId: "TE1-1",
      action: "approved",
      actor: "Profesional Prueba",
      revisionFingerprint: "rev-a",
      occurredAt: new Date("2026-09-11T03:00:00.000Z")
    });

    const second = await appendProjectAuditEvent(storage, {
      projectId: "TE1-1",
      action: "package-generated",
      actor: "ORBI TE Studio",
      revisionFingerprint: "rev-a",
      occurredAt: new Date("2026-09-11T03:10:00.000Z")
    });

    expect(second.previousHash).toBe(first.hash);
    expect(listProjectAuditEvents(storage, "TE1-1")).toHaveLength(2);
    expect(await validateProjectAuditChain(storage, "TE1-1")).toEqual([]);
  });

  it("detects local tampering", async () => {
    const storage = new MemoryStorage();

    await appendProjectAuditEvent(storage, {
      projectId: "TE1-1",
      action: "approved",
      actor: "Profesional Prueba",
      revisionFingerprint: "rev-a"
    });

    const raw = storage.getItem(AUDIT_STORE_KEY)!;
    const parsed = JSON.parse(raw) as {
      schemaVersion: number;
      events: Array<{ details: string }>;
    };
    parsed.events[0]!.details = "ALTERADO";
    storage.setItem(AUDIT_STORE_KEY, JSON.stringify(parsed));

    const issues = await validateProjectAuditChain(storage, "TE1-1");
    expect(issues.some((issue) => issue.includes("hash del evento"))).toBe(true);
  });
});
