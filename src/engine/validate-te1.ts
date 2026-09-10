import type { TE1Project } from "../domain/types.js";
import type { Finding, ValidationResult } from "../domain/findings.js";
import { breakerHasCapacity } from "./electrical.js";

export function validateTE1(project: TE1Project): ValidationResult {
  const findings: Finding[] = [];

  if (project.circuits.length === 0) {
    findings.push({
      code: "TE1-NO-CIRCUITS",
      severity: "blocker",
      message: "El proyecto no contiene circuitos."
    });
  }

  if (!project.mainProtection) {
    findings.push({
      code: "TE1-MAIN-PROTECTION-MISSING",
      severity: "blocker",
      message: "Falta identificar o verificar la protección general."
    });
  }

  if (!project.differentialProtection) {
    findings.push({
      code: "TE1-DIFFERENTIAL-MISSING",
      severity: "blocker",
      message: "Falta identificar o verificar la protección diferencial."
    });
  }

  for (const circuit of project.circuits) {
    if (circuit.installedPowerW === undefined) {
      findings.push({
        code: "TE1-CIRCUIT-POWER-PENDING",
        severity: "warning",
        circuitId: circuit.id,
        field: "installedPowerW",
        message: `Circuito ${circuit.number}: potencia instalada pendiente de levantamiento.`
      });
    }

    if (!circuit.conductor?.verified) {
      findings.push({
        code: "TE1-CONDUCTOR-UNVERIFIED",
        severity: "warning",
        circuitId: circuit.id,
        field: "conductor",
        message: `Circuito ${circuit.number}: sección/material/método de instalación no verificados en terreno.`
      });
    }

    if (
      circuit.currentA !== undefined &&
      !breakerHasCapacity(circuit.currentA, circuit.protection.ratedCurrentA)
    ) {
      findings.push({
        code: "TE1-BREAKER-UNDERSIZED",
        severity: "blocker",
        circuitId: circuit.id,
        message: `Circuito ${circuit.number}: la corriente de diseño supera la corriente nominal de la protección.`
      });
    }
  }

  if (!project.location.address) {
    findings.push({
      code: "TE1-ADDRESS-PENDING",
      severity: "warning",
      field: "location.address",
      message: "Dirección del proyecto pendiente."
    });
  }

  if (!project.location.wgs84 && !project.location.utm) {
    findings.push({
      code: "TE1-GEOREF-PENDING",
      severity: "warning",
      field: "location",
      message: "Georreferenciación pendiente."
    });
  }

  const hasBlocker = findings.some((finding) => finding.severity === "blocker");

  return {
    readyForProfessionalReview: !hasBlocker,
    findings
  };
}
