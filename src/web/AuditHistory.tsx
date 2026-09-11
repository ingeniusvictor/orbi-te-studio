import { useEffect, useState } from "react";
import {
  listProjectAuditEvents,
  validateProjectAuditChain,
  type ProjectAuditEvent
} from "./audit-log.js";

export function AuditHistory({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<ProjectAuditEvent[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [checking, setChecking] = useState(true);

  const refresh = async () => {
    if (typeof window === "undefined") return;

    setChecking(true);
    const nextEvents = listProjectAuditEvents(
      window.localStorage,
      projectId
    );
    const nextIssues = await validateProjectAuditChain(
      window.localStorage,
      projectId
    );
    setEvents(nextEvents);
    setIssues(nextIssues);
    setChecking(false);
  };

  useEffect(() => {
    void refresh();

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string }>).detail;
      if (!detail?.projectId || detail.projectId === projectId) {
        void refresh();
      }
    };

    window.addEventListener("orbi:audit-changed", handler);
    return () => window.removeEventListener("orbi:audit-changed", handler);
  }, [projectId]);

  return (
    <section className="audit-history">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TRAZABILIDAD</p>
          <h3>Historial de revisión y generación</h3>
        </div>
        <span
          className={`status-pill ${
            checking ? "warning" : issues.length === 0 ? "complete" : "blocked"
          }`}
        >
          {checking
            ? "Verificando"
            : issues.length === 0
              ? "Cadena válida"
              : "Cadena alterada"}
        </span>
      </div>

      <p className="audit-note">
        Historial append-only local con cadena SHA-256. Permite detectar
        alteraciones dentro del almacenamiento del navegador, pero no equivale
        a un registro externo, firma digital ni certificación SEC.
      </p>

      {issues.length > 0 && (
        <div className="generation-result error">
          <strong>Se detectaron inconsistencias en el historial.</strong>
          <ul>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {events.length === 0 ? (
        <div className="evidence-empty">
          Aún no existen eventos de aprobación, invalidación o generación.
        </div>
      ) : (
        <div className="audit-event-list">
          {[...events].reverse().map((event) => (
            <article className="audit-event" key={event.id}>
              <div className="audit-event-head">
                <strong>{actionLabel(event.action)}</strong>
                <span>{formatDate(event.occurredAt)}</span>
              </div>
              <small>Actor: {event.actor}</small>
              <small>
                Revisión: {event.revisionFingerprint.slice(0, 16)}…
              </small>
              <small>Evento: {event.hash.slice(0, 16)}…</small>
              {event.details && <p>{event.details}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function actionLabel(action: ProjectAuditEvent["action"]): string {
  if (action === "approved") return "Aprobación profesional ORBI";
  if (action === "approval-invalidated") return "Aprobación invalidada";
  return "Paquete TE1 generado";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(date);
}
