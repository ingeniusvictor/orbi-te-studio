import { casaGoyoReference } from "../reference/casa-goyo.js";
import { buildLoadSchedule } from "./load-schedule.js";
import { buildUnilinearModel } from "./unilinear.js";
import type { DrawingSheet } from "./sheet-model.js";
import { renderSheetSvg } from "./svg-sheet.js";
import { renderUnilinearPanel } from "./render-unilinear-svg.js";
import { renderLoadSchedulePanel } from "./render-load-schedule-svg.js";
import { renderTitleBlock } from "./title-block.js";

export function renderCasaGoyoA2Svg(): string {
  const sheet: DrawingSheet = {
    id: "TE1-REF-002-A2-001",
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
    notes: [
      "Los materiales que requieren certificación para su uso deben cumplir dicho requisito."
    ]
  };

  const unilinear = buildUnilinearModel(casaGoyoReference);
  const loadSchedule = buildLoadSchedule(casaGoyoReference);

  return renderSheetSvg(sheet, [
    {
      x: 20,
      y: 32,
      width: 350,
      height: 205,
      title: "DIAGRAMA UNILINEAL",
      content: renderUnilinearPanel(unilinear)
    },
    {
      x: 20,
      y: 245,
      width: 350,
      height: 75,
      title: "CUADRO DE CARGAS / CIRCUITOS",
      content: renderLoadSchedulePanel(loadSchedule)
    },
    {
      x: 385,
      y: 245,
      width: 195,
      height: 145,
      content: renderTitleBlock(sheet.titleBlock, 195, 145)
    }
  ]);
}
