export function calculateCoveragePercentage(demand, chargingCapacity) {
  let coveragePercentage = {};
  for (const blockGroupId in demand) {
    if (
      chargingCapacity[blockGroupId] === 0 &&
      chargingCapacity[blockGroupId] === 0
    ) {
      // No coverage but no demand? Call it zero.
      coveragePercentage[blockGroupId] = 0;
    } else {
      coveragePercentage[blockGroupId] =
        chargingCapacity[blockGroupId] / demand[blockGroupId];
    }
  }
  return coveragePercentage;
}

export function scaleChargingCapacityByUtilization(
  chargingCapacity,
  utilization
) {
  let scaledChargingCapacity = {};
  for (const blockGroupId in chargingCapacity) {
    scaledChargingCapacity[blockGroupId] =
      chargingCapacity[blockGroupId] * utilization;
  }
  return scaledChargingCapacity;
}
