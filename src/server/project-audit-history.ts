import { createHash, randomUUID } from "node:crypto";
import type {
  ProjectAuditEvent,
  ProjectAuditHistory
} from "../web/audit-log.js";
import type { TE1FormDraft } from "../web/te1-form-model.js";
import { technicalDraftFingerprint } from "../web/review-integrity.js";

const ALLOWED_ACTIONS = new Set([
  "approved",
  "approval-invalidated",
  "package-generated"
]);

export interface ProjectAuditValidationResult {
  valid: boolean;
  issues: string[];
  revisionFingerprint: string;
}

export function validateProjectAuditHistory(
  projectId: string,
  draft: TE1FormDraft,
  history: ProjectAuditHistory
): ProjectAuditValidationResult {
  const issues: string[] = [];
  const currentRevision = sha256Text(technicalDraftFingerprint(draft));

  if (history.schemaVersion !== 1) {
    issues.push("El historial de auditoría usa una versión no soportada.");
  }

  if (history.projectId !== projectId) {
    issues.push("El projectId del historial de auditoría no coincide.");
  }

  if (!Array.isArray(history.events) || history.events.length === 0) {
    issues.push(
      "El proyecto aprobado no tiene historial de auditoría. Requiere nueva aprobación profesional."
    );
    return {
      valid: false,
      issues,
      revisionFingerprint: currentRevision
    };
  }

  let previousHash = "";
  for (const event of history.events) {
    if (event.projectId !== projectId) {
      issues.push(`${event.id}: projectId no coincide.`);
    }
    if (!ALLOWED_ACTIONS.has(event.action)) {
      issues.push(`${event.id}: acción de auditoría no permitida.`);
    }
    if (event.previousHash !== previousHash) {
      issues.push(`${event.id}: previousHash no coincide.`);
    }

    const { hash, ...withoutHash } = event;
    const expectedHash = sha256Text(JSON.stringify(withoutHash));
    if (hash !== expectedHash) {
      issues.push(`${event.id}: hash del evento no coincide.`);
    }

    previousHash = event.hash;
  }

  const currentRevisionEvents = history.events.filter(
    (event) => event.revisionFingerprint === currentRevision
  );
  const latestApprovalIndex = currentRevisionEvents.findLastIndex(
    (event) => event.action === "approved"
  );

  if (latestApprovalIndex < 0) {
    issues.push(
      "La revisión técnica actual no tiene una aprobación profesional vigente en el historial."
    );
  } else {
    const afterApproval = currentRevisionEvents.slice(
      latestApprovalIndex + 1
    );
    if (
      afterApproval.some(
        (event) => event.action === "approval-invalidated"
      )
    ) {
      issues.push(
        "La aprobación profesional de la revisión técnica actual fue invalidada."
      );
    }
  }

  if (!draft.review.approved || !draft.review.reviewerName.trim()) {
    issues.push("El draft actual no tiene aprobación profesional vigente.");
  }

  return {
    valid: issues.length === 0,
    issues,
    revisionFingerprint: currentRevision
  };
}

export function appendServerPackageGeneratedEvent(
  projectId: string,
  draft: TE1FormDraft,
  history: ProjectAuditHistory,
  generatedAt = new Date()
): ProjectAuditHistory {
  const validation = validateProjectAuditHistory(
    projectId,
    draft,
    history
  );
  if (!validation.valid) {
    throw new Error(validation.issues.join(" "));
  }

  const previousHash = history.events.at(-1)?.hash ?? "";
  const eventWithoutHash = {
    schemaVersion: 1 as const,
    id: randomUUID(),
    projectId,
    action: "package-generated" as const,
    actor: draft.review.reviewerName.trim() || "ORBI TE Studio",
    occurredAt: generatedAt.toISOString(),
    revisionFingerprint: validation.revisionFingerprint,
    details:
      "Paquete TE1 generado por ORBI TE Studio después de validación server-side.",
    previousHash
  };

  const event: ProjectAuditEvent = {
    ...eventWithoutHash,
    hash: sha256Text(JSON.stringify(eventWithoutHash))
  };

  return {
    schemaVersion: 1,
    projectId,
    events: [...history.events, event]
  };
}

export function projectAuditHistoryToJson(
  history: ProjectAuditHistory
): string {
  return JSON.stringify(history, null, 2);
}

function sha256Text(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
