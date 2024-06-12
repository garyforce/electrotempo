import { FleetElectrificationScenario } from "types/fleet-electrification-scenario";

export const fullElectric: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [
    {
      id: 1,
      level: "DC Fast",
      referenceMakeModel: "Heliox",
      numChargers: 10,
      totalCapexUsd: 1100000,
    },
    {
      id: 2,
      level: "DC Fast",
      referenceMakeModel: "Chargepoint Express 250 CPE250",
      numChargers: 10,
      totalCapexUsd: 520000,
    },
  ],
  vehiclePurchaseSuggestions: [
    {
      id: 1,
      referenceMakeModel: "Tesla Semi (500mi)",
      numElectricVehicles: 20,
      numIceVehicles: 0,
      totalCapexUsd: 2600000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 900,
        },
        {
          hour: 2,
          powerDemandKw: 900,
        },
        {
          hour: 3,
          powerDemandKw: 900,
        },
        {
          hour: 4,
          powerDemandKw: 900,
        },
        {
          hour: 5,
          powerDemandKw: 900,
        },
        {
          hour: 6,
          powerDemandKw: 900,
        },
        {
          hour: 7,
          powerDemandKw: 900,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 2,
      referenceMakeModel: "Kenworth K270E (200mi)",
      numElectricVehicles: 20,
      numIceVehicles: 0,
      totalCapexUsd: 7072100,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 300,
        },
        {
          hour: 2,
          powerDemandKw: 300,
        },
        {
          hour: 3,
          powerDemandKw: 300,
        },
        {
          hour: 4,
          powerDemandKw: 300,
        },
        {
          hour: 5,
          powerDemandKw: 300,
        },
        {
          hour: 6,
          powerDemandKw: 300,
        },
        {
          hour: 7,
          powerDemandKw: 300,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
  ],
  id: 2,
  name: "Fully Electric",
  fuelCostUsd: 1919715,
  insuranceCostUsd: 8000000,
  downtimeCostUsd: 8400000,
  maintenanceCostUsd: 6900000,
  otherOAndMCostUsd: 0,
  laborCostUsd: 32000000,
  annualMilesDriven: 2400000,
  dailyMilesDriven: 8000,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 300,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 1531.44,
  totalAnnualEmissionsTonsCo2: 601.44,
  paybackPeriodYears: 7.85,
};

export const dieselOnly: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [],
  vehiclePurchaseSuggestions: [
    {
      id: 1,
      referenceMakeModel: "CASCADIA 126 STOCK",
      numElectricVehicles: 0,
      numIceVehicles: 20,
      totalCapexUsd: 1800000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 0,
        },
        {
          hour: 2,
          powerDemandKw: 0,
        },
        {
          hour: 3,
          powerDemandKw: 0,
        },
        {
          hour: 4,
          powerDemandKw: 0,
        },
        {
          hour: 5,
          powerDemandKw: 0,
        },
        {
          hour: 6,
          powerDemandKw: 0,
        },
        {
          hour: 7,
          powerDemandKw: 0,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 2,
      referenceMakeModel: "Ford F600 XLT",
      numElectricVehicles: 0,
      numIceVehicles: 20,
      totalCapexUsd: 1300000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 0,
        },
        {
          hour: 2,
          powerDemandKw: 0,
        },
        {
          hour: 3,
          powerDemandKw: 0,
        },
        {
          hour: 4,
          powerDemandKw: 0,
        },
        {
          hour: 5,
          powerDemandKw: 0,
        },
        {
          hour: 6,
          powerDemandKw: 0,
        },
        {
          hour: 7,
          powerDemandKw: 0,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
  ],
  id: 3,
  name: "Diesel Only",
  fuelCostUsd: 19349715,
  insuranceCostUsd: 8000000,
  downtimeCostUsd: 27300000,
  maintenanceCostUsd: 13200000,
  otherOAndMCostUsd: 0,
  laborCostUsd: 32000000,
  annualMilesDriven: 2400000,
  dailyMilesDriven: 8000,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 0,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 2132.88,
  totalAnnualEmissionsTonsCo2: 0,
  paybackPeriodYears: 0,
};

