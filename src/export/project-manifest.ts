import type { TE1Project } from "../domain/types.js";

export interface ProjectManifest {
  schemaVersion: "0.1";
  projectId: string;
  declarationType: "TE1";
  project: {
    name: string;
    destination: TE1Project["destination"];
    system: TE1Project["system"];
    voltageV: number;
    boardName: string;
  };
  location: TE1Project["location"];
  totals: {
    circuits: number;
    installedPowerW: number | "PENDING";
    demandedPowerW: number | "PENDING";
  };
  attachments: {
    electricalPlan: "PENDING";
    unilinear: "PENDING";
    loadSchedule: "PENDING";
    verificationReport: "PENDING";
    imageReport: "PENDING";
  };
  professionalReview: TE1Project["professionalReview"]["status"];
}

function sumOrPending(values: Array<number | undefined>): number | "PENDING" {
  if (values.some((value) => value === undefined)) return "PENDING";
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

export function buildProjectManifest(project: TE1Project): ProjectManifest {
  return {
    schemaVersion: "0.1",
    projectId: project.id,
    declarationType: "TE1",
    project: {
      name: project.name,
      destination: project.destination,
      system: project.system,
      voltageV: project.voltageV,
      boardName: project.boardName
    },
    location: { ...project.location },
    totals: {
      circuits: project.circuits.length,
      installedPowerW: sumOrPending(
        project.circuits.map((circuit) => circuit.installedPowerW)
      ),
      demandedPowerW: sumOrPending(
        project.circuits.map((circuit) => circuit.demandedPowerW)
      )
    },
    attachments: {
      electricalPlan: "PENDING",
      unilinear: "PENDING",
      loadSchedule: "PENDING",
      verificationReport: "PENDING",
      imageReport: "PENDING"
    },
    professionalReview: project.professionalReview.status
  };
}
