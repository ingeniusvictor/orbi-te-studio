import type { TE1Project } from "../domain/types.js";

export interface LoadScheduleRow {
  circuit: number;
  description: string;
  voltageV: number;
  breaker: string;
  differential: string;
  installedPowerW: number | "PENDING";
  demandedPowerW: number | "PENDING";
  currentA: number | "PENDING";
  conductor: string | "VERIFY";
}

export function buildLoadSchedule(project: TE1Project): LoadScheduleRow[] {
  const differential = project.differentialProtection
    ? `${project.differentialProtection.poles}x${project.differentialProtection.ratedCurrentA}A ${project.differentialProtection.residualCurrentMA}mA`
    : "VERIFY";

  return project.circuits.map((circuit) => ({
    circuit: circuit.number,
    description: circuit.description,
    voltageV: circuit.voltageV,
    breaker: `${circuit.protection.poles}x${circuit.protection.ratedCurrentA}A${circuit.protection.breakingCapacityKA !== undefined ? ` ${circuit.protection.breakingCapacityKA}kA` : ""}`,
    differential,
    installedPowerW: circuit.installedPowerW ?? "PENDING",
    demandedPowerW: circuit.demandedPowerW ?? "PENDING",
    currentA: circuit.currentA ?? "PENDING",
    conductor:
      circuit.conductor?.verified &&
      circuit.conductor.phaseMm2 !== undefined &&
      circuit.conductor.material
        ? `${circuit.conductor.phaseMm2} mm² ${circuit.conductor.material}`
        : "VERIFY"
  }));
}
