import type { SheetFormat, SheetOrientation } from "./sheet-model.js";
import { getSheetSizeMm } from "./a-series.js";

export interface Ric18Margins {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Ric18SheetGeometry {
  format: SheetFormat;
  orientation: SheetOrientation;
  sheetWidth: number;
  sheetHeight: number;
  margins: Ric18Margins;
  drawingArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  footerBand: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  croquisBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  stampBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  titleBlock: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * RIC N°18, Anexo 18.1:
 * A0: margen izquierdo 35 mm, otros 10 mm.
 * A1/A2/A3/A4: margen izquierdo 30 mm, otros 10 mm.
 *
 * Anexo 18.2:
 * distribución inferior referencial de 80 / 110 / 110 mm y
 * cajetín de 110 x 80 mm.
 */
export function getRic18Margins(format: SheetFormat): Ric18Margins {
  return {
    left: format === "A0" ? 35 : 30,
    top: 10,
    right: 10,
    bottom: 10
  };
}

export function getRic18SheetGeometry(
  format: SheetFormat,
  orientation: SheetOrientation
): Ric18SheetGeometry {
  const size = getSheetSizeMm(format, orientation);
  const margins = getRic18Margins(format);
  const usableWidth = size.width - margins.left - margins.right;
  const usableHeight = size.height - margins.top - margins.bottom;

  const footerHeight = 80;
  const titleWidth = 110;
  const stampWidth = 110;
  const croquisWidth = 80;

  const footerY = size.height - margins.bottom - footerHeight;
  const titleX = size.width - margins.right - titleWidth;
  const stampX = titleX - stampWidth;
  const croquisX = stampX - croquisWidth;

  return {
    format,
    orientation,
    sheetWidth: size.width,
    sheetHeight: size.height,
    margins,
    drawingArea: {
      x: margins.left,
      y: margins.top,
      width: usableWidth,
      height: usableHeight - footerHeight
    },
    footerBand: {
      x: margins.left,
      y: footerY,
      width: usableWidth,
      height: footerHeight
    },
    croquisBox: {
      x: croquisX,
      y: footerY,
      width: croquisWidth,
      height: footerHeight
    },
    stampBox: {
      x: stampX,
      y: footerY,
      width: stampWidth,
      height: footerHeight
    },
    titleBlock: {
      x: titleX,
      y: footerY,
      width: titleWidth,
      height: footerHeight
    }
  };
}
