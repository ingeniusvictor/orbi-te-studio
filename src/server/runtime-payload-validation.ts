import type { TE1FormDraft } from "../web/te1-form-model.js";
import type { EvidenceVerificationUpload } from "./verify-evidence-service.js";

export interface EvidenceReceiptPayload {
  token: string;
  evidenceId: string;
  sha256: string;
}

export interface GenerateTE1Request {
  projectId: string;
  draft: TE1FormDraft;
  evidenceReceipts: EvidenceReceiptPayload[];
  evidenceManifestJson: string;
  auditHistoryJson: string;
}

export interface EvidenceVerifyRequest {
  projectId: string;
  uploads: EvidenceVerificationUpload[];
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  issues: string[];
}

const MEASUREMENT_KINDS = new Set([
  "supply-voltage",
  "insulation-resistance",
  "pe-continuity",
  "earthing-resistance",
  "rcd-test"
]);

const PLAN_SOURCE_TYPES = new Set([
  "",
  "architectural-plan",
  "measured-sketch",
  "legacy-plan"
]);

const DESTINATIONS = new Set([
  "casa-habitacion",
  "departamento",
  "otro"
]);

const SYSTEMS = new Set(["monofasico", "trifasico"]);
const CONDUCTOR_MATERIALS = new Set(["Cu", "Al"]);

export function validateEvidenceVerifyRequest(
  payload: unknown
): ValidationResult<EvidenceVerifyRequest> {
  const issues: string[] = [];
  if (!isRecord(payload)) {
    return invalid("El cuerpo debe ser un objeto JSON.");
  }

  const projectId = stringField(payload, "projectId", issues, {
    required: false,
    max: 120
  }) || "TE1-DRAFT";

  if (!Array.isArray(payload.uploads) || payload.uploads.length === 0) {
    issues.push("uploads debe ser un arreglo no vacío.");
  } else if (payload.uploads.length > 100) {
    issues.push("uploads supera el máximo de 100 archivos.");
  }

  const uploads: EvidenceVerificationUpload[] = [];
  if (Array.isArray(payload.uploads)) {
    payload.uploads.forEach((item, index) => {
      if (!isRecord(item)) {
        issues.push(`uploads[${index}] debe ser un objeto.`);
        return;
      }

      const prefix = `uploads[${index}]`;
      const evidenceId = stringField(item, "evidenceId", issues, {
        prefix,
        max: 160
      });
      const filename = stringField(item, "filename", issues, {
        prefix,
        max: 255
      });
      const mimeType = stringField(item, "mimeType", issues, {
        prefix,
        max: 100
      });
      const expectedSha256 = stringField(
        item,
        "expectedSha256",
        issues,
        { prefix, max: 64 }
      );
      const contentBase64 = stringField(item, "contentBase64", issues, {
        prefix,
        max: 28_000_000
      });

      uploads.push({
        evidenceId,
        filename,
        mimeType,
        expectedSha256,
        contentBase64
      });
    });
  }

  return result(issues, { projectId, uploads });
}

