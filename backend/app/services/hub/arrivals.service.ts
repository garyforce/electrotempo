import { PrismaClient } from "@prisma/client";

import { getFleetArrivalsGroupByVehicleType } from "./fleet-arrivals.service";

const prisma = new PrismaClient();

export interface ArrivalData {
  capture_arrivals: number;
  subscription_capture_arrivals: number;
  public_arrivals: number;
  subscription_arrivals: number;
  capture_rate?: number;
  subscription_capture_rate?: number;
  peaks: PeakData;
  hourly_data: ArrivalHourData[];
}

export interface ArrivalHourData {
  hour: number;
  capture_arrivals: number;
  public_arrivals: number;
  subscription_arrivals: number;
}

export interface PeakData {
  peak_arrivals: number;
  peak_public_arrivals: number;
  peak_subscription_arrivals: number;
  peak_hours: ArrivalHourData[];
}

export const getArrivalData = async (
  siteId: number,
  numArrivals: number,
  vehicleTypeId: number,
  growthRate: number,
  selectedYear: number,
  currentYear: number,
  publicPct: number,
  evAdoptionRate: number,
  captureRate: number,
  subCaptureRate: number
): Promise<ArrivalData> => {
  const arrivalRates = await getArrivalRates(siteId, vehicleTypeId);
  const siteFleetArrivals = await getFleetArrivalsGroupByVehicleType(siteId);
  const applyFleetArrivals = siteFleetArrivals.length > 0;
  const [vehicleTypeFleetArrivals] = siteFleetArrivals.filter(
    fleetArrival => fleetArrival.vehicle_type_id === vehicleTypeId
  );

  const {
    captureArrivals,
    publicArrivals,
    subscriptionArrivals,
    fleetArrivals,
    hourlyData,
  } = await getHourlyData(
    arrivalRates,
    vehicleTypeFleetArrivals,
    numArrivals,
    selectedYear,
    currentYear,
    evAdoptionRate,
    growthRate,
    captureRate,
    subCaptureRate,
    publicPct,
    applyFleetArrivals
  );

  // Recalculate subscription capture rate when fleet arrivals are applied
  subCaptureRate = applyFleetArrivals
    ? Math.min(fleetArrivals / subscriptionArrivals, 1)
    : subCaptureRate;

  const subArrivals = applyFleetArrivals ? fleetArrivals : subscriptionArrivals;

  const subCaptureArrivals =
    (applyFleetArrivals ? fleetArrivals : subscriptionArrivals) /
    subCaptureRate;

  const peaks = getPeakArrivalData(hourlyData);

  return {
    capture_arrivals: captureArrivals,
    subscription_capture_arrivals: subCaptureArrivals,
    public_arrivals: publicArrivals,
    subscription_arrivals: subArrivals,
    capture_rate: captureRate,
    subscription_capture_rate: subCaptureRate,
    peaks,
    hourly_data: hourlyData,
  };
};

const getHourlyData = async (
  arrivalRates: ArrivalRate[],
  vehicleTypeFleetArrivals: any | undefined,
  numArrivals: number,
  selectedYear: number,
  currentYear: number,
  evAdoptionRate: number,
  growthRate: number,
  captureRate: number,
  subCaptureRate: number,
  publicPct: number,
  applyFleetArrivals: boolean
): Promise<{
  captureArrivals: number;
  publicArrivals: number;
  subscriptionArrivals: number;
  fleetArrivals: number;
  hourlyData: ArrivalHourData[];
}> => {
  let totalCaptureArrivals = 0;
  let totalPublicArrivals = 0;
  let totalSubscriptionArrivals = 0;
  let totalFleetArrivals = 0;

  const hourlyData = arrivalRates.reduce(
    (arrivalHourlyData: ArrivalHourData[], arrivals: any) => {
      const { hour, traffic_pct } = arrivals;

      const hourArrivals = Math.ceil(numArrivals * traffic_pct);
      const hourEvArrivals = calculateEvArrivals(
        hourArrivals,
        selectedYear,
        currentYear,
        evAdoptionRate,
        growthRate
      );

      const hourPublicArrivals = Math.round(
        Math.round(hourEvArrivals * publicPct) * captureRate
      );
      const subArrivals = Math.round(
        Math.round(hourEvArrivals * (1 - publicPct)) *
          (applyFleetArrivals ? 1 : subCaptureRate)
      );
      const fleetArrivals = vehicleTypeFleetArrivals
        ? vehicleTypeFleetArrivals[
            `hour_${hour}` as keyof typeof vehicleTypeFleetArrivals
          ] || 0
        : 0;

      // Override subscription arrivals with fleet arrivals when available
      const hourSubArrivals = applyFleetArrivals ? fleetArrivals : subArrivals;

      const hourCaptureArrivals = hourPublicArrivals + hourSubArrivals;

      totalCaptureArrivals += hourCaptureArrivals;
      totalPublicArrivals += hourPublicArrivals;
      totalSubscriptionArrivals += subArrivals;
      totalFleetArrivals += fleetArrivals;

      arrivalHourlyData[hour] = {
        hour,
        capture_arrivals: hourCaptureArrivals,
        public_arrivals: hourPublicArrivals,
        subscription_arrivals: hourSubArrivals,
      };

      return arrivalHourlyData;
    },
    []
  );

  return {
    captureArrivals: totalCaptureArrivals,
    publicArrivals: totalPublicArrivals,
    subscriptionArrivals: totalSubscriptionArrivals,
    fleetArrivals: totalFleetArrivals,
    hourlyData,
  };
};

export const getPeakArrivalData = (hourlyData: ArrivalHourData[]): PeakData => {
  const peaks = {
    peak_arrivals: 0,
    peak_public_arrivals: 0,
    peak_subscription_arrivals: 0,
  };

  hourlyData.map((data: ArrivalHourData) => {
    peaks.peak_arrivals = Math.max(peaks.peak_arrivals, data.capture_arrivals);
    peaks.peak_public_arrivals = Math.max(
      peaks.peak_public_arrivals,
      data.public_arrivals
    );
    peaks.peak_subscription_arrivals = Math.max(
      peaks.peak_subscription_arrivals,
      data.subscription_arrivals
    );
  });

  const peakHours = hourlyData.filter(
    (data: ArrivalHourData) => data.capture_arrivals === peaks.peak_arrivals
  );

  return {
    ...peaks,
    peak_hours: peakHours,
  };
};

const calculateEvArrivals = (
  numArrivals: number,
  selectedYear: number,
  currentYear: number,
  evAdoptionRate: number,
  growthRate: number
): number => {
  return Math.ceil(
    numArrivals *
      Math.pow(1 + growthRate, selectedYear - currentYear) *
      evAdoptionRate
  );
};

interface ArrivalRate {
  hour: number;
  traffic_pct: number;
}

const getArrivalRates = async (
  siteId: number,
  vehicleTypeId: number
): Promise<ArrivalRate[]> => {
  return await prisma.hubArrivalRate.findMany({
    where: {
      site_id: siteId,
      vehicle_type_id: vehicleTypeId,
      // traffic_year: currentYear,
    },
    select: {
      hour: true,
      traffic_pct: true,
    },
    orderBy: {
      hour: "asc",
    },
  });
};
