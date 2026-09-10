import { describe, expect, it } from "vitest";
import {
  EVIDENCE_MAX_FILE_BYTES,
  formatEvidenceSize,
  validateEvidenceFile
} from "../src/web/evidence-types.js";

function file(
  name: string,
  type: string,
  size: number
): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("local TE1 evidence policy", () => {
  it("accepts a normal PDF", () => {
    expect(validateEvidenceFile(file("plano.pdf", "application/pdf", 1024))).toEqual([]);
  });

  it("rejects unsupported formats", () => {
    expect(
      validateEvidenceFile(file("datos.csv", "text/csv", 100))
    ).toContain("Formato no soportado. Use PDF, JPG, PNG o WEBP.");
  });

  it("rejects files over 20 MB", () => {
    const oversized = file(
      "foto.jpg",
      "image/jpeg",
      EVIDENCE_MAX_FILE_BYTES + 1
    );
    expect(validateEvidenceFile(oversized)).toContain(
      "El archivo supera el límite local de 20 MB."
    );
  });

  it("formats evidence sizes for the UI", () => {
    expect(formatEvidenceSize(1024)).toBe("1.0 KB");
    expect(formatEvidenceSize(1024 * 1024)).toBe("1.0 MB");
  });
});
