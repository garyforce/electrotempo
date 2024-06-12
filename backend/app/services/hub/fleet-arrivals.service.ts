import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import fs from 'node:fs';

interface FleetArrivalData {
  label: string;
  vehicle_type_id: number;
  hour_0: number;
  hour_1: number;
  hour_2: number;
  hour_3: number;
  hour_4: number;
  hour_5: number;
  hour_6: number;
  hour_7: number;
  hour_8: number;
  hour_9: number;
  hour_10: number;
  hour_11: number;
  hour_12: number;
  hour_13: number;
  hour_14: number;
  hour_15: number;
  hour_16: number;
  hour_17: number;
  hour_18: number;
  hour_19: number;
  hour_20: number;
  hour_21: number;
  hour_22: number;
  hour_23: number;
}

interface FleetArrival extends FleetArrivalData {
  id: number;
}

interface UploadArrival {
  fleet_name: string;
  vehicle_type: string;
  arrivals_at_hour0: string;
  arrivals_at_hour1: string;
  arrivals_at_hour2: string;
  arrivals_at_hour3: string;
  arrivals_at_hour4: string;
  arrivals_at_hour5: string;
  arrivals_at_hour6: string;
  arrivals_at_hour7: string;
  arrivals_at_hour8: string;
  arrivals_at_hour9: string;
  arrivals_at_hour10: string;
  arrivals_at_hour11: string;
  arrivals_at_hour12: string;
  arrivals_at_hour13: string;
  arrivals_at_hour14: string;
  arrivals_at_hour15: string;
  arrivals_at_hour16: string;
  arrivals_at_hour17: string;
  arrivals_at_hour18: string;
  arrivals_at_hour19: string;
  arrivals_at_hour20: string;
  arrivals_at_hour21: string;
  arrivals_at_hour22: string;
  arrivals_at_hour23: string;
}

const VEHICLE_TYPE_TRUCK = 'truck';
const VEHICLE_TYPE_TRACTOR = 'tractor';

const prisma = new PrismaClient();

const defaultSelect = {
  id: true,
  label: true,
  vehicle_type_id: true,
  hour_0: true,
  hour_1: true,
  hour_2: true,
  hour_3: true,
  hour_4: true,
  hour_5: true,
  hour_6: true,
  hour_7: true,
  hour_8: true,
  hour_9: true,
  hour_10: true,
  hour_11: true,
  hour_12: true,
  hour_13: true,
  hour_14: true,
  hour_15: true,
  hour_16: true,
  hour_17: true,
  hour_18: true,
  hour_19: true,
  hour_20: true,
  hour_21: true,
  hour_22: true,
  hour_23: true,
};

export const shouldApplyFleetArrivals = async (siteId: number): Promise<boolean> => {
  const fleetArrival = await prisma.hubFleetArrival.findFirst({
    where: {
      site_id: siteId,
      deleted_at: null,
    },
    select: {
      id: true,
    },
  });

  return !!fleetArrival;
}

export const importFleetArrivals = async (
  siteId: number,
  userId: number | null,
  filePath: string,
  override: boolean = false
): Promise<{
  success: number;
  overrides: { current: FleetArrival; new: FleetArrivalData; line: number }[];
}> => {
  const uploadArrivals = await parseUploadArrivals(filePath);
  const fleetArrivalsData = convertUploadToImportData(uploadArrivals);

  const fleetArrivals = [];
  const overrideRecords = [];
  for (const [i, fleetArrivalData] of fleetArrivalsData.entries()) {
    const existingRecord = await getFleetArrivalByUniqueKeys(
      siteId,
      fleetArrivalData.vehicle_type_id,
      fleetArrivalData.label
    );

    if (!existingRecord) {
      fleetArrivals.push(
        await createFleetArrival(siteId, userId, fleetArrivalData)
      );
      continue;
    }

    const shouldUpdate = checkShouldUpdate(fleetArrivalData, existingRecord);
    if (!shouldUpdate) {
      continue;
    }

    if (!override) {
      overrideRecords.push({
        current: existingRecord,
        new: fleetArrivalData,
        line: i + 2,
      });
      continue;
    }

    fleetArrivals.push(
      await updateFleetArrivalById(existingRecord.id, userId, fleetArrivalData)
    );
  }

  return {
    success: fleetArrivals.length,
    overrides: overrideRecords,
  };
};