export const vehiclesOnly: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [],
  vehiclePurchaseSuggestions: [
    {
      id: 1,
      referenceMakeModel: "Tesla Semi (500mi)",
      numElectricVehicles: 20,
      numIceVehicles: 0,
      totalCapexUsd: 2600000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 900,
        },
        {
          hour: 2,
          powerDemandKw: 900,
        },
        {
          hour: 3,
          powerDemandKw: 900,
        },
        {
          hour: 4,
          powerDemandKw: 900,
        },
        {
          hour: 5,
          powerDemandKw: 900,
        },
        {
          hour: 6,
          powerDemandKw: 900,
        },
        {
          hour: 7,
          powerDemandKw: 900,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 2,
      referenceMakeModel: "Kenworth K270E (200mi)",
      numElectricVehicles: 20,
      numIceVehicles: 0,
      totalCapexUsd: 7072100,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 300,
        },
        {
          hour: 2,
          powerDemandKw: 300,
        },
        {
          hour: 3,
          powerDemandKw: 300,
        },
        {
          hour: 4,
          powerDemandKw: 300,
        },
        {
          hour: 5,
          powerDemandKw: 300,
        },
        {
          hour: 6,
          powerDemandKw: 300,
        },
        {
          hour: 7,
          powerDemandKw: 300,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
  ],
  id: 4,
  name: "Vehicles Only",
  fuelCostUsd: 1919715,
  insuranceCostUsd: 8000000,
  downtimeCostUsd: 8400000,
  maintenanceCostUsd: 6900000,
  otherOAndMCostUsd: 0,
  laborCostUsd: 32000000,
  annualMilesDriven: 2400000,
  dailyMilesDriven: 8000,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 0,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 2132.88,
  totalAnnualEmissionsTonsCo2: 0,
  paybackPeriodYears: 0,
};

export const chargersOnly: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [
    {
      id: 1,
      level: "DC Fast",
      referenceMakeModel: "Heliox",
      numChargers: 10,
      totalCapexUsd: 1100000,
    },
    {
      id: 2,
      level: "DC Fast",
      referenceMakeModel: "Chargepoint Express 250 CPE250",
      numChargers: 10,
      totalCapexUsd: 520000,
    },
  ],
  vehiclePurchaseSuggestions: [],
  id: 5,
  name: "Chargers Only",
  fuelCostUsd: 0,
  insuranceCostUsd: 0,
  downtimeCostUsd: 0,
  maintenanceCostUsd: 69000,
  otherOAndMCostUsd: 0,
  laborCostUsd: 32000,
  annualMilesDriven: 0,
  dailyMilesDriven: 0,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 0,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 0,
  totalAnnualEmissionsTonsCo2: 0,
  paybackPeriodYears: 0,
};

export const hybridScenario: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [
    {
      id: 1,
      level: "DC Fast",
      referenceMakeModel: "Heliox",
      numChargers: 4,
      totalCapexUsd: 440000,
    },
    {
      id: 2,
      level: "DC Fast",
      referenceMakeModel: "Chargepoint Express 250 CPE250",
      numChargers: 4,
      totalCapexUsd: 208000,
    },
  ],
  vehiclePurchaseSuggestions: [
    {
      id: 1,
      referenceMakeModel: "Tesla Semi (500mi)",
      numElectricVehicles: 6,
      numIceVehicles: 0,
      totalCapexUsd: 780000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 300,
        },
        {
          hour: 2,
          powerDemandKw: 300,
        },
        {
          hour: 3,
          powerDemandKw: 300,
        },
        {
          hour: 4,
          powerDemandKw: 300,
        },
        {
          hour: 5,
          powerDemandKw: 300,
        },
        {
          hour: 6,
          powerDemandKw: 300,
        },
        {
          hour: 7,
          powerDemandKw: 300,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 2,
      referenceMakeModel: "Kenworth K270E (200mi)",
      numElectricVehicles: 6,
      numIceVehicles: 0,
      totalCapexUsd: 2121630,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 100,
        },
        {
          hour: 2,
          powerDemandKw: 100,
        },
        {
          hour: 3,
          powerDemandKw: 100,
        },
        {
          hour: 4,
          powerDemandKw: 100,
        },
        {
          hour: 5,
          powerDemandKw: 100,
        },
        {
          hour: 6,
          powerDemandKw: 100,
        },
        {
          hour: 7,
          powerDemandKw: 100,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 3,
      referenceMakeModel: "CASCADIA 126 STOCK",
      numElectricVehicles: 0,
      numIceVehicles: 14,
      totalCapexUsd: 1260000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 0,
        },
        {
          hour: 2,
          powerDemandKw: 0,
        },
        {
          hour: 3,
          powerDemandKw: 0,
        },
        {
          hour: 4,
          powerDemandKw: 0,
        },
        {
          hour: 5,
          powerDemandKw: 0,
        },
        {
          hour: 6,
          powerDemandKw: 0,
        },
        {
          hour: 7,
          powerDemandKw: 0,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 4,
      referenceMakeModel: "Ford F600 XLT",
      numElectricVehicles: 0,
      numIceVehicles: 14,
      totalCapexUsd: 910000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 0,
        },
        {
          hour: 2,
          powerDemandKw: 0,
        },
        {
          hour: 3,
          powerDemandKw: 0,
        },
        {
          hour: 4,
          powerDemandKw: 0,
        },
        {
          hour: 5,
          powerDemandKw: 0,
        },
        {
          hour: 6,
          powerDemandKw: 0,
        },
        {
          hour: 7,
          powerDemandKw: 0,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
  ],
  id: 6,
  name: "Hybrid Fleet",
  fuelCostUsd: 14120715,
  insuranceCostUsd: 8000000,
  downtimeCostUsd: 21630000,
  maintenanceCostUsd: 11310000,
  otherOAndMCostUsd: 0,
  laborCostUsd: 32000000,
  annualMilesDriven: 2400000,
  dailyMilesDriven: 8000,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 100,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 1673.56,
  totalAnnualEmissionsTonsCo2: 459.32,
  paybackPeriodYears: 7.85,
};

