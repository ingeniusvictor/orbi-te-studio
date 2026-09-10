import type { FieldMeasurement } from "./intake-types.js";

export interface MeasurementFinding {
  code: string;
  status: "pass" | "warning" | "blocker";
  measurementId?: string;
  message: string;
}

const requiredKinds: FieldMeasurement["kind"][] = [
  "supply-voltage",
  "insulation-resistance",
  "pe-continuity",
  "earthing-resistance",
  "rcd-test"
];

export function validateMeasurementPackage(
  measurements: FieldMeasurement[]
): MeasurementFinding[] {
  const findings: MeasurementFinding[] = [];

  for (const kind of requiredKinds) {
    const measurement = measurements.find((item) => item.kind === kind);

    if (!measurement) {
      findings.push({
        code: `MEASUREMENT-${kind.toUpperCase()}-MISSING`,
        status: "warning",
        message: `Medición pendiente: ${kind}.`
      });
      continue;
    }

    if (
      measurement.status !== "verified" &&
      measurement.status !== "observed"
    ) {
      findings.push({
        code: `MEASUREMENT-${kind.toUpperCase()}-UNVERIFIED`,
        status: "warning",
        measurementId: measurement.id,
        message: `La medición ${kind} existe, pero aún no está verificada.`
      });
      continue;
    }

    if (measurement.value === undefined && kind !== "rcd-test") {
      findings.push({
        code: `MEASUREMENT-${kind.toUpperCase()}-VALUE-MISSING`,
        status: "blocker",
        measurementId: measurement.id,
        message: `La medición ${kind} no contiene valor numérico.`
      });
      continue;
    }

    if (measurement.evidenceIds.length === 0) {
      findings.push({
        code: `MEASUREMENT-${kind.toUpperCase()}-EVIDENCE-MISSING`,
        status: "warning",
        measurementId: measurement.id,
        message: `La medición ${kind} no tiene evidencia asociada.`
      });
      continue;
    }

    findings.push({
      code: `MEASUREMENT-${kind.toUpperCase()}-RECORDED`,
      status: "pass",
      measurementId: measurement.id,
      message: `Medición registrada con evidencia: ${kind}.`
    });
  }

  return findings;
}
