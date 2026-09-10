import type { TitleBlock } from "./sheet-model.js";
import { line, rect, text } from "./svg-primitives.js";

export function renderTitleBlock(
  titleBlock: TitleBlock,
  width: number,
  height: number
): string {
  const rows = [
    ["Proyecto", titleBlock.project],
    ["Propietario", titleBlock.owner ?? "POR DEFINIR"],
    ["RUT", titleBlock.ownerRut ?? "POR DEFINIR"],
    ["Dirección", titleBlock.address ?? "POR DEFINIR"],
    ["Comuna", titleBlock.commune ?? "POR DEFINIR"],
    ["Región", titleBlock.region ?? "POR DEFINIR"],
    ["Destino", titleBlock.destination ?? "POR DEFINIR"],
    ["Coord. UTM", titleBlock.utm ?? "POR DEFINIR"],
    ["Coord. WGS84", titleBlock.wgs84 ?? "POR DEFINIR"],
    ["Instalador", titleBlock.authorizedInstaller ?? "POR DEFINIR"],
    ["Clase SEC", titleBlock.secClass ?? "COMPLETAR"]
  ];

  const rowHeight = 6;
  const labelWidth = 35;
  const content: string[] = [rect(0, 0, width, height, "med")];

  content.push(text(width / 2, 5, "PROYECTO ELÉCTRICO - INSTALACIÓN INTERIOR", "label", "middle"));
  content.push(line(0, 8, width, 8, "med"));

  rows.forEach((row, index) => {
    const y = 8 + index * rowHeight;
    content.push(line(0, y + rowHeight, width, y + rowHeight));
    content.push(line(labelWidth, y, labelWidth, y + rowHeight));
    content.push(text(2, y + 4.2, row[0], "small"));
    content.push(text(labelWidth + 2, y + 4.2, row[1], "small"));
  });

  const footerY = 8 + rows.length * rowHeight;
  content.push(line(0, footerY + 8, width, footerY + 8, "med"));
  content.push(text(2, footerY + 5, `Fecha: ${titleBlock.date ?? "POR DEFINIR"}`, "small"));
  content.push(text(width * 0.38, footerY + 5, `Escala: ${titleBlock.scale}`, "small"));
  content.push(text(width * 0.58, footerY + 5, `Formato: ${titleBlock.format}`, "small"));
  content.push(text(width * 0.76, footerY + 5, `Lámina: ${titleBlock.sheet}`, "small"));
  content.push(text(width - 2, footerY + 5, `Rev: ${titleBlock.revision}`, "small", "end"));

  return content.join("");
}
