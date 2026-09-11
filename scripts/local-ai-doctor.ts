import { createAIProviderFromEnv } from "../src/ai/provider-registry.js";
import { createVisionProviderFromEnv } from "../src/ai/vision-provider-registry.js";

async function main(): Promise<void> {
  const textProvider = createAIProviderFromEnv();
  const textHealth = await textProvider.health();

  process.stdout.write("ORBI TE Studio - Local AI Doctor\n");
  process.stdout.write("--------------------------------\n");
  process.stdout.write(
    `Text provider: ${textHealth.provider}\n`
  );
  process.stdout.write(
    `Text model:    ${textHealth.model}\n`
  );
  process.stdout.write(
    `Text ready:    ${textHealth.ready ? "YES" : "NO"}\n`
  );
  process.stdout.write(
    `Text detail:   ${textHealth.detail}\n`
  );

  const visionProvider = createVisionProviderFromEnv();
  if (!visionProvider) {
    process.stdout.write("Vision:        DISABLED\n");
  } else {
    const visionHealth = await visionProvider.health();
    process.stdout.write(
      `Vision provider: ${visionHealth.provider}\n`
    );
    process.stdout.write(
      `Vision model:    ${visionHealth.model}\n`
    );
    process.stdout.write(
      `Vision ready:    ${visionHealth.ready ? "YES" : "NO"}\n`
    );
    process.stdout.write(
      `Vision detail:   ${visionHealth.detail}\n`
    );

    if (!visionHealth.ready) {
      process.exitCode = 2;
    }
  }

  if (!textHealth.ready) {
    process.exitCode = 2;
  }
}

void main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Unknown error"}\n`
  );
  process.exitCode = 1;
});