export const getFleetArrivalsGroupByLabel = async (siteId: number) => {
  const fleetArrivals = await getFleetArrivals(siteId);

  return fleetArrivals.reduce((aggData: any, data: any) => {
    const { id, label, vehicle_type_id } = data;

    let numArrivals = 0;
    Array.from({ length: 24 }, (x, i) => {
      numArrivals += data[`hour_${i}`];
    });

    aggData[label] = aggData[label] || [];
    aggData[label].push({ id, vehicle_type_id, num_arrivals: numArrivals });

    return aggData;
  }, {});
};

export const getFleetArrivals = async (
  siteId: number
): Promise<FleetArrival[]> => {
  return await prisma.hubFleetArrival.findMany({
    where: {
      site_id: siteId,
      deleted_at: null,
    },
    select: defaultSelect,
  });
};

export const getFleetArrivalsGroupByVehicleType = async (siteId: number) => {
  const results = await prisma.hubFleetArrival.groupBy({
    by: ['site_id', 'vehicle_type_id'],
    where: {
      site_id: siteId,
      deleted_at: null,
    },
    _sum: {
      hour_0: true,
      hour_1: true,
      hour_2: true,
      hour_3: true,
      hour_4: true,
      hour_5: true,
      hour_6: true,
      hour_7: true,
      hour_8: true,
      hour_9: true,
      hour_10: true,
      hour_11: true,
      hour_12: true,
      hour_13: true,
      hour_14: true,
      hour_15: true,
      hour_16: true,
      hour_17: true,
      hour_18: true,
      hour_19: true,
      hour_20: true,
      hour_21: true,
      hour_22: true,
      hour_23: true,
    },
  });

  return results.map(result => ({
    site_id: siteId,
    vehicle_type_id: result.vehicle_type_id,
    ...result._sum,
  }));
};

export const getFleetArrivalsByVehicleType = async (
  siteId: number,
  vehicleTypeId: number
): Promise<FleetArrival[]> => {
  return await prisma.hubFleetArrival.findMany({
    where: {
      site_id: siteId,
      vehicle_type_id: vehicleTypeId,
      deleted_at: null,
    },
    select: defaultSelect,
  });
};

export const getFleetArrivalByUniqueKeys = async (
  siteId: number,
  vehicleTypeId: number,
  label: string
): Promise<FleetArrival | null> => {
  return await prisma.hubFleetArrival.findFirst({
    where: {
      site_id: siteId,
      vehicle_type_id: vehicleTypeId,
      label,
      deleted_at: null,
    },
    select: defaultSelect,
  });
};

export const updateFleetArrivalById = async (
  id: number,
  userId: number | null,
  fleetArrivalData: FleetArrivalData
): Promise<FleetArrival> => {
  return await prisma.hubFleetArrival.update({
    where: {
      id,
    },
    select: defaultSelect,
    data: {
      user_id: userId,
      ...fleetArrivalData,
    },
  });
};

