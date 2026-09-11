import { useCallback, useEffect, useState } from "react";
import type { TE1WizardState } from "../wizard/te1-wizard.js";
import type { TE1FormDraft } from "./te1-form-model.js";
import {
  deleteStoredProject,
  listStoredProjects,
  loadStoredProject,
  saveStoredProject,
  type StoredTE1Project
} from "./project-storage.js";

export function useProjectStorage() {
  const [projects, setProjects] = useState<StoredTE1Project[]>([]);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    setProjects(listStoredProjects(window.localStorage));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    (projectId: string, draft: TE1FormDraft, wizard: TE1WizardState) => {
      if (typeof window === "undefined") return;
      saveStoredProject(window.localStorage, {
        projectId,
        name: draft.project.name,
        draft,
        wizard
      });
      refresh();
    },
    [refresh]
  );

  const load = useCallback((projectId: string) => {
    if (typeof window === "undefined") return undefined;
    return loadStoredProject(window.localStorage, projectId);
  }, []);

  const remove = useCallback(
    (projectId: string) => {
      if (typeof window === "undefined") return;
      deleteStoredProject(window.localStorage, projectId);
      refresh();
    },
    [refresh]
  );

  return {
    projects,
    save,
    load,
    remove,
    refresh
  };
}
