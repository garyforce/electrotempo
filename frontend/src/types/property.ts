export type Property = {
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  organization_id: number;
  name: string;
  external_id: string;
  address: string;
  lat: number;
  lon: number;
  utility_rate_id: number | null;
};
