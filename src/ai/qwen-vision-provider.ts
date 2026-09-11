import type {
  VisionAnalysisResult,
  VisionEvidenceInput,
  VisionObservation,
  VisionProvider,
  VisionProviderHealth
} from "./vision-provider.js";

export interface QwenVisionProviderOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

interface OllamaVisionResponse {
  model?: string;
  message?: {
    content?: string;
  };
  error?: string;
}

export class QwenVisionProvider implements VisionProvider {
  readonly id = "qwen-vision-local";
  readonly model: string;

  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: QwenVisionProviderOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://127.0.0.1:11434")
      .replace(/\/+$/, "");
    this.model = options.model ?? "qwen2.5vl:3b";
    this.timeoutMs = options.timeoutMs ?? 120_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async health(): Promise<VisionProviderHealth> {
    try {
      const response = await this.request("/api/tags", {
        method: "GET"
      });
      if (!response.ok) {
        return {
          provider: this.id,
          model: this.model,
          ready: false,
          detail: `Ollama respondió HTTP ${response.status}.`
        };
      }

      const body = (await response.json()) as {
        models?: Array<{ name?: string; model?: string }>;
      };
      const names = (body.models ?? []).flatMap((item) => [
        item.name ?? "",
        item.model ?? ""
      ]);
      const modelPresent = names.some(
        (name) =>
          name === this.model ||
          name.startsWith(`${this.model}:`) ||
          this.model.startsWith(`${name}:`)
      );

      return {
        provider: this.id,
        model: this.model,
        ready: modelPresent,
        detail: modelPresent
          ? "Ollama y el modelo visual Qwen están disponibles."
          : `Ollama está disponible, pero no se encontró ${this.model}.`
      };
    } catch (error) {
      return {
        provider: this.id,
        model: this.model,
        ready: false,
        detail:
          error instanceof Error
            ? error.message
            : "No fue posible conectar con Ollama Vision."
      };
    }
  }

  async analyze(
    evidence: VisionEvidenceInput,
    instruction: string
  ): Promise<VisionAnalysisResult> {
    if (!instruction.trim()) {
      throw new Error("La instrucción visual es obligatoria.");
    }

    if (evidence.bytes.byteLength === 0) {
      throw new Error("La evidencia visual está vacía.");
    }

    const imageBase64 = Buffer.from(evidence.bytes).toString("base64");
    const response = await this.request("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        format: "json",
        messages: [
          {
            role: "system",
            content: [
              "Analiza evidencia eléctrica solo como observador.",
              "No inventes valores que no sean legibles.",
              "No determines cumplimiento normativo.",
              "No calcules conductores, protecciones ni potencia.",
              "Devuelve JSON con observations y warnings.",
              "Cada observation debe tener field, value, confidence, status y note.",
              "status solo puede ser OBSERVED o PENDING.",
              "confidence solo high, medium, low o unknown."
            ].join(" ")
          },
          {
            role: "user",
            content:
              `Tipo de evidencia: ${evidence.kind}. ${instruction}`,
            images: [imageBase64]
          }
        ]
      })
    });

    const body = (await response.json()) as OllamaVisionResponse;
    if (!response.ok) {
      throw new Error(
        body.error ||
          `Ollama Vision devolvió HTTP ${response.status}.`
      );
    }

    const raw = body.message?.content;
    if (!raw) {
      throw new Error("Ollama Vision respondió sin contenido.");
    }

    return normalizeVisionResult(
      raw,
      evidence.evidenceId,
      body.model ?? this.model,
      this.id
    );
  }

  private async request(
    path: string,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.timeoutMs
    );

    try {
      return await this.fetchImpl(
        `${this.baseUrl}${path}`,
        {
          ...init,
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

function normalizeVisionResult(
  raw: string,
  evidenceId: string,
  model: string,
  provider: string
): VisionAnalysisResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      provider,
      model,
      observations: [],
      warnings: [
        "La IA visual no devolvió JSON válido. Requiere revisión manual."
      ]
    };
  }

  if (!isRecord(parsed)) {
    return {
      provider,
      model,
      observations: [],
      warnings: ["La salida visual no tiene estructura válida."]
    };
  }

  const observations: VisionObservation[] = [];
  if (Array.isArray(parsed.observations)) {
    for (const item of parsed.observations) {
      if (!isRecord(item)) continue;

      const field =
        typeof item.field === "string" ? item.field.trim() : "";
      const value =
        typeof item.value === "string" ? item.value.trim() : "";
      if (!field || !value) continue;

      const confidence = normalizeConfidence(item.confidence);
      const status =
        item.status === "OBSERVED" ? "OBSERVED" : "PENDING";
      const note =
        typeof item.note === "string" ? item.note.trim() : "";

      observations.push({
        field,
        value,
        confidence,
        status,
        evidenceId,
        note
      });
    }
  }

  const warnings = Array.isArray(parsed.warnings)
    ? parsed.warnings.filter(
        (value): value is string => typeof value === "string"
      )
    : [];

  return {
    provider,
    model,
    observations,
    warnings
  };
}

function normalizeConfidence(
  value: unknown
): VisionObservation["confidence"] {
  if (
    value === "high" ||
    value === "medium" ||
    value === "low" ||
    value === "unknown"
  ) {
    return value;
  }
  return "unknown";
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
