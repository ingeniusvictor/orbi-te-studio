import type { TE1Project } from "../domain/types.js";
import { buildLoadSchedule } from "./load-schedule.js";
import { renderConnectionDetailPanel } from "./render-connection-detail-svg.js";
import { renderLoadSchedulePanel } from "./render-load-schedule-svg.js";
import { renderPanelFrame } from "./panel-frame.js";
import { renderRic18Footer } from "./render-ric18-footer.js";
import { renderSymbolLegendPanel } from "./symbol-legend.js";
import { buildUnilinearModel } from "./unilinear.js";
import { renderUnilinearPanel } from "./render-unilinear-svg.js";
import { getRic18SheetGeometry } from "./ric18-layout.js";
import { esc, rect, text } from "./svg-primitives.js";
import type { TitleBlock } from "./sheet-model.js";

export interface TE1ProjectSheetOptions {
  ownerName?: string;
  ownerRut?: string;
  authorizedInstaller?: string;
  secClass?: string;
  date?: string;
  scale?: string;
  sheet?: string;
  locationSketchVerified?: boolean;
}

const style = `
<style>
  .thin{fill:none;stroke:#000;stroke-width:.35}
  .med{fill:none;stroke:#000;stroke-width:.60}
  .thick{fill:none;stroke:#000;stroke-width:1.00}
  .dash{fill:none;stroke:#000;stroke-width:.45;stroke-dasharray:3 2}
  .txt{font-family:Arial,Helvetica,sans-serif;font-size:3.2px;fill:#000}
  .small{font-family:Arial,Helvetica,sans-serif;font-size:2.6px;fill:#000}
  .label{font-family:Arial,Helvetica,sans-serif;font-size:3.2px;font-weight:700;fill:#000}
  .title{font-family:Arial,Helvetica,sans-serif;font-size:6px;font-weight:700;fill:#000}
  .sheet-title{font-family:Arial,Helvetica,sans-serif;font-size:7px;font-weight:700;fill:#000}
</style>`;

