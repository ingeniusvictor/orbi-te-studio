export function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  className = "thin"
): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${className}" />`;
}

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  className = "thin"
): string {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" class="${className}" />`;
}

export function text(
  x: number,
  y: number,
  value: string,
  className = "txt",
  anchor: "start" | "middle" | "end" = "start"
): string {
  return `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}">${esc(value)}</text>`;
}

export function circle(
  cx: number,
  cy: number,
  r: number,
  className = "thin"
): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" class="${className}" />`;
}