export function validateGenerateTE1Request(
  payload: unknown
): ValidationResult<GenerateTE1Request> {
  const issues: string[] = [];
  if (!isRecord(payload)) {
    return invalid("El cuerpo debe ser un objeto JSON.");
  }

  const projectId = stringField(payload, "projectId", issues, {
    required: false,
    max: 120
  }) || "TE1-DRAFT";

  const draft = validateDraft(payload.draft, issues);

  const evidenceReceipts: EvidenceReceiptPayload[] = [];
  if (
    !Array.isArray(payload.evidenceReceipts) ||
    payload.evidenceReceipts.length === 0
  ) {
    issues.push("evidenceReceipts debe ser un arreglo no vacío.");
  } else if (payload.evidenceReceipts.length > 100) {
    issues.push("evidenceReceipts supera el máximo de 100 elementos.");
  } else {
    payload.evidenceReceipts.forEach((item, index) => {
      if (!isRecord(item)) {
        issues.push(`evidenceReceipts[${index}] debe ser un objeto.`);
        return;
      }
      const prefix = `evidenceReceipts[${index}]`;
      evidenceReceipts.push({
        token: stringField(item, "token", issues, {
          prefix,
          max: 200
        }),
        evidenceId: stringField(item, "evidenceId", issues, {
          prefix,
          max: 160
        }),
        sha256: stringField(item, "sha256", issues, {
          prefix,
          max: 64
        })
      });
    });
  }

  const evidenceManifestJson = stringField(
    payload,
    "evidenceManifestJson",
    issues,
    { max: 2_000_000 }
  );
  const auditHistoryJson = stringField(
    payload,
    "auditHistoryJson",
    issues,
    { max: 2_000_000 }
  );

  if (evidenceManifestJson) {
    validateEvidenceManifestJson(
      evidenceManifestJson,
      projectId,
      issues
    );
  }

  if (auditHistoryJson) {
    validateAuditHistoryJson(
      auditHistoryJson,
      projectId,
      issues
    );
  }

  if (!draft) {
    return { ok: false, issues };
  }

  return result(issues, {
    projectId,
    draft,
    evidenceReceipts,
    evidenceManifestJson,
    auditHistoryJson
  });
}

function validateDraft(
  value: unknown,
  issues: string[]
): TE1FormDraft | undefined {
  if (!isRecord(value)) {
    issues.push("draft debe ser un objeto.");
    return undefined;
  }

  const requiredObjects = [
    "project",
    "owner",
    "location",
    "board",
    "plan",
    "review"
  ] as const;

  for (const field of requiredObjects) {
    if (!isRecord(value[field])) {
      issues.push(`draft.${field} debe ser un objeto.`);
    }
  }

  if (
    requiredObjects.some((field) => !isRecord(value[field]))
  ) {
    return undefined;
  }

  const project = value.project as Record<string, unknown>;
  const owner = value.owner as Record<string, unknown>;
  const location = value.location as Record<string, unknown>;
  const board = value.board as Record<string, unknown>;
  const plan = value.plan as Record<string, unknown>;
  const review = value.review as Record<string, unknown>;

  const destination = stringField(
    project,
    "destination",
    issues,
    { prefix: "draft.project", max: 40 }
  );
  if (!DESTINATIONS.has(destination)) {
    issues.push("draft.project.destination no es válido.");
  }

  const system = stringField(project, "system", issues, {
    prefix: "draft.project",
    max: 20
  });
  if (!SYSTEMS.has(system)) {
    issues.push("draft.project.system no es válido.");
  }

  [
    ["name", 200],
    ["voltageV", 20],
    ["surfaceM2", 20]
  ].forEach(([key, max]) =>
    stringField(project, String(key), issues, {
      prefix: "draft.project",
      max: Number(max),
      required: false
    })
  );

  ["name", "rut"].forEach((key) =>
    stringField(owner, key, issues, {
      prefix: "draft.owner",
      max: 200,
      required: false
    })
  );

  [
    "address",
    "commune",
    "region",
    "wgs84",
    "utm",
    "locationSketchEvidenceId",
    "locationSketchEvidenceLabel",
    "northStreet",
    "southStreet",
    "eastStreet",
    "westStreet"
  ].forEach((key) =>
    stringField(location, key, issues, {
      prefix: "draft.location",
      max: 500,
      required: false
    })
  );
  booleanField(
    location,
    "locationSketchVerified",
    issues,
    "draft.location"
  );

  [
    "name",
    "totalWays",
    "frontalEvidenceId",
    "frontalPhotoLabel",
    "legendEvidenceId",
    "legendPhotoLabel",
    "mainPoles",
    "mainCurrentA",
    "mainBreakingCapacityKA",
    "differentialPoles",
    "differentialCurrentA",
    "differentialResidualMA"
  ].forEach((key) =>
    stringField(board, key, issues, {
      prefix: "draft.board",
      max: 500,
      required: false
    })
  );

  if (!Array.isArray(value.circuits) || value.circuits.length === 0) {
    issues.push("draft.circuits debe ser un arreglo no vacío.");
  } else if (value.circuits.length > 200) {
    issues.push("draft.circuits supera el máximo de 200 circuitos.");
  } else {
    value.circuits.forEach((item, index) =>
      validateCircuit(item, index, issues)
    );
  }

  if (!Array.isArray(value.measurements)) {
    issues.push("draft.measurements debe ser un arreglo.");
  } else if (value.measurements.length > 20) {
    issues.push("draft.measurements supera el máximo de 20 mediciones.");
  } else {
    value.measurements.forEach((item, index) =>
      validateMeasurement(item, index, issues)
    );
  }

  const sourceType = stringField(plan, "sourceType", issues, {
    prefix: "draft.plan",
    max: 40,
    required: false
  });
  if (!PLAN_SOURCE_TYPES.has(sourceType)) {
    issues.push("draft.plan.sourceType no es válido.");
  }
  [
    "sourceEvidenceId",
    "sourceLabel",
    "scale",
    "notes"
  ].forEach((key) =>
    stringField(plan, key, issues, {
      prefix: "draft.plan",
      max: 2000,
      required: false
    })
  );
  ["hasElectricalPoints", "hasDimensions", "reviewed"].forEach(
    (key) =>
      booleanField(plan, key, issues, "draft.plan")
  );

  ["reviewerName", "notes", "approvedAt", "invalidatedAt", "invalidationReason"]
    .forEach((key) =>
      stringField(review, key, issues, {
        prefix: "draft.review",
        max: 4000,
        required: false
      })
    );
  ["approved", "invalidated"].forEach((key) =>
    booleanField(review, key, issues, "draft.review")
  );

  return issues.length === 0
    ? (value as unknown as TE1FormDraft)
    : undefined;
}

