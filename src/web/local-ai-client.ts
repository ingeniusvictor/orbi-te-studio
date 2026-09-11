export interface LocalAIHealth {
  ok: boolean;
  provider: string;
  model: string;
  ready: boolean;
  detail: string;
}

export interface LocalAIChatResponse {
  ok: boolean;
  provider?: string;
  model?: string;
  content?: string;
  done?: boolean;
  message?: string;
  issues?: string[];
}

export async function requestLocalAIHealth(): Promise<LocalAIHealth> {
  const response = await fetch("/api/ai/health", {
    headers: { accept: "application/json" }
  });
  return (await response.json()) as LocalAIHealth;
}

export async function requestLocalAIChat(input: {
  userMessage: string;
  context?: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}): Promise<LocalAIChatResponse> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });

  return (await response.json()) as LocalAIChatResponse;
}
