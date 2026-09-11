import { useEffect, useMemo, useState } from "react";
import { getEvidenceBlob } from "./evidence-store.js";
import { applyTE1VisionProposal, buildTE1VisionProposals } from "../ai/vision-observation-proposals.js";
import type { TE1FormDraft } from "./te1-form-model.js";
import { appendProjectAuditEvent } from "./audit-log.js";
import { technicalDraftFingerprint } from "./review-integrity.js";
import type {
  EvidenceCategory,
  LocalEvidenceMetadata
} from "./evidence-types.js";
import {
  blobToBase64,
  requestEvidenceVerification
} from "./generation-api.js";
import {
  requestLocalVisionAnalysis,
  requestLocalVisionHealth,
  type LocalVisionAnalysisResponse,
  type LocalVisionHealth
} from "./local-ai-client.js";

export function VisualEvidenceInsights({
  projectId,
  item,
  draft,
  onDraftChange
}: {
  projectId: string;
  item: LocalEvidenceMetadata;
  draft: TE1FormDraft;
  onDraftChange: (draft: TE1FormDraft) => void;
}) {
  const [health, setHealth] =
    useState<LocalVisionHealth | null>(null);
  const [result, setResult] =
    useState<LocalVisionAnalysisResponse | null>(null);
  const [state, setState] = useState<
    "idle" | "verifying" | "analyzing" | "error"
  >("idle");
  const [error, setError] = useState("");

  const imageSupported =
    item.mimeType === "image/jpeg" ||
    item.mimeType === "image/png" ||
    item.mimeType === "image/webp";

  useEffect(() => {
    if (!imageSupported) return;

    void requestLocalVisionHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, [imageSupported]);

  const proposals = useMemo(
    () =>
      buildTE1VisionProposals(
        (result?.observations ?? []).map((observation) => ({
          ...observation,
          evidenceId: observation.evidenceId
        }))
      ),
    [result]
  );

  if (!imageSupported) return null;

  const analyze = async () => {
    setState("verifying");
    setError("");
    setResult(null);

    try {
      const record = await getEvidenceBlob(item.id);
      if (!record) {
        throw new Error("No se encontró la evidencia local.");
      }

      const verification = await requestEvidenceVerification(
        projectId,
        [
          {
            evidenceId: record.id,
            filename: record.filename,
            mimeType: record.mimeType,
            expectedSha256: record.sha256,
            contentBase64: await blobToBase64(record.blob)
          }
        ]
      );

      if (
        !verification.ok ||
        verification.receipts.length !== 1
      ) {
        throw new Error(
          verification.issues?.join(" ") ||
            verification.items
              .flatMap((entry) => entry.issues)
              .join(" ") ||
            "No se pudo verificar la evidencia antes del análisis visual."
        );
      }

      const receipt = verification.receipts[0]!;
      setState("analyzing");

      const response = await requestLocalVisionAnalysis({
        projectId,
        receiptToken: receipt.token,
        evidenceId: item.id,
        kind: visualKind(item.category),
        instruction: instructionFor(item.category)
      });

      if (!response.ok) {
        throw new Error(
          response.issues?.join(" ") ||
            response.message ||
            "La IA visual local no pudo analizar la evidencia."
        );
      }

      setResult(response);
      setState("idle");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No fue posible analizar la evidencia."
      );
      setState("error");
    }
  };

  return (
    <div className="vision-insights">
      <div className="vision-insights-actions">
        <button
          type="button"
          className="secondary compact"
          disabled={!health?.ready || state === "verifying" || state === "analyzing"}
          onClick={() => void analyze()}
        >
          {state === "verifying"
            ? "Verificando..."
            : state === "analyzing"
              ? "Analizando..."
              : "Analizar con IA local"}
        </button>
        <small>
          {health?.ready
            ? `${health.provider} · ${health.model}`
            : "Proveedor visual no disponible"}
        </small>
      </div>

      {error && (
        <div className="generation-result error">
          <strong>Análisis visual no disponible.</strong>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="vision-result">
          <strong>Observaciones propuestas</strong>
          <small>
            No modifican el proyecto. Deben revisarse y verificarse.
          </small>

          {(result.observations ?? []).length === 0 ? (
            <p>No se obtuvieron observaciones estructuradas.</p>
          ) : (
            <div className="vision-observation-list">
              {(result.observations ?? []).map((observation, index) => (
                <div
                  className="vision-observation"
                  key={`${observation.field}-${index}`}
                >
                  <div>
                    <strong>{observation.field}</strong>
                    <span>{observation.value}</span>
                  </div>
                  <small>
                    {observation.status} · confianza {observation.confidence}
                  </small>
                  {observation.note && <p>{observation.note}</p>}
                </div>
              ))}
            </div>
          )}

          {proposals.proposals.length > 0 && (
            <div className="vision-proposal-box">
              <strong>Propuestas disponibles para revisión manual</strong>
              {proposals.proposals.map((proposal) => (
                <div
                  className="vision-proposal"
                  key={proposal.target}
                >
                  <span>{proposal.target}</span>
                  <b>{proposal.proposedValue}</b>
                  <small>
                    {proposal.confidence} · requiere aceptación manual
                  </small>
                  <button
                    type="button"
                    className="secondary compact"
                    onClick={() => {
                      const nextDraft = applyTE1VisionProposal(
                        draft,
                        proposal
                      );
                      if (typeof window !== "undefined") {
                        void appendProjectAuditEvent(
                          window.localStorage,
                          {
                            projectId,
                            action: "ai-proposal-accepted",
                            actor:
                              draft.review.reviewerName.trim() ||
                              "ORBI TE Studio",
                            revisionFingerprint:
                              technicalDraftFingerprint(nextDraft),
                            details:
                              `${proposal.target}=${proposal.proposedValue}; evidenceId=${proposal.evidenceId}; confidence=${proposal.confidence}; provider=${result?.provider ?? "unknown"}; model=${result?.model ?? "unknown"}`
                          }
                        );
                      }

                      onDraftChange(nextDraft);
                    }}
                  >
                    Aplicar propuesta
                  </button>
                </div>
              ))}
            </div>
          )}

          {(result.warnings ?? []).map((warning) => (
            <div className="vision-warning" key={warning}>
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function visualKind(category: EvidenceCategory): string {
  return category;
}

function instructionFor(category: EvidenceCategory): string {
  if (category === "board-front") {
    return "Identifica únicamente datos claramente legibles del tablero frontal: cantidad visible de protecciones, rótulos, corrientes, polos y sensibilidades. No infieras conductores ni topología oculta.";
  }
  if (category === "board-internal") {
    return "Describe únicamente conexiones y componentes claramente visibles. Marca como pendiente cualquier calibre, sección o topología no legible.";
  }
  if (category === "board-legend") {
    return "Transcribe únicamente textos y asignaciones claramente legibles de la leyenda del tablero.";
  }
  if (
    category === "architectural-plan" ||
    category === "measured-sketch" ||
    category === "legacy-plan" ||
    category === "location-sketch"
  ) {
    return "Extrae únicamente textos, dimensiones, símbolos y referencias claramente visibles. No inventes geometría ni medidas ausentes.";
  }
  if (category === "measurement") {
    return "Describe únicamente el valor visible, unidad, instrumento y contexto que puedan leerse con claridad.";
  }
  if (category === "service") {
    return "Describe únicamente elementos visibles del empalme, medidor y protecciones. No infieras características ocultas.";
  }
  if (category === "grounding") {
    return "Describe únicamente elementos visibles de puesta a tierra y valores legibles. No asumas resistencia ni continuidad.";
  }
  return "Describe únicamente observaciones eléctricas claramente visibles y marca cualquier incertidumbre como pendiente.";
}