function validateCircuit(
  value: unknown,
  index: number,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`draft.circuits[${index}] debe ser un objeto.`);
    return;
  }

  const prefix = `draft.circuits[${index}]`;
  [
    "id",
    "number",
    "description",
    "breakerA",
    "breakingCapacityKA",
    "curve",
    "installedPowerW",
    "demandedPowerW",
    "conductorPhaseMm2",
    "conductorNeutralMm2",
    "conductorPeMm2",
    "installationMethod"
  ].forEach((key) =>
    stringField(value, key, issues, {
      prefix,
      max: 1000,
      required: false
    })
  );

  const material = stringField(
    value,
    "conductorMaterial",
    issues,
    { prefix, max: 10 }
  );
  if (!CONDUCTOR_MATERIALS.has(material)) {
    issues.push(`${prefix}.conductorMaterial no es válido.`);
  }
  booleanField(value, "conductorVerified", issues, prefix);
}

function validateMeasurement(
  value: unknown,
  index: number,
  issues: string[]
): void {
  if (!isRecord(value)) {
    issues.push(`draft.measurements[${index}] debe ser un objeto.`);
    return;
  }

  const prefix = `draft.measurements[${index}]`;
  ["id", "value", "unit", "evidenceId", "evidenceLabel", "notes"]
    .forEach((key) =>
      stringField(value, key, issues, {
        prefix,
        max: 2000,
        required: false
      })
    );

  const kind = stringField(value, "kind", issues, {
    prefix,
    max: 80
  });
  if (!MEASUREMENT_KINDS.has(kind)) {
    issues.push(`${prefix}.kind no es válido.`);
  }
  booleanField(value, "verified", issues, prefix);
}

