import type { TE1Project } from "../domain/types.js";
import {
  renderTE1ProjectRic18A2Svg,
  type TE1ProjectSheetOptions
} from "../drawing/render-te1-project-sheet.js";
import { buildProjectManifest } from "./project-manifest.js";
import { svgToPdfArtifact } from "./pdf-export.js";

export interface TextArtifact {
  filename: string;
  mimeType: "image/svg+xml" | "application/json";
  text: string;
}

export interface TE1GeneratedArtifacts {
  svg: TextArtifact;
  pdf: Awaited<ReturnType<typeof svgToPdfArtifact>>;
  manifest: TextArtifact;
}

export async function buildTE1GeneratedArtifacts(
  project: TE1Project,
  options: TE1ProjectSheetOptions = {}
): Promise<TE1GeneratedArtifacts> {
  const base = safeFilename(project.name || project.id);
  const svg = renderTE1ProjectRic18A2Svg(project, options);
  const manifest = buildProjectManifest(project);

  return {
    svg: {
      filename: `${base}_TE1_A2.svg`,
      mimeType: "image/svg+xml",
      text: svg
    },
    pdf: await svgToPdfArtifact(
      `${base}_TE1_A2.pdf`,
      svg,
      "A2",
      "landscape"
    ),
    manifest: {
      filename: `${base}_TE1_manifest.json`,
      mimeType: "application/json",
      text: JSON.stringify(manifest, null, 2)
    }
  };
}

function safeFilename(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 70) || "TE1"
  );
}
