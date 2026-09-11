export interface SvgArtifact {
  filename: string;
  mimeType: "image/svg+xml";
  content: string;
}

export function createSvgArtifact(
  filename: string,
  content: string
): SvgArtifact {
  if (!filename.endsWith(".svg")) {
    throw new Error("SVG artifact filename must end with .svg");
  }
  if (!content.includes("<svg")) {
    throw new Error("SVG artifact content is invalid");
  }

  return {
    filename,
    mimeType: "image/svg+xml",
    content
  };
}
