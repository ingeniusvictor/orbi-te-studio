import type { AIMessage } from "../ai/provider.js";
import type { TEAssistantRequest } from "../ai/te-assistant.js";

export interface AIRequestValidationResult {
  ok: boolean;
  value?: TEAssistantRequest;
  issues: string[];
}

export function validateTEAssistantRequest(
  payload: unknown
): AIRequestValidationResult {
  if (!isRecord(payload)) {
    return {
      ok: false,
      issues: ["El cuerpo debe ser un objeto JSON."]
    };
  }

  const issues: string[] = [];
  const userMessage = text(
    payload.userMessage,
    "userMessage",
    20_000,
    issues,
    true
  );
  const context = text(
    payload.context,
    "context",
    40_000,
    issues,
    false
  );

  const history: AIMessage[] = [];
  if (payload.history !== undefined) {
    if (!Array.isArray(payload.history)) {
      issues.push("history debe ser un arreglo.");
    } else if (payload.history.length > 20) {
      issues.push("history supera el máximo de 20 mensajes.");
    } else {
      payload.history.forEach((item, index) => {
        if (!isRecord(item)) {
          issues.push(`history[${index}] debe ser un objeto.`);
          return;
        }

        const role = item.role;
        if (role !== "user" && role !== "assistant") {
          issues.push(
            `history[${index}].role debe ser user o assistant.`
          );
          return;
        }

        const content = text(
          item.content,
          `history[${index}].content`,
          20_000,
          issues,
          true
        );

        history.push({ role, content });
      });
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const value: TEAssistantRequest = {
    userMessage
  };
  if (context) value.context = context;
  if (history.length > 0) value.history = history;

  return {
    ok: true,
    value,
    issues: []
  };
}

function text(
  value: unknown,
  label: string,
  max: number,
  issues: string[],
  required: boolean
): string {
  if (value === undefined && !required) return "";
  if (typeof value !== "string") {
    issues.push(`${label} debe ser texto.`);
    return "";
  }
  if (required && value.trim().length === 0) {
    issues.push(`${label} es obligatorio.`);
  }
  if (value.length > max) {
    issues.push(`${label} supera ${max} caracteres.`);
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
