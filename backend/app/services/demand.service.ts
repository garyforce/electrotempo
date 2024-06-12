import pool from "../db"; // Unable to use prisma due to unsupported field types

interface BlockGroupDemand {
  block_group_id: string;
  demand_kwh: number;
}

export const getBlockGroupDemands = async (
  chargingDemandSimulationId: number,
  chargingStrategyIds: number[],
  hour?: number
): Promise<BlockGroupDemand[]> => {
  let query;
  if (hour !== undefined) {
    query = {
      text: `
        SELECT
          bgd.block_group_id,
          SUM(bgd.demand_kwh) as demand_kwh
        FROM et_prod.v_block_group_demand bgd
        WHERE charging_demand_simulation_id = $1
            AND charging_strategy_id = ANY($2::int[])
            AND hour_id = $3
        GROUP BY bgd.block_group_id;
      `,
      values: [chargingDemandSimulationId, chargingStrategyIds, hour],
    };
  } else {
    query = {
      text: `
        SELECT
          bgd.block_group_id,
          SUM(bgd.demand_kwh) as demand_kwh
        FROM et_prod.v_block_group_demand bgd
        WHERE charging_demand_simulation_id = $1
            AND charging_strategy_id = ANY($2::int[])
        GROUP BY bgd.block_group_id;
      `,
      values: [chargingDemandSimulationId, chargingStrategyIds],
    };
  }

  const blockGroupDemands = await pool.query(query.text, query.values);

  return transformBlockGroupDemands(blockGroupDemands.rows);
};

export const getDemandForTerritories = async (
  territoryIds: number[],
  chargingDemandSimulationId: number,
  chargingStrategyIds: number[],
  hour?: number
): Promise<BlockGroupDemand[]> => {
  const allDemands: BlockGroupDemand[] = [];

  for (const territoryId of territoryIds) {
    const territoryDemands = await getTerritoryDemands(
      territoryId,
      chargingDemandSimulationId,
      chargingStrategyIds,
      hour
    );
    allDemands.push(...territoryDemands);
  }

  return allDemands;
};

const getTerritoryDemands = async (
  territoryId: number,
  chargingDemandSimulationId: number,
  chargingStrategyIds: number[],
  hour?: number
): Promise<BlockGroupDemand[]> => {
  let query;
  if (hour !== undefined) {
    query = {
      text: `
        SELECT
          bgd.block_group_id,
          SUM(CASE WHEN tbg.intersect_pct < 1
            THEN bgd.demand_kwh * tbg.intersect_pct
            ELSE bgd.demand_kwh
          END) AS demand_kwh
        FROM et_prod.territory_block_groups tbg
        JOIN et_prod.block_group_demand bgd ON tbg.block_group_id = bgd.block_group_id
          AND bgd.charging_demand_simulation_id = $1
          AND bgd.charging_strategy_id = ANY($2::int[])
          AND tbg.territory_id = $3
          AND bgd.hour_id = $4
        GROUP BY bgd.block_group_id;
      `,
      values: [
        chargingDemandSimulationId,
        chargingStrategyIds,
        territoryId,
        hour,
      ],
    };
  } else {
    query = {
      text: `
        SELECT
          bgd.block_group_id,
          SUM(CASE WHEN tbg.intersect_pct < 1
            THEN bgd.demand_kwh * tbg.intersect_pct
            ELSE bgd.demand_kwh
          END) AS demand_kwh
        FROM et_prod.territory_block_groups tbg
        JOIN et_prod.block_group_demand bgd ON tbg.block_group_id = bgd.block_group_id
          AND bgd.charging_demand_simulation_id = $1
          AND bgd.charging_strategy_id = ANY($2::int[])
          AND tbg.territory_id = $3
        GROUP BY bgd.block_group_id;
      `,
      values: [
        chargingDemandSimulationId,
        chargingStrategyIds,
        territoryId,
      ],
    };
  }

  const territoryDemands = await pool.query(query.text, query.values);

  return transformBlockGroupDemands(territoryDemands.rows);
};

const transformBlockGroupDemands = (
  blockGroupDemands: BlockGroupDemand[]
): BlockGroupDemand[] => {
  return blockGroupDemands.map((demand) => ({
    block_group_id: demand.block_group_id,
    demand_kwh: Number(demand.demand_kwh),
  }));
};
