import type { Finding } from "../domain/findings.js";
import type { TE1Project } from "../domain/types.js";
import type { BoardDeviceObservation } from "../field/intake-types.js";

export interface ReconciliationResult {
  matchedCircuits: number[];
  findings: Finding[];
}

function sameBreaker(
  observed: BoardDeviceObservation,
  projectCircuit: TE1Project["circuits"][number]
): boolean {
  if (!observed.protection) return false;

  return (
    observed.protection.ratedCurrentA === projectCircuit.protection.ratedCurrentA &&
    (observed.protection.breakingCapacityKA === undefined ||
      projectCircuit.protection.breakingCapacityKA === undefined ||
      observed.protection.breakingCapacityKA ===
        projectCircuit.protection.breakingCapacityKA)
  );
}

export function reconcileBoardWithProject(
  project: TE1Project,
  observedDevices: BoardDeviceObservation[]
): ReconciliationResult {
  const findings: Finding[] = [];
  const matchedCircuits: number[] = [];

  const observedMain = observedDevices.find((d) => d.kind === "main-breaker");
  if (observedMain?.protection && project.mainProtection) {
    if (
      observedMain.protection.ratedCurrentA !== project.mainProtection.ratedCurrentA ||
      (observedMain.protection.breakingCapacityKA !== undefined &&
        project.mainProtection.breakingCapacityKA !== undefined &&
        observedMain.protection.breakingCapacityKA !==
          project.mainProtection.breakingCapacityKA)
    ) {
      findings.push({
        code: "BOARD-MAIN-PROTECTION-CONFLICT",
        severity: "blocker",
        message: "La protección general observada no coincide con el modelo del proyecto."
      });
    }
  } else {
    findings.push({
      code: "BOARD-MAIN-PROTECTION-NOT-VERIFIABLE",
      severity: "warning",
      message: "No existe información suficiente para conciliar la protección general."
    });
  }

  const observedDifferential = observedDevices.find(
    (d) => d.kind === "differential"
  );
  if (observedDifferential?.differential && project.differentialProtection) {
    const a = observedDifferential.differential;
    const b = project.differentialProtection;
    if (
      a.ratedCurrentA !== b.ratedCurrentA ||
      a.residualCurrentMA !== b.residualCurrentMA
    ) {
      findings.push({
        code: "BOARD-DIFFERENTIAL-CONFLICT",
        severity: "blocker",
        message: "El diferencial observado no coincide con el modelo del proyecto."
      });
    }
  } else {
    findings.push({
      code: "BOARD-DIFFERENTIAL-NOT-VERIFIABLE",
      severity: "warning",
      message: "No existe información suficiente para conciliar el diferencial."
    });
  }

  for (const circuit of project.circuits) {
    const observed = observedDevices.find(
      (d) => d.kind === "branch-breaker" && d.circuitNumber === circuit.number
    );

    if (!observed) {
      findings.push({
        code: "BOARD-CIRCUIT-MISSING",
        severity: "warning",
        circuitId: circuit.id,
        message: `Circuito ${circuit.number}: no se encontró protección observada asociada.`
      });
      continue;
    }

    if (!sameBreaker(observed, circuit)) {
      findings.push({
        code: "BOARD-CIRCUIT-CONFLICT",
        severity: "blocker",
        circuitId: circuit.id,
        message: `Circuito ${circuit.number}: la protección observada no coincide con el proyecto.`
      });
      continue;
    }

    matchedCircuits.push(circuit.number);
  }

  return { matchedCircuits, findings };
}
