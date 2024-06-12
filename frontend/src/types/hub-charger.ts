export interface HubCharger {
  id: number;
  name: string;
  make: string;
  model: string;
  charge_rate_kw: number;
  voltage: number;
  amperage: number;
  price: number;
}
