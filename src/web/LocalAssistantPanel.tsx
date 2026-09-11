import { useEffect, useState } from "react";
import type { TE1FormDraft } from "./te1-form-model.js";
import {
  requestLocalAIChat,
  requestLocalAIHealth,
  type LocalAIHealth
} from "./local-ai-client.js";
import { buildTEAssistantContext } from "./te-ai-context.js";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

export function LocalAssistantPanel({
  draft,
  projectId
}: {
  draft: TE1FormDraft;
  projectId: string;
}) {
  const [health, setHealth] = useState<LocalAIHealth | null>(null);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshHealth = async () => {
    try {
      setHealth(await requestLocalAIHealth());
    } catch {
      setHealth(null);
    }
  };

  useEffect(() => {
    void refreshHealth();
  }, []);

  const send = async () => {
    const userMessage = input.trim();
    if (!userMessage || busy) return;

    setBusy(true);
    setError("");
    setInput("");

    const previousHistory = history;
    setHistory([
      ...previousHistory,
      { role: "user", content: userMessage }
    ]);

    try {
      const response = await requestLocalAIChat({
        userMessage,
        context: buildTEAssistantContext(projectId, draft),
        history: previousHistory.slice(-10)
      });

      if (!response.ok || !response.content) {
        setError(
          response.issues?.join(" · ") ||
            response.message ||
            "El asistente local no respondió."
        );
        return;
      }

      setHistory((items) => [
        ...items,
        {
          role: "assistant",
          content: response.content!
        }
      ]);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No fue posible contactar la IA local."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="local-ai-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">IA LOCAL</p>
          <h3>ORBI TE Assistant</h3>
        </div>
        <span
          className={`status-pill ${
            health?.ready ? "complete" : "warning"
          }`}
        >
          {health?.ready
            ? `${health.provider} · ${health.model}`
            : "No disponible"}
        </span>
      </div>

      <p className="local-ai-note">
        El asistente interpreta y explica. No modifica el proyecto, no decide
        cumplimiento RIC/RGR y no reemplaza cálculos ni aprobación profesional.
        El contexto enviado excluye nombre y RUT del propietario.
      </p>

      <div className="local-ai-chat">
        {history.length === 0 ? (
          <div className="evidence-empty">
            Puedes preguntar: “¿Qué información técnica falta antes de revisar
            este proyecto?”
          </div>
        ) : (
          history.map((item, index) => (
            <div
              className={`local-ai-message ${item.role}`}
              key={`${item.role}-${index}`}
            >
              <strong>
                {item.role === "user" ? "Tú" : "ORBI TE"}
              </strong>
              <p>{item.content}</p>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="generation-result error">
          <strong>IA local no disponible.</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="local-ai-compose">
        <textarea
          rows={3}
          value={input}
          placeholder="Pregunta sobre datos faltantes, evidencia o resultados ya calculados por ORBI..."
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          type="button"
          className="primary"
          disabled={!health?.ready || busy || !input.trim()}
          onClick={() => void send()}
        >
          {busy ? "Consultando..." : "Preguntar a IA local"}
        </button>
      </div>
    </section>
  );
}
