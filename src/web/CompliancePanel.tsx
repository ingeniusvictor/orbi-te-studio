import { buildComplianceSummary } from "./compliance-summary.js";
import type { TE1FormDraft } from "./te1-form-model.js";

export function CompliancePanel({ draft }: { draft: TE1FormDraft }) {
  const summary = buildComplianceSummary(draft);

  return (
    <div className="compliance-panel">
      <div className="compliance-summary-grid">
        <Metric label="PASS" value={summary.passCount} tone="pass" />
        <Metric label="BLOCKERS" value={summary.blockerCount} tone="blocker" />
        <Metric
          label="NO VERIFICABLE"
          value={summary.notVerifiableCount}
          tone="unknown"
        />
        <Metric label="ADVERTENCIAS" value={summary.warningCount} tone="warning" />
      </div>

      <div className={`compliance-banner ${summary.ready ? "ready" : "blocked"}`}>
        <strong>
          {summary.ready
            ? "Sin blockers normativos en las reglas actualmente implementadas."
            : "La verificación RIC aún no puede cerrarse."}
        </strong>
        <span>
          Solo se evalúan reglas ya codificadas y vinculadas a fuente. La revisión
          profesional final sigue siendo obligatoria.
        </span>
      </div>

      <div className="compliance-list">
        {summary.items.map((item) => (
          <article className="compliance-card" key={item.code}>
            <div className="compliance-card-head">
              <div>
                <small>{item.code}</small>
                <strong>{item.title}</strong>
              </div>
              <span className={`compliance-state ${item.status}`}>
                {statusLabel(item.status)}
              </span>
            </div>

            <p>{item.message}</p>
            <footer>
              <span>{item.sourceLabel}</span>
              {item.sourceUrl && (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  Fuente SEC ↗
                </a>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "pass" | "blocker" | "warning" | "unknown";
}) {
  return (
    <div className={`metric-card ${tone}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function statusLabel(status: string): string {
  if (status === "pass") return "PASS";
  if (status === "blocker") return "BLOCKER";
  if (status === "warning") return "WARNING";
  return "NO VERIFICABLE";
}
