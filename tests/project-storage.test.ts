import { describe, expect, it } from "vitest";
import { createTE1Wizard } from "../src/wizard/te1-wizard.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";
import {
  PROJECT_STORE_KEY,
  createProjectId,
  decodeProjectStore,
  deleteStoredProject,
  listStoredProjects,
  loadStoredProject,
  saveStoredProject,
  type StorageLike
} from "../src/web/project-storage.js";

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

describe("versioned TE1 project storage", () => {
  it("returns empty state for corrupted data", () => {
    expect(decodeProjectStore("{broken").projects).toEqual([]);
  });

  it("saves and reloads a project without changing its draft", () => {
    const storage = new MemoryStorage();
    const draft = createCasaGoyoDemoDraft();
    const wizard = createTE1Wizard("TE1-REF-002");

    saveStoredProject(storage, {
      projectId: "TE1-REF-002",
      name: draft.project.name,
      draft,
      wizard
    });

    const loaded = loadStoredProject(storage, "TE1-REF-002");
    expect(loaded?.draft.project.name).toBe("Casa Goyo - Osorno");
    expect(loaded?.wizard.projectId).toBe("TE1-REF-002");
  });

  it("upserts by project id instead of duplicating", () => {
    const storage = new MemoryStorage();
    const draft = createCasaGoyoDemoDraft();
    const wizard = createTE1Wizard("TE1-REF-002");

    saveStoredProject(storage, {
      projectId: "TE1-REF-002",
      name: draft.project.name,
      draft,
      wizard
    });
    draft.project.name = "Casa Goyo actualizada";
    saveStoredProject(storage, {
      projectId: "TE1-REF-002",
      name: draft.project.name,
      draft,
      wizard
    });

    expect(listStoredProjects(storage)).toHaveLength(1);
    expect(listStoredProjects(storage)[0]?.name).toBe("Casa Goyo actualizada");
  });

  it("deletes the last project and removes the store key", () => {
    const storage = new MemoryStorage();
    const draft = createCasaGoyoDemoDraft();

    saveStoredProject(storage, {
      projectId: "TE1-REF-002",
      name: draft.project.name,
      draft,
      wizard: createTE1Wizard("TE1-REF-002")
    });
    deleteStoredProject(storage, "TE1-REF-002");

    expect(storage.getItem(PROJECT_STORE_KEY)).toBeNull();
  });

  it("creates deterministic time-based ids when time is supplied", () => {
    expect(createProjectId(new Date("2026-09-10T20:30:45.000Z"))).toBe(
      "TE1-20260910203045"
    );
  });
});
