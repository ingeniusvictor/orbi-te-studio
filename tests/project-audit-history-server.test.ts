import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  appendServerPackageGeneratedEvent,
  validateProjectAuditHistory
} from "../src/server/project-audit-history.js";
import type {
  ProjectAuditEvent,
  ProjectAuditHistory
} from "../src/web/audit-log.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";
import { technicalDraftFingerprint } from "../src/web/review-integrity.js";

function approvedHistory(): {
  draft: ReturnType<typeof createCasaGoyoDemoDraft>;
  history: ProjectAuditHistory;
} {
  const draft = createCasaGoyoDemoDraft();
  draft.review.reviewerName = "Profesional Prueba";
  draft.review.approved = true;
  draft.review.approvedAt = "2026-09-11T03:00:00.000Z";

  const revisionFingerprint = createHash("sha256")
    .update(technicalDraftFingerprint(draft))
    .digest("hex");

  const withoutHash = {
    schemaVersion: 1 as const,
    id: "AUDIT-1",
    projectId: "TE1-1",
    action: "approved" as const,
    actor: "Profesional Prueba",
    occurredAt: "2026-09-11T03:00:00.000Z",
    revisionFingerprint,
    details: "",
    previousHash: ""
  };

  const event: ProjectAuditEvent = {
    ...withoutHash,
    hash: createHash("sha256")
      .update(JSON.stringify(withoutHash))
      .digest("hex")
  };

  return {
    draft,
    history: {
      schemaVersion: 1,
      projectId: "TE1-1",
      events: [event]
    }
  };
}

describe("server project audit history", () => {
  it("accepts a valid approval chain for the current revision", () => {
    const { draft, history } = approvedHistory();
    expect(
      validateProjectAuditHistory("TE1-1", draft, history).valid
    ).toBe(true);
  });

  it("appends a server-authored package-generated event", () => {
    const { draft, history } = approvedHistory();
    const next = appendServerPackageGeneratedEvent(
      "TE1-1",
      draft,
      history,
      new Date("2026-09-11T03:10:00.000Z")
    );

    expect(next.events).toHaveLength(2);
    expect(next.events[1]?.action).toBe("package-generated");
    expect(next.events[1]?.previousHash).toBe(next.events[0]?.hash);
    expect(
      validateProjectAuditHistory("TE1-1", draft, {
        ...next,
        events: [next.events[0]!]
      }).valid
    ).toBe(true);
  });

  it("rejects a tampered event chain", () => {
    const { draft, history } = approvedHistory();
    history.events[0] = {
      ...history.events[0]!,
      actor: "ALTERADO"
    };

    const result = validateProjectAuditHistory(
      "TE1-1",
      draft,
      history
    );
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes("hash"))).toBe(true);
  });
});
