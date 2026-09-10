export async function sha256Blob(blob: Blob): Promise<string> {
  if (
    typeof crypto === "undefined" ||
    !crypto.subtle ||
    typeof crypto.subtle.digest !== "function"
  ) {
    throw new Error("SHA-256 no está disponible en este entorno.");
  }

  const bytes = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function shortSha256(hash: string): string {
  if (!hash) return "SIN HASH";
  return `${hash.slice(0, 12)}…`;
}