function validateEvidenceManifestJson(
  raw: string,
  projectId: string,
  issues: string[]
): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    issues.push("evidenceManifestJson no contiene JSON válido.");
    return;
  }

  if (!isRecord(parsed)) {
    issues.push("evidenceManifestJson debe representar un objeto.");
    return;
  }

  if (parsed.schemaVersion !== 1) {
    issues.push("Evidence Manifest schemaVersion debe ser 1.");
  }
  if (parsed.projectId !== projectId) {
    issues.push("Evidence Manifest projectId no coincide.");
  }
  if (parsed.algorithm !== "SHA-256") {
    issues.push("Evidence Manifest algorithm debe ser SHA-256.");
  }
  if (!Array.isArray(parsed.entries)) {
    issues.push("Evidence Manifest entries debe ser un arreglo.");
    return;
  }
  if (parsed.entries.length > 500) {
    issues.push("Evidence Manifest supera 500 entradas.");
  }

  parsed.entries.forEach((entry, index) => {
    if (!isRecord(entry)) {
      issues.push(`Evidence Manifest entries[${index}] debe ser un objeto.`);
      return;
    }
    [
      "evidenceId",
      "role",
      "filename",
      "category",
      "mimeType",
      "sha256",
      "createdAt"
    ].forEach((key) =>
      stringField(entry, key, issues, {
        prefix: `Evidence Manifest entries[${index}]`,
        max: 1000
      })
    );
    if (
      typeof entry.sizeBytes !== "number" ||
      !Number.isSafeInteger(entry.sizeBytes) ||
      entry.sizeBytes < 0
    ) {
      issues.push(
        `Evidence Manifest entries[${index}].sizeBytes no es válido.`
      );
    }
  });

}

function validateAuditHistoryJson(
  raw: string,
  projectId: string,
  issues: string[]
): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    issues.push("auditHistoryJson no contiene JSON válido.");
    return;
  }

  if (!isRecord(parsed)) {
    issues.push("auditHistoryJson debe representar un objeto.");
    return;
  }

  if (parsed.schemaVersion !== 1) {
    issues.push("Audit History schemaVersion debe ser 1.");
  }
  if (parsed.projectId !== projectId) {
    issues.push("Audit History projectId no coincide.");
  }
  if (!Array.isArray(parsed.events)) {
    issues.push("Audit History events debe ser un arreglo.");
    return;
  }
  if (parsed.events.length > 5000) {
    issues.push("Audit History supera 5000 eventos.");
  }

  parsed.events.forEach((event, index) => {
    if (!isRecord(event)) {
      issues.push(`Audit History events[${index}] debe ser un objeto.`);
      return;
    }

    [
      "id",
      "projectId",
      "action",
      "actor",
      "occurredAt",
      "revisionFingerprint",
      "details",
      "previousHash",
      "hash"
    ].forEach((key) =>
      stringField(event, key, issues, {
        prefix: `Audit History events[${index}]`,
        max: 5000
      })
    );
  });

}

function stringField(
  object: Record<string, unknown>,
  key: string,
  issues: string[],
  options: {
    prefix?: string;
    required?: boolean;
    max: number;
  }
): string {
  const label = options.prefix
    ? `${options.prefix}.${key}`
    : key;
  const value = object[key];
  const required = options.required ?? true;

  if (value === undefined && !required) return "";
  if (typeof value !== "string") {
    issues.push(`${label} debe ser texto.`);
    return "";
  }
  if (value.length > options.max) {
    issues.push(`${label} supera el máximo de ${options.max} caracteres.`);
  }
  if (required && value.length === 0) {
    issues.push(`${label} es obligatorio.`);
  }
  return value;
}

function booleanField(
  object: Record<string, unknown>,
  key: string,
  issues: string[],
  prefix: string
): boolean {
  const value = object[key];
  if (typeof value !== "boolean") {
    issues.push(`${prefix}.${key} debe ser booleano.`);
    return false;
  }
  return value;
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function invalid<T>(issue: string): ValidationResult<T> {
  return { ok: false, issues: [issue] };
}

function result<T>(
  issues: string[],
  value: T
): ValidationResult<T> {
  return issues.length === 0
    ? { ok: true, value, issues: [] }
    : { ok: false, issues };
}
