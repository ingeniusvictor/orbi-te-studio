import { describe, expect, it } from "vitest";
import { buildProjectManifest } from "../src/export/project-manifest.js";
import { casaGoyoReference } from "../src/reference/casa-goyo.js";

describe("project manifest", () => {
  it("does not fabricate aggregate power when circuit powers are missing", () => {
    const manifest = buildProjectManifest(casaGoyoReference);

    expect(manifest.totals.circuits).toBe(3);
    expect(manifest.totals.installedPowerW).toBe("PENDING");
    expect(manifest.totals.demandedPowerW).toBe("PENDING");
    expect(manifest.professionalReview).toBe("pending");
  });
});
