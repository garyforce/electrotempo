import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type IntermediateLocation = Prisma.LocationSelect & {
  center: string;
};

async function getAll() {
  const unprocessedData: IntermediateLocation[] = await prisma.$queryRaw`
    SELECT
      id,
      name,
      "public".ST_AsGeoJSON(center) as center,
      zoom,
      "ev_insites_enabled"
    FROM location
    WHERE active = true
    order by inserted_timestamp asc
    `;
  const allLocations = unprocessedData.map((location) => {
    const centerGeoJson = JSON.parse(location.center);
    return {
      ...location,
      center: centerGeoJson.coordinates.reverse(), // convert [lng, lat] to [lat, lng]
    };
  });
  return allLocations;
}

module.exports = {
  getAll,
};
