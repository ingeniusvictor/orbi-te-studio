import { describe, expect, it } from "vitest";
import {
  buildTE1PackageZip,
  packagePathForArtifact
} from "../src/server/te1-package-zip.js";

describe("TE1 organized ZIP package", () => {
  it("classifies package artifacts into deterministic folders", () => {
    expect(packagePathForArtifact("LEEME_ORBI_TE1.txt")).toBe(
      "LEEME_ORBI_TE1.txt"
    );
    expect(packagePathForArtifact("Casa_TE1_A2.pdf")).toBe(
      "01_Planos/Casa_TE1_A2.pdf"
    );
    expect(
      packagePathForArtifact("Casa_TE1_tablero_frontal.svg")
    ).toBe(
      "01_Planos/Casa_TE1_tablero_frontal.svg"
    );
    expect(
      packagePathForArtifact("TE1_TE1_informe_fotografico.pdf")
    ).toBe(
      "02_Informes/TE1_TE1_informe_fotografico.pdf"
    );
    expect(
      packagePathForArtifact("TE1_TE1_evidence_manifest.json")
    ).toBe(
      "03_Evidencia/TE1_TE1_evidence_manifest.json"
    );
    expect(
      packagePathForArtifact("TE1_TE1_audit_history.json")
    ).toBe(
      "04_Integridad/TE1_TE1_audit_history.json"
    );
    expect(
      packagePathForArtifact("TE1_TE1_server_audit_ledger.json")
    ).toBe(
      "04_Integridad/TE1_TE1_server_audit_ledger.json"
    );
    expect(
      packagePathForArtifact("TE1_TE1_package_index.json")
    ).toBe(
      "04_Integridad/TE1_TE1_package_index.json"
    );
  });

  it("generates a valid ZIP container signature", () => {
    const zip = buildTE1PackageZip(
      "TE1-1",
      [
        {
          filename: "Casa_TE1_A2.svg",
          mimeType: "image/svg+xml",
          encoding: "utf8",
          content: "<svg/>"
        },
        {
          filename: "TE1-1_TE1_package_index.json",
          mimeType: "application/json",
          encoding: "utf8",
          content: "{}"
        }
      ],
      new Date("2026-09-11T02:30:00.000Z")
    );

    expect(zip.filename).toBe("TE1-1_TE1_package.zip");
    expect(zip.bytes.byteLength).toBeGreaterThan(100);
    expect(Array.from(zip.bytes.slice(0, 4))).toEqual([
      0x50, 0x4b, 0x03, 0x04
    ]);

    const raw = Buffer.from(zip.bytes).toString("latin1");
    expect(raw).toContain("01_Planos/Casa_TE1_A2.svg");
    expect(raw).toContain(
      "04_Integridad/TE1-1_TE1_package_index.json"
    );
  });
});
