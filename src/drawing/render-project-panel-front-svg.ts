import type { TE1Project } from "../domain/types.js";
import type { BoardDeviceObservation } from "../field/intake-types.js";
import { buildPanelFrontModel } from "./panel-front.js";
import { renderPanelFrontPanel } from "./render-panel-front-svg.js";
import { esc } from "./svg-primitives.js";

export function renderProjectPanelFrontSvg(
  project: TE1Project
): string | undefined {
  const totalWays = project.boardTotalWays;
  if (
    totalWays === undefined ||
    !Number.isInteger(totalWays) ||
    totalWays <= 0
  ) {
    return undefined;
  }

  const devices: BoardDeviceObservation[] = [];
  let position = 1;

  if (project.mainProtection) {
    devices.push({
      position,
      kind: "main-breaker",
      label: "Automático general",
      protection: project.mainProtection,
      confidence: "unknown",
      evidenceIds: []
    });
    position += 1;
  }

  if (project.differentialProtection) {
    devices.push({
      position,
      kind: "differential",
      label: "Diferencial",
      differential: project.differentialProtection,
      confidence: "unknown",
      evidenceIds: []
    });
    position += 1;
  }

  for (const circuit of project.circuits) {
    if (position > totalWays) break;

    devices.push({
      position,
      kind: "branch-breaker",
      label: circuit.description,
      circuitNumber: circuit.number,
      protection: circuit.protection,
      confidence: "unknown",
      evidenceIds: []
    });
    position += 1;
  }

  const model = buildPanelFrontModel(
    project.boardName,
    totalWays,
    devices
  );
  const panel = renderPanelFrontPanel(model);
  const title = esc("TABLERO DIGITALIZADO - " + project.boardName);
  const footer = esc(
    "ORBI TE Studio - representación determinista basada en datos registrados; revisar antes de uso documental."
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="350mm" height="215mm" viewBox="0 0 350 215">',
    '<style>',
    '.thin{fill:none;stroke:#000;stroke-width:.35}',
    '.med{fill:none;stroke:#000;stroke-width:.60}',
    '.thick{fill:none;stroke:#000;stroke-width:1.00}',
    '.txt{font-family:Arial,Helvetica,sans-serif;font-size:3.2px;fill:#000}',
    '.small{font-family:Arial,Helvetica,sans-serif;font-size:2.6px;fill:#000}',
    '.label{font-family:Arial,Helvetica,sans-serif;font-size:3.2px;font-weight:700;fill:#000}',
    '.title{font-family:Arial,Helvetica,sans-serif;font-size:6px;font-weight:700;fill:#000}',
    '</style>',
    '<rect x="0" y="0" width="350" height="215" fill="#fff"/>',
    '<text x="175" y="10" class="title" text-anchor="middle">' + title + '</text>',
    '<g transform="translate(10,18)">' + panel + '</g>',
    '<text x="10" y="207" class="small">' + footer + '</text>',
    '</svg>'
  ].join("\n");
}
