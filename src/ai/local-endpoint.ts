export function normalizeLocalAIBaseUrl(value: string): string {
  const trimmed = value.trim();
  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("La URL del proveedor IA local no es válida.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      "El proveedor IA local solo admite HTTP o HTTPS."
    );
  }

  const host = url.hostname.toLowerCase();
  const loopback =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1";

  if (!loopback) {
    throw new Error(
      "ORBI TE Studio v0.1 solo permite proveedores IA en localhost/loopback."
    );
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/+$/, "");
}
