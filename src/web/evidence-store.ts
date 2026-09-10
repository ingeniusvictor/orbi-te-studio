import {
  toEvidenceMetadata,
  validateEvidenceFile,
  type EvidenceCategory,
  type LocalEvidenceMetadata,
  type LocalEvidenceRecord
} from "./evidence-types.js";
import { sha256Blob } from "./evidence-hash.js";

const DB_NAME = "orbi-te-studio-evidence";
const DB_VERSION = 1;
const STORE_NAME = "evidence";
const PROJECT_INDEX = "projectId";

export interface AddEvidenceInput {
  projectId: string;
  category: EvidenceCategory;
  file: File;
  notes?: string;
}

export async function addEvidence(
  input: AddEvidenceInput
): Promise<LocalEvidenceMetadata> {
  const issues = validateEvidenceFile(input.file);
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }

  if (!input.projectId.trim()) {
    throw new Error("projectId es obligatorio.");
  }

  const record: LocalEvidenceRecord = {
    id: createEvidenceId(),
    projectId: input.projectId,
    category: input.category,
    filename: input.file.name,
    mimeType: input.file.type,
    sizeBytes: input.file.size,
    lastModified: input.file.lastModified,
    createdAt: new Date().toISOString(),
    notes: input.notes?.trim() ?? "",
    sha256: await sha256Blob(input.file),
    blob: input.file
  };

  const db = await openEvidenceDb();
  await runRequest(
    db.transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME)
      .put(record)
  );
  db.close();
  notifyEvidenceChanged();

  return toEvidenceMetadata(record);
}

export async function listEvidence(
  projectId: string
): Promise<LocalEvidenceMetadata[]> {
  const db = await openEvidenceDb();
  const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME);
  const index = store.index(PROJECT_INDEX);
  const records = await runRequest<Array<LocalEvidenceRecord & { sha256?: string }>>(
    index.getAll(IDBKeyRange.only(projectId))
  );
  db.close();

  const normalized = await ensureHashes(records);
  return normalized
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toEvidenceMetadata);
}

export async function getEvidenceBlob(
  id: string
): Promise<LocalEvidenceRecord | undefined> {
  const db = await openEvidenceDb();
  const raw = await runRequest<(LocalEvidenceRecord & { sha256?: string }) | undefined>(
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id)
  );
  db.close();

  if (!raw) return undefined;
  const [record] = await ensureHashes([raw]);
  return record;
}

export async function deleteEvidence(id: string): Promise<void> {
  const db = await openEvidenceDb();
  await runRequest(
    db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id)
  );
  db.close();
  notifyEvidenceChanged();
}

export async function deleteProjectEvidence(projectId: string): Promise<void> {
  const db = await openEvidenceDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const index = store.index(PROJECT_INDEX);
  const keys = await runRequest<IDBValidKey[]>(
    index.getAllKeys(IDBKeyRange.only(projectId))
  );

  for (const key of keys) {
    store.delete(key);
  }

  await transactionComplete(tx);
  db.close();
  notifyEvidenceChanged();
}

async function ensureHashes(
  records: Array<LocalEvidenceRecord & { sha256?: string }>
): Promise<LocalEvidenceRecord[]> {
  const normalized: LocalEvidenceRecord[] = [];
  const changed: LocalEvidenceRecord[] = [];

  for (const raw of records) {
    const record: LocalEvidenceRecord = {
      ...raw,
      sha256: raw.sha256?.trim() || (await sha256Blob(raw.blob))
    };
    normalized.push(record);
    if (!raw.sha256?.trim()) changed.push(record);
  }

  if (changed.length > 0) {
    const db = await openEvidenceDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const record of changed) store.put(record);
    await transactionComplete(tx);
    db.close();
  }

  return normalized;
}

function openEvidenceDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("IndexedDB no está disponible en este navegador.")
    );
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex(PROJECT_INDEX, PROJECT_INDEX, { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("No fue posible abrir IndexedDB."));
  });
}

function runRequest<T = undefined>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Operación IndexedDB fallida."));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Transacción IndexedDB fallida."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Transacción IndexedDB abortada."));
  });
}

function createEvidenceId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `EV-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function notifyEvidenceChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("orbi:evidence-changed"));
  }
}
