export const forkliftType = {
  uuid: "15da59e2-eece-4c40-adc7-8bcbefa926e6",
  name: "Light Forklift",
  iceReferenceCostUsd: 40000,
  iceReferenceFuelConsumption: 1,
  kwhPerHour: 3,
  iceEfficiency: 0.6,
  evEfficiency:0.9,
  hybridEfficiency: 0.7,
};

export const heavyPickupType = {
  uuid: "c72a718f-9e3b-4cf2-aef3-ad9e0e27bc64",
  name: "Heavy Pickup",
  iceReferenceCostUsd: 60000,
  iceReferenceFuelConsumption: 2,
  kwhPerHour: 5,
  iceEfficiency: 0.6,
  evEfficiency:0.9,
  hybridEfficiency: 0.7,
};

export const vehicleTypes = [forkliftType, heavyPickupType];
