import { describe, expect, it } from "vitest";
import { createCasaGoyoDemoDraft } from "../src/web/te1-form-model.js";
import { draftToTE1Project } from "../src/web/draft-to-project.js";

describe("editable draft to TE1 project", () => {
  it("preserves Casa Goyo observed branch protections", () => {
    const project = draftToTE1Project(
      createCasaGoyoDemoDraft(),
      "TE1-REF-002"
    );

    expect(project.circuits.map((circuit) => circuit.protection.ratedCurrentA)).toEqual([
      10,
      16,
      16
    ]);
  });

  it("does not invent load or conductor data", () => {
    const project = draftToTE1Project(createCasaGoyoDemoDraft());

    expect(
      project.circuits.every((circuit) => circuit.installedPowerW === undefined)
    ).toBe(true);
    expect(
      project.circuits.every((circuit) => circuit.conductor === undefined)
    ).toBe(true);
  });

  it("calculates circuit current only after installed power exists", () => {
    const draft = createCasaGoyoDemoDraft();
    draft.circuits[0]!.installedPowerW = "2200";

    const project = draftToTE1Project(draft);
    expect(project.circuits[0]!.currentA).toBe(10);
  });
});
