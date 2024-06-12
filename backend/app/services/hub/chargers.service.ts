import { ArrivalData, ArrivalHourData } from "./arrivals.service";

export interface ChargerData extends ChargerBaseData {
  opt_public_pct: number;
  charger_assignments: {
    public: ChargerAssignmentData;
    subscription: ChargerAssignmentData;
  };
}

export interface ChargerBaseData {
  utility_constrained_feasible_chargers: number;
  parking_area_constrained_feasible_chargers: number;
  num_chargers_needed: number;
  num_assignable_chargers: number;
  num_public_chargers: number;
  num_subscription_chargers: number;
  utility_threshold: number;
  site_area_threshold: number;
  hourly_data: ChargerHourData[];
}

export interface ChargerHourData {
  hour: number;
  public_chargers_in_use: number;
  public_chargers_idle: number;
  public_util_rate: number;
  public_dropped_arrivals: number;
  public_drop_rate: number;
  subscription_chargers_in_use: number;
  subscription_chargers_idle: number;
  subscription_util_rate: number;
  subscription_dropped_arrivals: number;
  subscription_drop_rate: number;
  chargers_in_use: number;
  chargers_idle: number;
  chargers_util_rate: number;
  dropped_arrivals: number;
  drop_rate: number;
}

interface ChargerAssignmentData {
  schedules: ChargerSchedule[];
  avg_util_rate: number;
}

interface ChargerSchedule {
  schedule: number[];
  util_rate: number;
}

export const getChargerData = (
  siteParkingArea: number,
  vehicleParkingArea: number,
  vehicleParkingPct: number,
  chargerChargeRateKw: number,
  maxUtilitySupplyKw: number,
  publicPct: number,
  arrivalData: ArrivalData,
  optPublicChargers?: number,
  optSubChargers?: number
): ChargerData => {
  const useOptimal =
    typeof optPublicChargers !== "undefined" &&
    typeof optSubChargers !== "undefined";

  const { peaks, hourly_data } = arrivalData;

  const utilityThreshold = useOptimal
    ? optPublicChargers + optSubChargers
    : Math.floor(
        (maxUtilitySupplyKw * vehicleParkingPct) / chargerChargeRateKw
      );
  const siteAreaThreshold = Math.floor(
    (siteParkingArea * vehicleParkingPct) / vehicleParkingArea
  );

  const numChargersNeeded = peaks.peak_arrivals;
  const utilityConstrainedFeasibleChargers = utilityThreshold;
  const siteAreaThresholdFeasibleChargers = siteAreaThreshold;

  let numAssignableChargers = Math.min(
    utilityConstrainedFeasibleChargers,
    siteAreaThresholdFeasibleChargers,
    numChargersNeeded
  );
  let optPublicPct = publicPct;

  let numSubChargers = Math.ceil(numAssignableChargers * (1 - publicPct));
  let numPublicChargers = numAssignableChargers - numSubChargers;

  // Apply optimal chargers
  if (useOptimal) {
    numAssignableChargers = Math.min(
      optPublicChargers + optSubChargers,
      numAssignableChargers
    );
    numSubChargers = Math.min(optSubChargers, numAssignableChargers);
    numPublicChargers = Math.min(
      optPublicChargers,
      numAssignableChargers - numSubChargers
    );
    optPublicPct =
      Math.round((numPublicChargers / numAssignableChargers) * 10) / 10; // round to closest tenth
  }

  const {
    publicChargersAssignmentData,
    subChargersAssignmentData,
    chargerHourlyData,
  } = calcChargersAssignmentData(
    numPublicChargers,
    numSubChargers,
    hourly_data
  );

  return {
    utility_constrained_feasible_chargers: utilityConstrainedFeasibleChargers,
    parking_area_constrained_feasible_chargers:
      siteAreaThresholdFeasibleChargers,
    num_chargers_needed: numChargersNeeded,
    num_assignable_chargers: numAssignableChargers,
    num_public_chargers: numPublicChargers,
    num_subscription_chargers: numSubChargers,
    opt_public_pct: optPublicPct,
    utility_threshold: utilityThreshold,
    site_area_threshold: siteAreaThreshold,
    hourly_data: chargerHourlyData,
    charger_assignments: {
      public: publicChargersAssignmentData,
      subscription: subChargersAssignmentData,
    },
  };
};