export const hybridScenarioModified: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [
    {
      id: 1,
      level: "DC Fast",
      referenceMakeModel: "Heliox",
      numChargers: 3,
      totalCapexUsd: 330000,
    },
    {
      id: 2,
      level: "DC Fast",
      referenceMakeModel: "Chargepoint Express 250 CPE250",
      numChargers: 3,
      totalCapexUsd: 156000,
    },
  ],
  vehiclePurchaseSuggestions: [
    {
      id: 1,
      referenceMakeModel: "Tesla Semi (500mi)",
      numElectricVehicles: 4,
      numIceVehicles: 0,
      totalCapexUsd: 520000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 200,
        },
        {
          hour: 2,
          powerDemandKw: 200,
        },
        {
          hour: 3,
          powerDemandKw: 200,
        },
        {
          hour: 4,
          powerDemandKw: 200,
        },
        {
          hour: 5,
          powerDemandKw: 200,
        },
        {
          hour: 6,
          powerDemandKw: 200,
        },
        {
          hour: 7,
          powerDemandKw: 200,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 100,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 200,
        },
        {
          hour: 13,
          powerDemandKw: 100,
        },
        {
          hour: 14,
          powerDemandKw: 200,
        },
        {
          hour: 15,
          powerDemandKw: 200,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 2,
      referenceMakeModel: "Kenworth K270E (200mi)",
      numElectricVehicles: 4,
      numIceVehicles: 0,
      totalCapexUsd: 1414420,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 100,
        },
        {
          hour: 2,
          powerDemandKw: 100,
        },
        {
          hour: 3,
          powerDemandKw: 100,
        },
        {
          hour: 4,
          powerDemandKw: 100,
        },
        {
          hour: 5,
          powerDemandKw: 100,
        },
        {
          hour: 6,
          powerDemandKw: 0,
        },
        {
          hour: 7,
          powerDemandKw: 0,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 100,
        },
        {
          hour: 11,
          powerDemandKw: 100,
        },
        {
          hour: 12,
          powerDemandKw: 100,
        },
        {
          hour: 13,
          powerDemandKw: 100,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 3,
      referenceMakeModel: "CASCADIA 126 STOCK",
      numElectricVehicles: 0,
      numIceVehicles: 10,
      totalCapexUsd: 900000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 0,
        },
        {
          hour: 2,
          powerDemandKw: 0,
        },
        {
          hour: 3,
          powerDemandKw: 0,
        },
        {
          hour: 4,
          powerDemandKw: 0,
        },
        {
          hour: 5,
          powerDemandKw: 0,
        },
        {
          hour: 6,
          powerDemandKw: 0,
        },
        {
          hour: 7,
          powerDemandKw: 0,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 4,
      referenceMakeModel: "Ford F600 XLT",
      numElectricVehicles: 0,
      numIceVehicles: 10,
      totalCapexUsd: 650000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 0,
        },
        {
          hour: 2,
          powerDemandKw: 0,
        },
        {
          hour: 3,
          powerDemandKw: 0,
        },
        {
          hour: 4,
          powerDemandKw: 0,
        },
        {
          hour: 5,
          powerDemandKw: 0,
        },
        {
          hour: 6,
          powerDemandKw: 0,
        },
        {
          hour: 7,
          powerDemandKw: 0,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
  ],
  id: 7,
  name: "Hybrid Fleet (Modified Schedule)",
  fuelCostUsd: 14120715,
  insuranceCostUsd: 8000000,
  downtimeCostUsd: 18830000,
  maintenanceCostUsd: 12310000,
  otherOAndMCostUsd: 0,
  laborCostUsd: 32000000,
  annualMilesDriven: 2400000,
  dailyMilesDriven: 8000,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 100,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 1673.56,
  totalAnnualEmissionsTonsCo2: 459.32,
  paybackPeriodYears: 7.85,
};

