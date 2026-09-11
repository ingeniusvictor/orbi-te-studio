import { describe, expect, it } from "vitest";
import { normalizeLocalAIBaseUrl } from "../src/ai/local-endpoint.js";

describe("local AI endpoint policy", () => {
  it("accepts localhost and normalizes trailing slash", () => {
    expect(
      normalizeLocalAIBaseUrl("http://127.0.0.1:11434/")
    ).toBe("http://127.0.0.1:11434");
    expect(
      normalizeLocalAIBaseUrl("http://localhost:11434")
    ).toBe("http://localhost:11434");
  });

  it("rejects remote hosts", () => {
    expect(() =>
      normalizeLocalAIBaseUrl("https://example.com")
    ).toThrow("solo permite proveedores IA en localhost/loopback");
  });

  it("rejects unsupported protocols", () => {
    expect(() =>
      normalizeLocalAIBaseUrl("ftp://127.0.0.1:11434")
    ).toThrow("solo admite HTTP o HTTPS");
  });
});
