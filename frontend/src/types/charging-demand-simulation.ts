import { Ac } from "./ac";

export type ChargingDemandSimulation = {
  id: number;
  percentEvs: number;
  ac: Ac;
};
