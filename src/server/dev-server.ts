import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { generateTE1FromDraft } from "./generate-te1-service.js";
import { verifyEvidenceUploads, type EvidenceVerificationUpload } from "./verify-evidence-service.js";
import { consumeEvidenceVerificationReceipts, createEvidenceVerificationReceipt, validateEvidenceVerificationReceipts } from "./evidence-verification-registry.js";
import { auditReceiptCoverage } from "./evidence-generation-gate.js";
import { buildServerEvidenceVerificationManifest, serverEvidenceVerificationManifestToJson } from "./evidence-verification-manifest.js";
import { buildProjectEvidenceReport } from "./project-evidence-report.js";
import { buildTE1PhotographicReport } from "./te1-photographic-report.js";
import { consumeVerifiedEvidenceBuffers, storeVerifiedEvidenceBuffer } from "./verified-evidence-buffer-registry.js";
import { buildTE1PackageIndex, te1PackageIndexToJson, type PackageArtifactInput } from "./te1-package-index.js";
import { validateEvidenceManifestAgainstReceipts } from "./evidence-manifest-gate.js";
import { buildTE1PackageZip } from "./te1-package-zip.js";
import { buildTE1PackageReadme } from "./te1-package-readme.js";
import type { EvidenceManifest } from "../web/evidence-manifest.js";
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
      const projectId =
        (payload as { projectId?: string }).projectId?.trim() || "TE1-DRAFT";
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
      const receipts = result.ok
        ? result.items.map((item, index) => {
            const receipt = createEvidenceVerificationReceipt(
              projectId,
              item.evidenceId,
              item.actualSha256,
              new Date(),
              {
                filename: item.filename,
                mimeType: item.mimeType,
                sizeBytes: item.sizeBytes
              }
            );
            const upload = uploads[index];
            if (upload) {
              storeVerifiedEvidenceBuffer(
                receipt.token,
                upload.contentBase64
              );
            }
            return receipt;
          })
        : [];
      json(response, result.ok ? 200 : 422, { ...result, receipts });
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
      const evidenceReceipts =
        (payload as {
          evidenceReceipts?: Array<{
            token: string;
            evidenceId: string;
            sha256: string;
          }>;
        }).evidenceReceipts;
      const evidenceManifestJson =
        (payload as { evidenceManifestJson?: string }).evidenceManifestJson;

      if (!draft) {
        json(response, 422, {
          ok: false,
          code: "INVALID_REQUEST",
          message: "El cuerpo debe incluir un objeto draft.",
          issues: ["draft es obligatorio."]
        });
        return;
      }

      if (!Array.isArray(evidenceReceipts) || evidenceReceipts.length === 0) {
        json(response, 422, {
          ok: false,
          code: "INVALID_REQUEST",
          message:
            "La generación TE1 requiere comprobantes de evidencia verificada.",
          issues: ["evidenceReceipts es obligatorio."]
        });
        return;
      }

      if (!evidenceManifestJson?.trim()) {
        json(response, 422, {
          ok: false,
          code: "INVALID_REQUEST",
          message: "La generación TE1 requiere evidence manifest.",
          issues: ["evidenceManifestJson es obligatorio."]
        });
        return;
      }

      let evidenceManifest: EvidenceManifest;
      try {
        evidenceManifest = JSON.parse(
          evidenceManifestJson
        ) as EvidenceManifest;
      } catch {
        json(response, 422, {
          ok: false,
          code: "INVALID_REQUEST",
          message: "El evidence manifest no contiene JSON válido.",
          issues: ["evidenceManifestJson inválido."]
        });
        return;
      }

      const receiptIssues = [
        ...auditReceiptCoverage(draft, evidenceReceipts),
        ...validateEvidenceVerificationReceipts(
          projectId,
          evidenceReceipts
        ),
        ...validateEvidenceManifestAgainstReceipts(
          projectId,
          evidenceManifest,
          evidenceReceipts
        )
      ];
      if (receiptIssues.length > 0) {
        json(response, 422, {
          ok: false,
          code: "EVIDENCE_VERIFICATION_FAILED",
          message:
            "Los comprobantes SHA-256 de evidencia no son válidos para este proyecto.",
          issues: receiptIssues
        });
        return;
      }

      const verificationManifest = buildServerEvidenceVerificationManifest(
        projectId,
        draft,
        evidenceReceipts
      );

      const evidenceReport = await buildProjectEvidenceReport(
        projectId,
        draft,
        evidenceReceipts
      );
      const photographicReport = await buildTE1PhotographicReport(
        projectId,
        draft,
        evidenceReceipts
      );

      const result = await generateTE1FromDraft(draft, projectId);
      if (!result.ok) {
        json(response, result.status, result);
        return;
      }

      const packageArtifacts: PackageArtifactInput[] = [
        ...result.artifacts,
        {
          filename: evidenceReport.filename,
          mimeType: evidenceReport.mimeType,
          encoding: "base64",
          content: Buffer.from(evidenceReport.bytes).toString("base64")
        },
        {
          filename: photographicReport.filename,
          mimeType: photographicReport.mimeType,
          encoding: "base64",
          content: Buffer.from(photographicReport.bytes).toString("base64")
        },
        {
          filename: `${projectId}_TE1_evidence_manifest.json`,
          mimeType: "application/json",
          encoding: "utf8",
          content: JSON.stringify(evidenceManifest, null, 2)
        },
        {
          filename: `${projectId}_TE1_server_verification_manifest.json`,
          mimeType: "application/json",
          encoding: "utf8",
          content: serverEvidenceVerificationManifestToJson(
            verificationManifest
          )
        }
      ];

      const packageReadme = buildTE1PackageReadme(
        projectId,
        draft
      );
      const packageArtifactsWithReadme: PackageArtifactInput[] = [
        ...packageArtifacts,
        packageReadme
      ];

      const packageIndex = buildTE1PackageIndex(
        projectId,
        packageArtifactsWithReadme
      );
      const finalArtifacts: PackageArtifactInput[] = [
        ...packageArtifactsWithReadme,
        {
          filename: `${projectId}_TE1_package_index.json`,
          mimeType: "application/json",
          encoding: "utf8",
          content: te1PackageIndexToJson(packageIndex)
        }
      ];

      const packageZip = buildTE1PackageZip(
        projectId,
        finalArtifacts
      );

      const receiptTokens = evidenceReceipts.map(
        (receipt) => receipt.token
      );
      consumeEvidenceVerificationReceipts(receiptTokens);
      consumeVerifiedEvidenceBuffers(receiptTokens);

      json(response, 200, {
        ...result,
        artifacts: [
          {
            filename: packageZip.filename,
            mimeType: packageZip.mimeType,
            encoding: "base64",
            content: Buffer.from(packageZip.bytes).toString("base64")
          },
          ...finalArtifacts
        ]
      });
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
