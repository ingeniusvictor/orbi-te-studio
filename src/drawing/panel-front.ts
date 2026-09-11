import type { BoardDeviceObservation } from "../field/intake-types.js";

export interface PanelFrontSlot {
  slot: number;
  kind: "blank" | "main-breaker" | "differential" | "branch-breaker" | "unknown";
  label: string;
  rating?: string;
  circuitNumber?: number;
}

export interface PanelFrontModel {
  boardName: string;
  totalWays: number;
  slots: PanelFrontSlot[];
  legend: string[];
}

function ratingForDevice(device: BoardDeviceObservation): string | undefined {
  if (device.protection) {
    const breaking =
      device.protection.breakingCapacityKA === undefined
        ? ""
        : ` ${device.protection.breakingCapacityKA}kA`;
    return `${device.protection.poles}x${device.protection.ratedCurrentA}A${breaking}`;
  }

  if (device.differential) {
    return `${device.differential.poles}x${device.differential.ratedCurrentA}A ${device.differential.residualCurrentMA}mA`;
  }

  return undefined;
}

export function buildPanelFrontModel(
  boardName: string,
  totalWays: number,
  devices: BoardDeviceObservation[]
): PanelFrontModel {
  const slots: PanelFrontSlot[] = Array.from({ length: totalWays }, (_, index) => ({
    slot: index + 1,
    kind: "blank",
    label: "RESERVA"
  }));

  for (const device of devices) {
    const index = device.position - 1;
    if (index < 0 || index >= totalWays) continue;

    const slot: PanelFrontSlot = {
      slot: device.position,
      kind: device.kind,
      label: device.label ?? device.kind
    };

    const rating = ratingForDevice(device);
    if (rating !== undefined) slot.rating = rating;
    if (device.circuitNumber !== undefined) {
      slot.circuitNumber = device.circuitNumber;
    }

    slots[index] = slot;
  }

  const legend = devices
    .filter((device) => device.label)
    .map((device) =>
      device.circuitNumber !== undefined
        ? `${device.circuitNumber}. ${device.label}`
        : `${device.position}. ${device.label}`
    );

  return {
    boardName,
    totalWays,
    slots,
    legend
  };
}
