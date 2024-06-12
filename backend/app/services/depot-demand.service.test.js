const pool = require("../db");
const depotDemandService = require("./depot-demand.service");
const { flattenTemplateString } = require("../utils");

// Mock the pool object (database connection pool)
jest.mock("../db");

describe("Depot Demand Service", () => {
  describe("get", () => {
    beforeEach(() => {
      const mockQueryResult = {
        rows: [
          {
            depot_id: 1,
            hourid: 1,
            simulation_year: 2023,
            energy_demand_kwh_summer: 1000,
            energy_demand_kwh_winter: 2000,
            energy_demand_kwh_shoulder: 1500,
            power_demand_kw_summer: 50,
            power_demand_kw_winter: 100,
            power_demand_kw_shoulder: 75,
          },
        ],
      };
      pool.query.mockResolvedValueOnce(mockQueryResult);
    });
    afterEach(() => {
      // Clear mock calls after each test
      jest.clearAllMocks();
    });

    const baseQuery = `SELECT
      unique_id as depot_id,
      hourid,
      simulation_year,
      SUM(energy_demand_kwh_summer) AS energy_demand_kwh_summer,
      SUM(energy_demand_kwh_winter) AS energy_demand_kwh_winter,
      SUM(energy_demand_kwh_shoulder) AS energy_demand_kwh_shoulder,
      SUM(power_demand_kw_summer) AS power_demand_kw_summer,
      SUM(power_demand_kw_winter) AS power_demand_kw_winter,
      SUM(power_demand_kw_shoulder) AS power_demand_kw_shoulder
    FROM et_prod.v_feeder_demand_qad_v2 nfd2`;
    const groupBy = `GROUP BY unique_id, hourid, simulation_year;`;

    it("uses the correct query to filter on unique_id, simulation_year, hourid, and state", async () => {
      const whereClause = `WHERE unique_id = $1 AND simulation_year = $2 AND hourid::int % 24 = $3 AND state = $4`;
      const expectedQuery = flattenTemplateString(
        `${baseQuery} ${whereClause} ${groupBy}`
      );

      const depotId = 1;
      const year = 2023;
      const hour = 1;
      const state = "NY";

      await depotDemandService.get(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, [
        depotId,
        year,
        hour,
        state,
      ]);
    });

    it("uses the correct query to filter on unique_id, simulation_year, and hourid", async () => {
      const whereClause = `WHERE unique_id = $1 AND simulation_year = $2 AND hourid::int % 24 = $3`;
      const expectedQuery = flattenTemplateString(
        `${baseQuery} ${whereClause} ${groupBy}`
      );

      const depotId = 1;
      const year = 2023;
      const hour = 1;
      const state = undefined;

      await depotDemandService.get(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, [
        depotId,
        year,
        hour,
      ]);
    });

    it("uses the correct query to filter on hourid", async () => {
      const whereClause = `WHERE hourid::int % 24 = $1`;
      const expectedQuery = flattenTemplateString(
        `${baseQuery} ${whereClause} ${groupBy}`
      );

      const depotId = undefined;
      const year = undefined;
      const hour = 1;
      const state = undefined;

      await depotDemandService.get(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, [hour]);
    });

    it("uses the correct query with no filters", async () => {
      const expectedQuery = flattenTemplateString(`${baseQuery} ${groupBy}`);

      const depotId = undefined;
      const year = undefined;
      const hour = undefined;
      const state = undefined;

      await depotDemandService.get(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, []);
    });
  });
  describe("getByState", () => {
    beforeEach(() => {
      const mockQueryResult = {
        rows: [
          {
            depot_id: 1,
            hourid: 1,
            simulation_year: 2023,
            energy_demand_kwh_summer: 1000,
            energy_demand_kwh_winter: 2000,
            energy_demand_kwh_shoulder: 1500,
            power_demand_kw_summer: 50,
            power_demand_kw_winter: 100,
            power_demand_kw_shoulder: 75,
          },
        ],
      };
      pool.query.mockResolvedValueOnce(mockQueryResult);
    });
    afterEach(() => {
      // Clear mock calls after each test
      jest.clearAllMocks();
    });

    const baseQuery = `SELECT
      unique_id as depot_id,
      hourid,
      simulation_year,
      SUM(energy_demand_kwh_summer) AS energy_demand_kwh_summer,
      SUM(energy_demand_kwh_winter) AS energy_demand_kwh_winter,
      SUM(energy_demand_kwh_shoulder) AS energy_demand_kwh_shoulder,
      SUM(power_demand_kw_summer) AS power_demand_kw_summer,
      SUM(power_demand_kw_winter) AS power_demand_kw_winter,
      SUM(power_demand_kw_shoulder) AS power_demand_kw_shoulder
    FROM et_prod.v_feeder_demand_qad_v2 nfd2`;
    const groupBy = `GROUP BY unique_id, hourid, simulation_year;`;

    it("uses the correct query to filter on unique_id, simulation_year, hourid, and state", async () => {
      const whereClause = `WHERE unique_id = $1 AND simulation_year = $2 AND hourid::int % 24 = $3 AND state = $4`;
      const expectedQuery = flattenTemplateString(
        `${baseQuery} ${whereClause} ${groupBy}`
      );

      const depotId = 1;
      const year = 2023;
      const hour = 1;
      const state = "NY";

      await depotDemandService.getByState(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, [
        depotId,
        year,
        hour,
        state,
      ]);
    });

    it("uses the correct query to filter on unique_id, simulation_year, and hourid", async () => {
      const whereClause = `WHERE unique_id = $1 AND simulation_year = $2 AND hourid::int % 24 = $3`;
      const expectedQuery = flattenTemplateString(
        `${baseQuery} ${whereClause} ${groupBy}`
      );

      const depotId = 1;
      const year = 2023;
      const hour = 1;
      const state = undefined;

      await depotDemandService.getByState(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, [
        depotId,
        year,
        hour,
      ]);
    });

    it("uses the correct query to filter on hourid", async () => {
      const whereClause = `WHERE hourid::int % 24 = $1`;
      const expectedQuery = flattenTemplateString(
        `${baseQuery} ${whereClause} ${groupBy}`
      );

      const depotId = undefined;
      const year = undefined;
      const hour = 1;
      const state = undefined;

      await depotDemandService.getByState(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, [hour]);
    });

    it("uses the correct query with no filters", async () => {
      const expectedQuery = flattenTemplateString(`${baseQuery} ${groupBy}`);

      const depotId = undefined;
      const year = undefined;
      const hour = undefined;
      const state = undefined;

      await depotDemandService.getByState(depotId, year, hour, state);

      expect(pool.query).toHaveBeenCalledWith(expectedQuery, []);
    });
  });
});
