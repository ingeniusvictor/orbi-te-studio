import { casaGoyoReference } from "../reference/casa-goyo.js";
import { casaGoyoFieldIntake } from "../reference/casa-goyo-intake.js";
import { buildLoadSchedule } from "./load-schedule.js";
import { buildPanelFrontModel } from "./panel-front.js";
import { buildUnilinearModel } from "./unilinear.js";
import { renderConnectionDetailPanel } from "./render-connection-detail-svg.js";
import { renderLoadSchedulePanel } from "./render-load-schedule-svg.js";
import { renderPanelFrontPanel } from "./render-panel-front-svg.js";
import { renderRic18Footer } from "./render-ric18-footer.js";
import { renderUnilinearPanel } from "./render-unilinear-svg.js";
import { getRic18SheetGeometry } from "./ric18-layout.js";
import { renderSymbolLegendPanel } from "./symbol-legend.js";
import { renderPanelFrame } from "./panel-frame.js";
import { esc, rect, text } from "./svg-primitives.js";

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

export function renderCasaGoyoRic18A2Svg(): string {
  const geometry = getRic18SheetGeometry("A2", "landscape");
  const titleBlock = {
    project: "CASA GOYO - OSORNO",
    commune: "Osorno",
    region: "Los Lagos",
    destination: "Casa habitación",
    scale: "S/E",
    format: "A2" as const,
    sheet: "1 DE 1",
    revision: 0
  };

  const panel = buildPanelFrontModel(
    "TDA CASA GOYO",
    12,
    casaGoyoFieldIntake.board.devices
  );

  const body: string[] = [];
  const x = geometry.drawingArea.x;
  const y = geometry.drawingArea.y;
  const w = geometry.drawingArea.width;
  const h = geometry.drawingArea.height;

  body.push(rect(x, y, w, h, "med"));
  body.push(
    text(
      x + w / 2,
      y + 9,
      "PROYECTO TE1 - CASA GOYO - OSORNO",
      "sheet-title",
      "middle"
    )
  );

  const topY = y + 15;
  const topH = 145;
  const leftW = 320;
  const gap = 8;
  const rightX = x + leftW + gap;
  const rightW = w - leftW - gap;

  body.push(
    renderPanelFrame(
      x + 4,
      topY,
      leftW - 4,
      topH,
      "DIAGRAMA UNILINEAL - TDA CASA GOYO",
      renderUnilinearPanel(buildUnilinearModel(casaGoyoReference)),
      { scale: 0.86, offsetX: 12, offsetY: 10 }
    )
  );

  body.push(
    renderPanelFrame(
      rightX,
      topY,
      rightW,
      topH,
      "VISTA FRONTAL TABLERO",
      renderPanelFrontPanel(panel),
      { scale: 0.61, offsetX: 4, offsetY: 11 }
    )
  );

  const bottomY = topY + topH + 7;
  const bottomH = h - (bottomY - y) - 17;

  body.push(
    renderPanelFrame(
      x + 4,
      bottomY,
      leftW - 4,
      bottomH,
      "CUADRO DE CARGAS / CIRCUITOS",
      renderLoadSchedulePanel(buildLoadSchedule(casaGoyoReference)),
      { scale: 0.88, offsetX: 6, offsetY: 13 }
    )
  );

  body.push(
    renderPanelFrame(
      rightX,
      bottomY,
      rightW,
      58,
      "DETALLE EMPALME Y PUESTAS A TIERRA",
      renderConnectionDetailPanel(),
      { scale: 0.72, offsetX: 9, offsetY: 11 }
    )
  );

  body.push(
    renderPanelFrame(
      rightX,
      bottomY + 64,
      rightW,
      bottomH - 64,
      "CUADRO DE SIMBOLOGÍA",
      renderSymbolLegendPanel(undefined, { showTitle: false }),
      { scale: 0.92, offsetX: 7, offsetY: 11 }
    )
  );

  body.push(
    text(
      x + 5,
      y + h - 5,
      "LOS MATERIALES QUE REQUIEREN CERTIFICACIÓN PARA SU USO, CUMPLEN CON ESTE REQUISITO.",
      "small"
    )
  );

  body.push(
    `<g transform="translate(${geometry.croquisBox.x},${geometry.footerBand.y})">${renderRic18Footer(
      titleBlock
    )}</g>`
  );

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
  "Presentación estructurada según RIC N°18 - revisión profesional requerida"
)}</text>
</svg>`;
}
