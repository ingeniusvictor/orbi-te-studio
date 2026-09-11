import type { TE1Project } from "../domain/types.js";

export interface UnilinearDevice {
  id: string;
  kind: "main-breaker" | "differential" | "branch-breaker";
  label: string;
  rating: string;
  circuitNumber?: number;
}

export interface UnilinearModel {
  projectId: string;
  boardName: string;
  supply: {
    system: TE1Project["system"];
    voltageV: number;
  };
  devices: UnilinearDevice[];
  notes: string[];
}

function protectionRating(
  poles: number,
  currentA: number,
  breakingCapacityKA?: number
): string {
  const breaking =
    breakingCapacityKA === undefined ? "" : ` ${breakingCapacityKA}kA`;
  return `${poles}x${currentA}A${breaking}`;
}

export function buildUnilinearModel(project: TE1Project): UnilinearModel {
  const devices: UnilinearDevice[] = [];

  if (project.mainProtection) {
    devices.push({
      id: "AG",
      kind: "main-breaker",
      label: "Interruptor automático general",
      rating: protectionRating(
        project.mainProtection.poles,
        project.mainProtection.ratedCurrentA,
        project.mainProtection.breakingCapacityKA
      )
    });
  }

  if (project.differentialProtection) {
    devices.push({
      id: "ID",
      kind: "differential",
      label: "Interruptor diferencial",
      rating: `${project.differentialProtection.poles}x${project.differentialProtection.ratedCurrentA}A ${project.differentialProtection.residualCurrentMA}mA`
    });
  }

  for (const circuit of project.circuits) {
    devices.push({
      id: `C${circuit.number}`,
      kind: "branch-breaker",
      label: circuit.description,
      rating: protectionRating(
        circuit.protection.poles,
        circuit.protection.ratedCurrentA,
        circuit.protection.breakingCapacityKA
      ),
      circuitNumber: circuit.number
    });
  }

  const notes: string[] = [];
  if (!project.mainProtection) notes.push("Protección general pendiente de verificación.");
  if (!project.differentialProtection) notes.push("Protección diferencial pendiente de verificación.");

  return {
    projectId: project.id,
    boardName: project.boardName,
    supply: {
      system: project.system,
      voltageV: project.voltageV
    },
    devices,
    notes
  };
}
