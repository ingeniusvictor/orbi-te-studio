import { useEffect, useState } from "react";
import {
  auditProjectEvidenceLinks,
  type EvidenceLinkAudit
} from "./evidence-link-audit.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function useEvidenceAudit(
  projectId: string,
  draft: TE1FormDraft
): EvidenceLinkAudit & { checking: boolean } {
  const [result, setResult] = useState<EvidenceLinkAudit>({
    valid: false,
    issues: ["Verificando vínculos de evidencia..."]
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setChecking(true);
      try {
        const audit = await auditProjectEvidenceLinks(projectId, draft);
        if (active) setResult(audit);
      } catch (error) {
        if (active) {
          setResult({
            valid: false,
            issues: [
              error instanceof Error
                ? error.message
                : "No fue posible auditar la evidencia local."
            ]
          });
        }
      } finally {
        if (active) setChecking(false);
      }
    };

    void run();

    const handler = () => void run();
    window.addEventListener("orbi:evidence-changed", handler);
    return () => {
      active = false;
      window.removeEventListener("orbi:evidence-changed", handler);
    };
  }, [projectId, draft]);

  return { ...result, checking };
}
