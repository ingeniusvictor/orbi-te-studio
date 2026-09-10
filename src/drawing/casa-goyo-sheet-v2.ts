import { casaGoyoReference } from "../reference/casa-goyo.js";
import { casaGoyoFieldIntake } from "../reference/casa-goyo-intake.js";
import { buildLoadSchedule } from "./load-schedule.js";
import { buildPanelFrontModel } from "./panel-front.js";
import { buildUnilinearModel } from "./unilinear.js";
import type { DrawingSheet } from "./sheet-model.js";
import { renderSheetSvg } from "./svg-sheet.js";
import { renderUnilinearPanel } from "./render-unilinear-svg.js";
import { renderLoadSchedulePanel } from "./render-load-schedule-svg.js";
import { renderPanelFrontPanel } from "./render-panel-front-svg.js";
import { renderLocationSketchPanel } from "./location-sketch.js";
import { renderConnectionDetailPanel } from "./render-connection-detail-svg.js";
import { renderTitleBlock } from "./title-block.js";

export function renderCasaGoyoA2SvgV2(): string {
  const sheet: DrawingSheet = {
    id: "TE1-REF-002-A2-002",
    title: "PROYECTO TE1 - CASA GOYO - OSORNO",
    format: "A2",
    orientation: "landscape",
    titleBlock: {
      project: "Casa Goyo - Osorno",
      commune: "Osorno",
      region: "Los Lagos",
      destination: "Casa habitación",
      scale: "S/E",
      format: "A2",
      sheet: "1 de 1",
      revision: 0
    },
    notes: []
  };

  const panel = buildPanelFrontModel(
    "TDA CASA GOYO",
    12,
    casaGoyoFieldIntake.board.devices
  );

  return renderSheetSvg(sheet, [
    {
      x: 20,
      y: 32,
      width: 350,
      height: 170,
      title: "DIAGRAMA UNILINEAL",
      content: renderUnilinearPanel(buildUnilinearModel(casaGoyoReference))
    },
    {
      x: 380,
      y: 32,
      width: 194,
      height: 170,
      title: "VISTA FRONTAL TABLERO",
      content: renderPanelFrontPanel(panel)
    },
    {
      x: 20,
      y: 210,
      width: 350,
      height: 72,
      title: "CUADRO DE CARGAS / CIRCUITOS",
      content: renderLoadSchedulePanel(buildLoadSchedule(casaGoyoReference))
    },
    {
      x: 380,
      y: 210,
      width: 94,
      height: 92,
      title: "EMPALME Y TIERRAS",
      content: renderConnectionDetailPanel()
    },
    {
      x: 480,
      y: 210,
      width: 94,
      height: 92,
      title: "CROQUIS UBICACIÓN",
      content: renderLocationSketchPanel({ status: "pending" })
    },
    {
      x: 380,
      y: 308,
      width: 194,
      height: 82,
      content: renderTitleBlock(sheet.titleBlock, 194, 82)
    }
  ]);
}