export const deleteFleetArrivalById = async (
  siteId: number,
  id: number
): Promise<FleetArrival> => {
  try {
    return await prisma.hubFleetArrival.update({
      where: {
        id,
        site_id: siteId,
        deleted_at: null,
      },
      select: defaultSelect,
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (err) {
    throw new Error('No records found');
  }
};

export const createFleetArrival = async (
  siteId: number,
  userId: number | null,
  fleetArrivalData: FleetArrivalData
): Promise<FleetArrival> => {
  return await prisma.hubFleetArrival.create({
    select: defaultSelect,
    data: {
      user_id: userId,
      site_id: siteId,
      ...fleetArrivalData,
    },
  });
};

export const checkShouldUpdate = (
  newData: FleetArrivalData,
  existingData: any
): boolean => {
  let hour = 0;
  let shouldUpdate = false;
  while (!shouldUpdate && hour < 24) {
    if (
      newData[`hour_${hour}` as keyof typeof newData] !==
      existingData[`hour_${hour}` as keyof typeof existingData]
    ) {
      shouldUpdate = true;
    }
    hour++;
  }
  return shouldUpdate;
};

export const convertUploadToImportData = (
  uploadArrivals: UploadArrival[]
): FleetArrivalData[] => {
  const TRUCK_VEHICLE_TYPE_ID = 2;
  const TRAILER_VEHICLE_TYPE_ID = 3;

  return uploadArrivals.reduce(
    (importData: FleetArrivalData[], uploadData: UploadArrival) => {
      const vehicleTypeId =
        uploadData.vehicle_type.toLowerCase() === VEHICLE_TYPE_TRUCK
          ? TRUCK_VEHICLE_TYPE_ID
          : TRAILER_VEHICLE_TYPE_ID;

      const data: any = {
        label: uploadData.fleet_name,
        vehicle_type_id: vehicleTypeId,
      };

      Array.from({ length: 24 }, (x, i) => {
        data[`hour_${i}`] =
          Number(
            uploadData[`arrivals_at_hour${i}` as keyof typeof uploadData]
          ) || 0;
      });

      importData.push(data);

      return importData;
    },
    []
  );
};

export const parseUploadArrivals = (
  filePath: string
): Promise<UploadArrival[]> => {
  const COL_FLEET_NAME = 'fleet_name';
  const COL_VEHICLE_TYPE = 'vehicle_type';
  const COL_HOUR_PREFIX = 'arrivals_at_hour';

  const hourColumns = Array.from({ length: 24 }, (_, i) => COL_HOUR_PREFIX + i);
  const requiredColumns = [COL_FLEET_NAME, COL_VEHICLE_TYPE, ...hourColumns];

  const validVehicleTypes = [VEHICLE_TYPE_TRUCK, VEHICLE_TYPE_TRACTOR];

  let hasRequiredColumns = false;
  let rowCount = 2;

  const uploadArrivals: any = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header, index }) => header.trim().toLowerCase(),
          mapValues: ({ header, index, value }) => value.trim(),
        })
      )
      .on('data', row => {
        // Validate all required columns are provided
        if (!hasRequiredColumns) {
          for (const reqCol of requiredColumns) {
            if (!(reqCol in row)) {
              return reject(`Missing column ${reqCol}`);
            }
          }
          hasRequiredColumns = true;
        }
        // Check for valid vehicle types
        if (!validVehicleTypes.includes(row.vehicle_type.toLowerCase())) {
          return reject(`Invalid vehicle_type at line ${rowCount}`);
        }
        // Check for empty fleet_name
        if (!row.fleet_name) {
          return reject(`Invalid fleet_name at line ${rowCount}`);
        }
        // Check for valid hour values
        hourColumns.forEach(hourColumn => {
          const value = Number(row[hourColumn]);
          if (isNaN(value) || !Number.isInteger(value) || value < 0) {
            return reject(
              `Column ${hourColumn} must be a positive integer at line ${rowCount}`
            );
          }
        });

        uploadArrivals.push({
          fleet_name: row.fleet_name,
          vehicle_type: row.vehicle_type,
          arrivals_at_hour0: row.arrivals_at_hour0,
          arrivals_at_hour1: row.arrivals_at_hour1,
          arrivals_at_hour2: row.arrivals_at_hour2,
          arrivals_at_hour3: row.arrivals_at_hour3,
          arrivals_at_hour4: row.arrivals_at_hour4,
          arrivals_at_hour5: row.arrivals_at_hour5,
          arrivals_at_hour6: row.arrivals_at_hour6,
          arrivals_at_hour7: row.arrivals_at_hour7,
          arrivals_at_hour8: row.arrivals_at_hour8,
          arrivals_at_hour9: row.arrivals_at_hour9,
          arrivals_at_hour10: row.arrivals_at_hour10,
          arrivals_at_hour11: row.arrivals_at_hour11,
          arrivals_at_hour12: row.arrivals_at_hour12,
          arrivals_at_hour13: row.arrivals_at_hour13,
          arrivals_at_hour14: row.arrivals_at_hour14,
          arrivals_at_hour15: row.arrivals_at_hour15,
          arrivals_at_hour16: row.arrivals_at_hour16,
          arrivals_at_hour17: row.arrivals_at_hour17,
          arrivals_at_hour18: row.arrivals_at_hour18,
          arrivals_at_hour19: row.arrivals_at_hour19,
          arrivals_at_hour20: row.arrivals_at_hour20,
          arrivals_at_hour21: row.arrivals_at_hour21,
          arrivals_at_hour22: row.arrivals_at_hour22,
          arrivals_at_hour23: row.arrivals_at_hour23,
        });

        rowCount++;
      })
      .on('error', err => {
        return reject(err.message);
      })
      .on('end', () => {
        resolve(uploadArrivals);
      });
  });
};