export function renderTE1ProjectRic18A2Svg(
  project: TE1Project,
  options: TE1ProjectSheetOptions = {}
): string {
  const geometry = getRic18SheetGeometry("A2", "landscape");

  const titleBlock: TitleBlock = {
    project: project.name,
    ...(options.ownerName ? { owner: options.ownerName } : {}),
    ...(options.ownerRut ? { ownerRut: options.ownerRut } : {}),
    ...(project.location.address ? { address: project.location.address } : {}),
    ...(project.location.commune ? { commune: project.location.commune } : {}),
    ...(project.location.region ? { region: project.location.region } : {}),
    destination: destinationLabel(project.destination),
    ...(project.location.utm ? { utm: project.location.utm } : {}),
    ...(project.location.wgs84 ? { wgs84: project.location.wgs84 } : {}),
    ...(options.authorizedInstaller
      ? { authorizedInstaller: options.authorizedInstaller }
      : {}),
    ...(options.secClass ? { secClass: options.secClass } : {}),
    ...(options.date ? { date: options.date } : {}),
    scale: options.scale ?? "S/E",
    format: "A2",
    sheet: options.sheet ?? "1 DE 1",
    revision: 0
  };

  const x = geometry.drawingArea.x;
  const y = geometry.drawingArea.y;
  const w = geometry.drawingArea.width;
  const h = geometry.drawingArea.height;
  const topY = y + 15;
  const topH = 145;
  const gap = 8;
  const leftW = 320;
  const rightX = x + leftW + gap;
  const rightW = w - leftW - gap;
  const bottomY = topY + topH + 7;
  const bottomH = h - (bottomY - y) - 17;

  const body: string[] = [
    rect(x, y, w, h, "med"),
    text(
      x + w / 2,
      y + 9,
      `PROYECTO TE1 - ${project.name.toUpperCase()}`,
      "sheet-title",
      "middle"
    ),
    renderPanelFrame(
      x + 4,
      topY,
      leftW - 4,
      topH,
      `DIAGRAMA UNILINEAL - ${project.boardName}`,
      renderUnilinearPanel(buildUnilinearModel(project)),
      { scale: 0.86, offsetX: 12, offsetY: 10 }
    ),
    renderPanelFrame(
      rightX,
      topY,
      rightW,
      70,
      "ESTADO DE DATOS DEL PROYECTO",
      renderProjectDataStatus(project),
      { scale: 1, offsetX: 8, offsetY: 11 }
    ),
    renderPanelFrame(
      rightX,
      topY + 77,
      rightW,
      68,
      "DETALLE EMPALME Y PUESTAS A TIERRA",
      renderConnectionDetailPanel({ status: "pending" }),
      { scale: 0.72, offsetX: 9, offsetY: 11 }
    ),
    renderPanelFrame(
      x + 4,
      bottomY,
      leftW - 4,
      bottomH,
      "CUADRO DE CARGAS / CIRCUITOS",
      renderLoadSchedulePanel(buildLoadSchedule(project)),
      { scale: 0.88, offsetX: 6, offsetY: 13 }
    ),
    renderPanelFrame(
      rightX,
      bottomY,
      rightW,
      bottomH,
      "CUADRO DE SIMBOLOGÍA",
      renderSymbolLegendPanel(undefined, { showTitle: false }),
      { scale: 0.92, offsetX: 7, offsetY: 11 }
    ),
    text(
      x + 5,
      y + h - 5,
      "LOS MATERIALES QUE REQUIEREN CERTIFICACIÓN PARA SU USO, CUMPLEN CON ESTE REQUISITO.",
      "small"
    ),
    `<g transform="translate(${geometry.croquisBox.x},${geometry.footerBand.y})">${renderRic18Footer(
      titleBlock,
      project.location.address &&
        (project.location.wgs84 || project.location.utm) &&
        options.locationSketchVerified
        ? {
            status: "verified",
            propertyLabel: project.location.address
          }
        : { status: "pending" }
    )}</g>`
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="594mm" height="420mm" viewBox="0 0 594 420">
${style}
<rect x="0" y="0" width="594" height="420" fill="#fff"/>
${rect(
  geometry.margins.left,
  geometry.margins.top,
  geometry.sheetWidth - geometry.margins.left - geometry.margins.right,
  geometry.sheetHeight - geometry.margins.top - geometry.margins.bottom,
  "thick"
)}
${body.join("")}
<text x="584" y="416" class="small" text-anchor="end">${esc(
  "ORBI TE Studio - borrador técnico sujeto a revisión profesional"
)}</text>
</svg>`;
}

function renderProjectDataStatus(project: TE1Project): string {
  const rows = [
    ["Dirección", project.location.address ? "REGISTRADA" : "PENDIENTE"],
    [
      "Georreferencia",
      project.location.wgs84 || project.location.utm ? "REGISTRADA" : "PENDIENTE"
    ],
    ["Protección general", project.mainProtection ? "REGISTRADA" : "PENDIENTE"],
    [
      "Protección diferencial",
      project.differentialProtection ? "REGISTRADA" : "PENDIENTE"
    ],
    [
      "Potencias",
      project.circuits.every((c) => c.installedPowerW !== undefined)
        ? "REGISTRADAS"
        : "PENDIENTES"
    ],
    [
      "Conductores",
      project.circuits.every((c) => c.conductor?.verified)
        ? "VERIFICADOS"
        : "PENDIENTES"
    ]
  ] as const;

  return rows
    .map(
      ([label, value], index) =>
        text(0, 6 + index * 8, `${label}: ${value}`, "small")
    )
    .join("");
}

function destinationLabel(
  destination: TE1Project["destination"]
): string {
  if (destination === "casa-habitacion") return "Casa habitación";
  if (destination === "departamento") return "Departamento";
  return "Otro";
}
