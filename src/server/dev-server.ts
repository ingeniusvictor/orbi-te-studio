import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { generateTE1FromDraft } from "./generate-te1-service.js";
import { verifyEvidenceUploads, type EvidenceVerificationUpload } from "./verify-evidence-service.js";
import type { TE1FormDraft } from "../web/te1-form-model.js";

const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY_BYTES = 30 * 1024 * 1024;

const server = createServer(async (request, response) => {
  setCors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/api/health") {
    json(response, 200, {
      ok: true,
      service: "orbi-te-studio-api",
      version: "0.1"
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/te1/evidence/verify") {
    try {
      const payload = await readJsonBody(request);
      const uploads = (payload as { uploads?: EvidenceVerificationUpload[] }).uploads;

      if (!Array.isArray(uploads) || uploads.length === 0) {
        json(response, 422, {
          ok: false,
          algorithm: "SHA-256",
          verifiedAt: new Date().toISOString(),
          items: [],
          message: "La solicitud debe incluir al menos un archivo de evidencia."
        });
        return;
      }

      const result = verifyEvidenceUploads(uploads);
      json(response, result.ok ? 200 : 422, result);
      return;
    } catch (error) {
      json(response, 422, {
        ok: false,
        algorithm: "SHA-256",
        verifiedAt: new Date().toISOString(),
        items: [],
        message: "No fue posible verificar la evidencia.",
        issues: [error instanceof Error ? error.message : "Error desconocido"]
      });
      return;
    }
  }

  if (request.method === "POST" && request.url === "/api/te1/generate") {
    try {
      const payload = await readJsonBody(request);
      const draft = (payload as { draft?: TE1FormDraft }).draft;
      const projectId =
        (payload as { projectId?: string }).projectId?.trim() || "TE1-DRAFT";
      const evidenceUploads =
        (payload as { evidenceUploads?: EvidenceVerificationUpload[] }).evidenceUploads;

      if (!draft) {
        json(response, 422, {
          ok: false,
          code: "INVALID_REQUEST",
          message: "El cuerpo debe incluir un objeto draft.",
          issues: ["draft es obligatorio."]
        });
        return;
      }

      if (!Array.isArray(evidenceUploads) || evidenceUploads.length === 0) {
        json(response, 422, {
          ok: false,
          code: "INVALID_REQUEST",
          message:
            "La generación TE1 requiere evidencia binaria para verificación server-side.",
          issues: ["evidenceUploads es obligatorio."]
        });
        return;
      }

      const verification = verifyEvidenceUploads(evidenceUploads);
      if (!verification.ok) {
        json(response, 422, {
          ok: false,
          code: "EVIDENCE_VERIFICATION_FAILED",
          message:
            "La evidencia recibida no superó la verificación SHA-256 en servidor.",
          issues: verification.items.flatMap((item) =>
            item.issues.map(
              (issue) => `${item.filename} [${item.evidenceId}]: ${issue}`
            )
          ),
          evidenceVerification: verification
        });
        return;
      }

      const result = await generateTE1FromDraft(draft, projectId);
      json(
        response,
        result.ok ? 200 : result.status,
        result.ok
          ? { ...result, evidenceVerification: verification }
          : result
      );
      return;
    } catch (error) {
      json(response, 422, {
        ok: false,
        code: "INVALID_REQUEST",
        message: "No fue posible procesar la solicitud.",
        issues: [error instanceof Error ? error.message : "Error desconocido"]
      });
      return;
    }
  }

  json(response, 404, {
    ok: false,
    code: "NOT_FOUND",
    message: "Ruta no encontrada."
  });
});

server.listen(PORT, () => {
  process.stdout.write(
    `ORBI TE Studio API listening on http://localhost:${PORT}\n`
  );
});

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.byteLength;
    if (total > MAX_BODY_BYTES) {
      throw new Error("La solicitud supera el límite de 30 MB.");
    }
    chunks.push(buffer);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) throw new Error("El cuerpo de la solicitud está vacío.");
  return JSON.parse(text) as unknown;
}

function json(
  response: ServerResponse,
  status: number,
  value: unknown
): void {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(value));
}

function setCors(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", "http://localhost:5173");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
}
