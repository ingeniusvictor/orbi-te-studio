export function currentFromSinglePhasePower(
  powerW: number,
  voltageV: number,
  powerFactor = 1
): number {
  if (powerW < 0) throw new Error("powerW must be >= 0");
  if (voltageV <= 0) throw new Error("voltageV must be > 0");
  if (powerFactor <= 0 || powerFactor > 1) {
    throw new Error("powerFactor must be > 0 and <= 1");
  }
  return powerW / (voltageV * powerFactor);
}

export function breakerHasCapacity(
  designCurrentA: number,
  ratedCurrentA: number
): boolean {
  if (designCurrentA < 0 || ratedCurrentA <= 0) return false;
  return designCurrentA <= ratedCurrentA;
}

export function roundElectrical(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
