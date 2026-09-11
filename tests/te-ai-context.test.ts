import { describe, expect, it } from "vitest";
import { buildTEAssistantContext } from "../src/web/te-ai-context.js";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";

describe("TE Assistant deterministic context", () => {
  it("excludes owner identity and RUT from AI context", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.owner.name = "Persona Privada";
    draft.owner.rut = "12.345.678-9";
    draft.board.mainCurrentA = "25";

    const context = buildTEAssistantContext("TE1-1", draft);

    expect(context).toContain("Protección general: 25 A");
    expect(context).not.toContain("Persona Privada");
    expect(context).not.toContain("12.345.678-9");
    expect(context).toContain(
      "excluye nombre y RUT del propietario"
    );
  });
});
