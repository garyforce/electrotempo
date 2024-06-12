export type Charger = {
  id: number;
  uuid: string;
  name: string | null;
  make: string | null;
  model: string | null;
  chargeRateKw: number;
  voltage: number;
  amperage: number;
  priceUsd: number;
};