export const fullElectricEvOnly: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [],
  vehiclePurchaseSuggestions: [
    {
      id: 1,
      referenceMakeModel: "Tesla Semi (500mi)",
      numElectricVehicles: 20,
      numIceVehicles: 0,
      totalCapexUsd: 2600000,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 900,
        },
        {
          hour: 2,
          powerDemandKw: 900,
        },
        {
          hour: 3,
          powerDemandKw: 900,
        },
        {
          hour: 4,
          powerDemandKw: 900,
        },
        {
          hour: 5,
          powerDemandKw: 900,
        },
        {
          hour: 6,
          powerDemandKw: 900,
        },
        {
          hour: 7,
          powerDemandKw: 900,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
    {
      id: 2,
      referenceMakeModel: "Kenworth K270E (200mi)",
      numElectricVehicles: 20,
      numIceVehicles: 0,
      totalCapexUsd: 7072100,
      powerDemandProfile: [
        {
          hour: 0,
          powerDemandKw: 0,
        },
        {
          hour: 1,
          powerDemandKw: 300,
        },
        {
          hour: 2,
          powerDemandKw: 300,
        },
        {
          hour: 3,
          powerDemandKw: 300,
        },
        {
          hour: 4,
          powerDemandKw: 300,
        },
        {
          hour: 5,
          powerDemandKw: 300,
        },
        {
          hour: 6,
          powerDemandKw: 300,
        },
        {
          hour: 7,
          powerDemandKw: 300,
        },
        {
          hour: 8,
          powerDemandKw: 0,
        },
        {
          hour: 9,
          powerDemandKw: 0,
        },
        {
          hour: 10,
          powerDemandKw: 0,
        },
        {
          hour: 11,
          powerDemandKw: 0,
        },
        {
          hour: 12,
          powerDemandKw: 0,
        },
        {
          hour: 13,
          powerDemandKw: 0,
        },
        {
          hour: 14,
          powerDemandKw: 0,
        },
        {
          hour: 15,
          powerDemandKw: 0,
        },
        {
          hour: 16,
          powerDemandKw: 0,
        },
        {
          hour: 17,
          powerDemandKw: 0,
        },
        {
          hour: 18,
          powerDemandKw: 0,
        },
        {
          hour: 19,
          powerDemandKw: 0,
        },
        {
          hour: 20,
          powerDemandKw: 0,
        },
        {
          hour: 21,
          powerDemandKw: 0,
        },
        {
          hour: 22,
          powerDemandKw: 0,
        },
        {
          hour: 23,
          powerDemandKw: 0,
        },
      ],
    },
  ],
  id: 8,
  name: "Fully Electric - EV Only",
  fuelCostUsd: 1919715,
  insuranceCostUsd: 8000000,
  downtimeCostUsd: 8400000,
  maintenanceCostUsd: 6900000,
  otherOAndMCostUsd: 0,
  laborCostUsd: 32000000,
  annualMilesDriven: 2400000,
  dailyMilesDriven: 8000,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 300,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 1531.44,
  totalAnnualEmissionsTonsCo2: 601.44,
  paybackPeriodYears: 7.85,
};

export const fullElectricEvseOnly: FleetElectrificationScenario = {
  chargerPurchaseSuggestions: [
    {
      id: 1,
      level: "DC Fast",
      referenceMakeModel: "Heliox",
      numChargers: 10,
      totalCapexUsd: 1100000,
    },
    {
      id: 2,
      level: "DC Fast",
      referenceMakeModel: "Chargepoint Express 250 CPE250",
      numChargers: 10,
      totalCapexUsd: 520000,
    },
  ],
  vehiclePurchaseSuggestions: [],
  id: 9,
  name: "Fully Electric - EVSE Only",
  fuelCostUsd: 0,
  insuranceCostUsd: 0,
  downtimeCostUsd: 0,
  maintenanceCostUsd: 0,
  otherOAndMCostUsd: 0,
  laborCostUsd: 0,
  annualMilesDriven: 2400000,
  dailyMilesDriven: 8000,
  evEquivalentEnergyConsumptionPerMile: 2.19,
  averageHourlyConsumptionKwhPerHour: 300,
  equipmentLifecycleYears: 10,
  emissionReductionsTonsCo2: 1531.44,
  totalAnnualEmissionsTonsCo2: 601.44,
  paybackPeriodYears: 7.85,
};

type User = {
  id: number;
  name: string;
  scenarios: FleetElectrificationScenario[];
};

export const users: User[] = [
  {
    id: 1,
    name: "Vehicle-Only User",
    scenarios: [vehiclesOnly],
  },
  {
    id: 2,
    name: "Charger-Only User",
    scenarios: [chargersOnly],
  },
  {
    id: 3,
    name: "Example User 3",
    scenarios: [fullElectric],
  },
];