const calcChargersAssignmentData = (
  numPublicChargers: number,
  numSubChargers: number,
  arrivalsHourlyData: ArrivalHourData[]
) => {
  const publicSchedules: number[][] = initSchedulesData(numPublicChargers);
  const subSchedules: number[][] = initSchedulesData(numSubChargers);

  const chargerHourlyData = arrivalsHourlyData.reduce(
    (chargerData: ChargerHourData[], data: ArrivalHourData) => {
      const { hour, capture_arrivals, public_arrivals, subscription_arrivals } =
        data;

      var publicDroppedArrivals = public_arrivals;
      for (let i = 0; i < numPublicChargers && publicDroppedArrivals > 0; i++) {
        publicSchedules[i][hour] = 1;
        publicDroppedArrivals--;
      }

      var subDroppedArrivals = subscription_arrivals;
      for (let i = 0; i < numSubChargers && subDroppedArrivals > 0; i++) {
        subSchedules[i][hour] = 1;
        subDroppedArrivals--;
      }

      const publicChargersInUse = public_arrivals - publicDroppedArrivals;
      const publicChargersIdle = numPublicChargers - publicChargersInUse;
      const publicUtilRate = publicChargersInUse / numPublicChargers || 0;
      const publicDropRate = publicDroppedArrivals / public_arrivals || 0;

      const subChargersInUse = subscription_arrivals - subDroppedArrivals;
      const subChargersIdle = numSubChargers - subChargersInUse;
      const subUtilRate = subChargersInUse / numSubChargers || 0;
      const subDropRate = subDroppedArrivals / subscription_arrivals || 0;

      const chargersInUse = publicChargersInUse + subChargersInUse;
      const chargersIdle = publicChargersIdle + subChargersIdle;
      const chargersUtilRate =
        chargersInUse / (numPublicChargers + numSubChargers) || 0;
      const droppedArrivals = publicDroppedArrivals + subDroppedArrivals;
      const dropRate = droppedArrivals / capture_arrivals || 0;

      chargerData.push({
        hour: data.hour,
        public_chargers_in_use: publicChargersInUse,
        public_chargers_idle: publicChargersIdle,
        public_util_rate: publicUtilRate,
        public_dropped_arrivals: publicDroppedArrivals,
        public_drop_rate: publicDropRate,
        subscription_chargers_in_use: subChargersInUse,
        subscription_chargers_idle: subChargersIdle,
        subscription_util_rate: subUtilRate,
        subscription_dropped_arrivals: subDroppedArrivals,
        subscription_drop_rate: subDropRate,
        chargers_in_use: chargersInUse,
        chargers_idle: chargersIdle,
        chargers_util_rate: chargersUtilRate,
        dropped_arrivals: droppedArrivals,
        drop_rate: dropRate,
      });

      return chargerData;
    },
    []
  );

  const publicChargersAssignmentData =
    getChargersAssignmentData(publicSchedules);
  const subChargersAssignmentData = getChargersAssignmentData(subSchedules);

  return {
    publicChargersAssignmentData,
    subChargersAssignmentData,
    chargerHourlyData,
  };
};

const getChargersAssignmentData = (
  schedulesData: number[][]
): ChargerAssignmentData => {
  const chargerSchedules = schedulesData.reduce(
    (assignData: ChargerSchedule[], schedule: number[]) => {
      const utilRate =
        schedule.reduce(
          (sum: number, hourInUse: number) => (sum += hourInUse)
        ) / schedule.length;

      assignData.push({
        schedule,
        util_rate: utilRate,
      });

      return assignData;
    },
    []
  );

  const avgUtilRate =
    chargerSchedules.reduce(
      (sumUtilRate: number, schedule: ChargerSchedule) =>
        (sumUtilRate += schedule.util_rate),
      0
    ) / schedulesData.length;

  return {
    schedules: chargerSchedules,
    avg_util_rate: avgUtilRate,
  };
};

const initSchedulesData = (numChargers: number): number[][] => {
  const DAY_HOURS = 24;
  const schedulesData: number[][] = [];
  for (let i = 0; i < numChargers; i++) {
    schedulesData.push(Array.from({ length: DAY_HOURS }, () => 0));
  }
  return schedulesData;
};
