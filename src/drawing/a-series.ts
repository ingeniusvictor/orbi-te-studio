import type { SheetFormat, SheetOrientation } from "./sheet-model.js";

export interface SheetSizeMm {
  width: number;
  height: number;
}

const portraitSizes: Record<SheetFormat, SheetSizeMm> = {
  A0: { width: 841, height: 1189 },
  A1: { width: 594, height: 841 },
  A2: { width: 420, height: 594 }
};

export function getSheetSizeMm(
  format: SheetFormat,
  orientation: SheetOrientation
): SheetSizeMm {
  const base = portraitSizes[format];
  return orientation === "portrait"
    ? { ...base }
    : { width: base.height, height: base.width };
}
