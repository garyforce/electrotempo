import pool from "../db"; // Unable to use prisma due to unsupported field types

interface TerritoryBlockGroupSearchParams {
  territoryId: number;
  trafficModelId: number;
}

interface BlockGroup {
  block_group_id: string;
  coordinates: string;
  aland: number;
}

interface BlockGroupFeatureCollection {
  type: string;
  features: BlockGroupFeature[];
}

interface BlockGroupFeature {
  type: string;
  properties: {
    geoid: string;
    area: number;
  };
  geometry: object;
}

export const getBlockGroupsByTrafficModel = async (
  trafficModelId: number
): Promise<BlockGroupFeatureCollection> => {
  const blockGroups = await pool.query(
    `
    SELECT
      bg.block_group_id,
      ST_AsGeoJSON(bg.blkgrp_coordinates) as coordinates,
      bg.aland
    FROM et_prod.v_block_group bg, (
      SELECT
        DISTINCT bgd.block_group_id 
      FROM et_prod.v_traffic_model tm
      JOIN et_prod.v_charging_demand_simulation cds ON cds.traffic_model_id = tm.id
      JOIN et_prod.block_group_demand bgd ON bgd.charging_demand_simulation_id = cds.id
      WHERE tm.id = $1
    ) subtable
    WHERE bg.block_group_id = subtable.block_group_id
    ORDER BY bg.block_group_id;
  `,
    [trafficModelId]
  );

  return transformFeatureCollection(blockGroups.rows);
};

export const getBlockGroupsForTerritories = async (
  searchParams: TerritoryBlockGroupSearchParams[]
): Promise<BlockGroupFeatureCollection> => {
  const allBlockGroups: BlockGroup[] = [];

  for (const searchParam of searchParams) {
    const blockGroups = await getTerritoryBlockGroups(
      searchParam.territoryId,
      searchParam.trafficModelId
    );
    allBlockGroups.push(...blockGroups);
  }

  return transformFeatureCollection(allBlockGroups);
};

export const getTerritoryBlockGroups = async (
  territoryId: number,
  trafficModelId: number
): Promise<BlockGroup[]> => {
  let blockGroups = await fetchBlockGroupsByTerritoryId(territoryId);

  if (!blockGroups.length) {
    console.log(`No block groups found for territory ${territoryId}`);
    blockGroups = await createTerritoryBlockGroups(territoryId, trafficModelId);
  }

  return blockGroups;
};

const createTerritoryBlockGroups = async (
  territoryId: number,
  trafficModelId: number
): Promise<BlockGroup[]> => {
  console.log(
    `Finding intersecting block groups for territory ${territoryId}...`
  );

  const intersectBlockGroups: any = await pool.query(
    `
    SELECT
      bg.block_group_id,
      bg.aland,
      ST_AREA(ST_INTERSECTION(bg.blkgrp_coordinates, t.wkb_geometry)::geography)::int AS intersection_area,
      ST_AsText(ST_INTERSECTION(bg.blkgrp_coordinates, t.wkb_geometry)) AS intersection_geometry
    FROM et_prod.territories t
    JOIN (
      SELECT
        DISTINCT bg.block_group_id,
        bg.blkgrp_coordinates,
        bg.aland
      FROM et_prod.v_charging_demand_simulation cds
      JOIN et_prod.block_group_demand bgd ON bgd.charging_demand_simulation_id = cds.id
      JOIN et_prod.block_group bg ON bg.block_group_id = bgd.block_group_id
      WHERE cds.traffic_model_id = $1
    ) bg ON ST_INTERSECTS(bg.blkgrp_coordinates, t.wkb_geometry)
    WHERE t.id = $2
      AND t.deleted_at IS NULL;
  `,
    [trafficModelId, territoryId]
  );

  if (!intersectBlockGroups.rows.length) {
    const errorMessage = `No intersecting block groups found for territory ${territoryId}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log(
    `Found ${intersectBlockGroups.rows.length} intersecting block groups for territory ${territoryId}...`
  );
  console.log(
    `Creating territory block groups for territory ${territoryId}...`
  );

  for (const blockGroup of intersectBlockGroups.rows) {
    const intersectPct = blockGroup.intersection_area / blockGroup.aland;

    let query;
    if (intersectPct < 1) {
      // Store the intersection geometry if the block group intersects with the territory partially
      query = {
        text: `
          INSERT INTO et_prod.territory_block_groups (territory_id, block_group_id, intersect_pct, intersection_area, intersection_geometry)
          VALUES ($1, $2, $3, $4, ST_GeomFromText($5))
          ON CONFLICT (territory_id, block_group_id) DO NOTHING
        `,
        values: [
          territoryId,
          blockGroup.block_group_id,
          intersectPct,
          blockGroup.intersection_area,
          blockGroup.intersection_geometry,
        ],
      };
    } else {
      // Only store the block group id if the block group intersects with the territory completely
      query = {
        text: `
          INSERT INTO et_prod.territory_block_groups (territory_id, block_group_id, intersect_pct)
          VALUES ($1, $2, $3)
          ON CONFLICT (territory_id, block_group_id) DO NOTHING
        `,
        values: [territoryId, blockGroup.block_group_id, intersectPct],
      };
    }

    await pool.query(query.text, query.values);
  }

  console.log(
    `Inserted ${intersectBlockGroups.rows.length} territory block groups for territory ${territoryId}`
  );

  return await fetchBlockGroupsByTerritoryId(territoryId);
};

const fetchBlockGroupsByTerritoryId = async (
  territoryId: number
): Promise<BlockGroup[]> => {
  const result = await pool.query(
    `
    SELECT
      bg.block_group_id,
      (CASE WHEN tbg.intersect_pct < 1
        THEN ST_AsGeoJSON(tbg.intersection_geometry)
        ELSE ST_AsGeoJSON(bg.blkgrp_coordinates)
      END) AS coordinates,
      (CASE WHEN tbg.intersect_pct < 1
        THEN tbg.intersection_area
        ELSE bg.aland
      END) AS aland
    FROM et_prod.territories t
    JOIN et_prod.territory_block_groups tbg ON t.id = tbg.territory_id
    JOIN et_prod.block_group bg ON tbg.block_group_id = bg.block_group_id
    WHERE t.id = $1
      AND t.deleted_at IS NULL;
  `,
    [territoryId]
  );
  return result.rows;
};

const transformFeatureCollection = (
  blockGroups: BlockGroup[]
): BlockGroupFeatureCollection => {
  const featureCollection = {
    type: "FeatureCollection",
    features: [] as BlockGroupFeature[],
  };

  blockGroups.forEach((blockGroup) => {
    featureCollection.features.push({
      type: "Feature",
      properties: {
        geoid: blockGroup.block_group_id,
        area: blockGroup.aland,
      },
      geometry: JSON.parse(blockGroup.coordinates),
    });
  });

  return featureCollection;
};
