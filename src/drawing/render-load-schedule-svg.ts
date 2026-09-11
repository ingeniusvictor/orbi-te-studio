import type { LoadScheduleRow } from "./load-schedule.js";
import { line, rect, text } from "./svg-primitives.js";

export function renderLoadSchedulePanel(rows: LoadScheduleRow[]): string {
  const widths = [18, 90, 26, 36, 38, 34, 30, 30, 25];
  const headers = [
    "Cto.",
    "Descripción",
    "Tensión",
    "ITM",
    "Diferencial",
    "Conductor",
    "P. Inst.",
    "P. Dem.",
    "I (A)"
  ];
  const rowHeight = 9;
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  const totalHeight = rowHeight * (rows.length + 1);
  const parts: string[] = [rect(0, 0, totalWidth, totalHeight, "med")];

  let x = 0;
  widths.forEach((width, index) => {
    if (index > 0) parts.push(line(x, 0, x, totalHeight));
    parts.push(text(x + width / 2, 6, headers[index]!, "small", "middle"));
    x += width;
  });
  parts.push(line(0, rowHeight, totalWidth, rowHeight, "med"));

  rows.forEach((row, rowIndex) => {
    const y = rowHeight * (rowIndex + 1);
    parts.push(line(0, y + rowHeight, totalWidth, y + rowHeight));
    const values = [
      String(row.circuit),
      row.description,
      `${row.voltageV} V`,
      row.breaker,
      row.differential,
      row.conductor,
      String(row.installedPowerW),
      String(row.demandedPowerW),
      String(row.currentA)
    ];

    let colX = 0;
    widths.forEach((width, colIndex) => {
      parts.push(
        text(
          colX + width / 2,
          y + 6,
          values[colIndex]!,
          colIndex === 1 ? "small" : "small",
          "middle"
        )
      );
      colX += width;
    });
  });

  return parts.join("");
}
