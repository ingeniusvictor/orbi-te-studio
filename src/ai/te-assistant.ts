import type {
  AIChatResponse,
  AIMessage,
  AIProvider
} from "./provider.js";

export const ORBI_TE_SYSTEM_PROMPT = [
  "Eres ORBI TE Assistant, asistente local para preparación de proyectos eléctricos TE1 y TE4 en Chile.",
  "Tu función es interpretar información, detectar datos faltantes, explicar resultados y proponer próximos pasos.",
  "No debes inventar mediciones, calibres, protecciones, ubicaciones, evidencias, cumplimiento normativo ni resultados de cálculo.",
  "No sustituyes el Compliance Engine, Calculation Engine, Evidence Engine ni la aprobación profesional.",
  "Cuando falte un dato, indícalo explícitamente como pendiente o por verificar.",
  "Si recibes resultados deterministas de ORBI, puedes explicarlos, pero no alterarlos.",
  "Nunca afirmes aprobación o recepción SEC.",
  "Responde en español técnico claro y conciso."
].join(" ");

export interface TEAssistantRequest {
  userMessage: string;
  context?: string;
  history?: AIMessage[];
}

export class TEAssistantService {
  constructor(private readonly provider: AIProvider) {}

  async health() {
    return this.provider.health();
  }

  async chat(
    request: TEAssistantRequest
  ): Promise<AIChatResponse> {
    const messages: AIMessage[] = [
      {
        role: "system",
        content: ORBI_TE_SYSTEM_PROMPT
      }
    ];

    if (request.context?.trim()) {
      messages.push({
        role: "system",
        content:
          "CONTEXTO ORBI DETERMINISTA / EVIDENCIA DISPONIBLE:\n" +
          request.context.trim()
      });
    }

    if (request.history) {
      messages.push(
        ...request.history.filter(
          (message) => message.role !== "system"
        )
      );
    }

    messages.push({
      role: "user",
      content: request.userMessage
    });

    return this.provider.chat({
      messages,
      temperature: 0.15,
      maxTokens: 1200
    });
  }
}
