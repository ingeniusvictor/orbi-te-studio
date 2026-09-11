import { createAIProviderFromEnv } from "../src/ai/provider-registry.js";
import { TEAssistantService } from "../src/ai/te-assistant.js";

async function main(): Promise<void> {
  const provider = createAIProviderFromEnv();

  if (provider.id === "mock") {
    process.stderr.write(
      [
        "AI smoke test requires a real local provider.",
        "Set ORBI_AI_PROVIDER=qwen-local before running npm run ai:smoke."
      ].join("\n") + "\n"
    );
    process.exitCode = 2;
    return;
  }

  const assistant = new TEAssistantService(provider);
  const health = await assistant.health();

  process.stdout.write("ORBI TE Studio - Local AI Smoke\n");
  process.stdout.write("--------------------------------\n");
  process.stdout.write(`Provider: ${health.provider}\n`);
  process.stdout.write(`Model:    ${health.model}\n`);
  process.stdout.write(`Ready:    ${health.ready ? "YES" : "NO"}\n`);
  process.stdout.write(`Detail:   ${health.detail}\n`);

  if (!health.ready) {
    process.exitCode = 2;
    return;
  }

  const response = await assistant.chat({
    userMessage:
      "Indica brevemente qué dato sigue pendiente y aclara que no puedes inventarlo.",
    context: [
      "Project ID: TE1-SMOKE",
      "Proyecto: Vivienda de prueba",
      "Sistema: monofasico",
      "Tensión nominal declarada: 220 V",
      "Conductor del circuito 1: PENDIENTE",
      "Nota de control: los cálculos pertenecen al núcleo determinista ORBI."
    ].join("\n")
  });

  process.stdout.write("\nResponse\n");
  process.stdout.write("--------\n");
  process.stdout.write(response.content.trim() + "\n");

  if (!response.content.trim()) {
    process.exitCode = 3;
  }
}

void main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Unknown error"}\n`
  );
  process.exitCode = 1;
});
