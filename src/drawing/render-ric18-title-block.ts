import type { TitleBlock } from "./sheet-model.js";
import { line, rect, text } from "./svg-primitives.js";

export function renderRic18TitleBlock(titleBlock: TitleBlock): string {
  const width = 110;
  const height = 80;
  const parts: string[] = [rect(0, 0, width, height, "med")];

  parts.push(text(width / 2, 5, titleBlock.project || "TÍTULO DEL PROYECTO", "label", "middle"));
  parts.push(line(0, 8, width, 8, "med"));

  const topRows = [
    ["COMUNA", titleBlock.commune ?? "POR DEFINIR"],
    ["CALLE", titleBlock.address ?? "POR DEFINIR"],
    ["LÁMINA", titleBlock.sheet],
    ["ESCALA", titleBlock.scale],
    ["FECHA", titleBlock.date ?? "POR DEFINIR"]
  ];

  let y = 8;
  const rowH = 5;
  for (const [label, value] of topRows) {
    parts.push(line(0, y + rowH, width, y + rowH));
    parts.push(line(26, y, 26, y + rowH));
    parts.push(text(2, y + 3.6, label!, "small"));
    parts.push(text(28, y + 3.6, value!, "small"));
    y += rowH;
  }

  const sectionTop = 33;
  parts.push(line(width / 2, sectionTop, width / 2, height, "med"));
  parts.push(text(width / 4, sectionTop + 5, "ACEPTACIÓN PROPIETARIO", "label", "middle"));
  parts.push(text(width * 0.75, sectionTop + 5, "INSTALADOR", "label", "middle"));

  parts.push(text(4, sectionTop + 14, `PROPIETARIO: ${titleBlock.owner ?? "POR DEFINIR"}`, "small"));
  parts.push(text(4, sectionTop + 21, `RUT: ${titleBlock.ownerRut ?? "POR DEFINIR"}`, "small"));
  parts.push(text(4, sectionTop + 31, "FIRMA:", "small"));

  parts.push(text(width / 2 + 4, sectionTop + 14, `NOMBRE: ${titleBlock.authorizedInstaller ?? "POR DEFINIR"}`, "small"));
  parts.push(text(width / 2 + 4, sectionTop + 21, `LICENCIA O TÍTULO: ${titleBlock.secClass ?? "COMPLETAR"}`, "small"));
  parts.push(text(width / 2 + 4, sectionTop + 28, "DOMICILIO COMERCIAL: POR DEFINIR", "small"));
  parts.push(text(width / 2 + 4, sectionTop + 35, "TELÉFONO: POR DEFINIR", "small"));
  parts.push(text(width / 2 + 4, sectionTop + 45, "FIRMA:", "small"));

  return parts.join("");
}
