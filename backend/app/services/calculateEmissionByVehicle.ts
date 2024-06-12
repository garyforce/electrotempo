interface Emissions {
    nox: number;
    voc: number;
    pm10: number;
    pm25: number;
    sox: number;
    co2: number;
}

interface Coefficients {
    [key: number]: {
        annualMileage: number;
        evFactorNOX: number;
        iceFactorNOX: number;
        evFactorVOC: number;
        iceFactorVOC: number;
        evFactorPM10: number;
        iceFactorPM10: number;
        evFactorPM25: number;
        iceFactorPM25: number;
        evFactorSOX: number;
        iceFactorSOX: number;
        evFactorCO2: number;
        iceFactorCO2: number;
    }
}

export const calculateEmissionByVehicleType = (vehicleType: number, numEVs: number, remainingICE: number, index: number) => {
    const emissions: Emissions = {
        nox: 0,
        voc: 0,
        pm10: 0,
        pm25: 0,
        sox: 0,
        co2: 0,
    };

    const coefficients: Coefficients = {
        1: {
            annualMileage: 10566,
            evFactorNOX: 0.088,
            iceFactorNOX: 0.082,
            evFactorVOC: 0.003,
            iceFactorVOC: 0.23,
            evFactorPM10: 0.011,
            iceFactorPM10: 0.035,
            evFactorPM25: 0.009,
            iceFactorPM25: 0.007,
            evFactorSOX: 0.093,
            iceFactorSOX: 0.002,
            evFactorCO2: 156,
            iceFactorCO2: 329,
        },
        2: {
            annualMileage: 11335,
            evFactorNOX: 0.165,
            iceFactorNOX: 0.093,
            evFactorVOC: 0.005,
            iceFactorVOC: 0.237,
            evFactorPM10: 0.02,
            iceFactorPM10: 0.038,
            evFactorPM25: 0.017,
            iceFactorPM25: 0.009,
            evFactorSOX: 0.175,
            iceFactorSOX: 0.003,
            evFactorCO2: 292,
            iceFactorCO2: 524,
        },
        3: {
            annualMileage: 12285,
            evFactorNOX: 0.34,
            iceFactorNOX: 1.105,
            evFactorVOC: 0.01,
            iceFactorVOC: 0.195,
            evFactorPM10: 0.041,
            iceFactorPM10: 0.124,
            evFactorPM25: 0.034,
            iceFactorPM25: 0.025,
            evFactorSOX: 0.361,
            iceFactorSOX: 0.011,
            evFactorCO2: 604,
            iceFactorCO2: 1583,
        },
        4: {
            annualMileage: 62157,
            evFactorNOX: 0.696,
            iceFactorNOX: 2.349,
            evFactorVOC: 0.02,
            iceFactorVOC: 0.146,
            evFactorPM10: 0.084,
            iceFactorPM10: 0.134,
            evFactorPM25: 0.07,
            iceFactorPM25: 0.022,
            evFactorSOX: 0.738,
            iceFactorSOX: 0.018,
            evFactorCO2: 1236,
            iceFactorCO2: 2575,
        },
    };

    const {
        annualMileage,
        evFactorNOX,
        iceFactorNOX,
        evFactorVOC,
        iceFactorVOC,
        evFactorPM10,
        iceFactorPM10,
        evFactorPM25,
        iceFactorPM25,
        evFactorSOX,
        iceFactorSOX,
        evFactorCO2,
        iceFactorCO2,
    } = coefficients[vehicleType];

    emissions.nox = Number((((evFactorNOX * numEVs * annualMileage) + (iceFactorNOX * remainingICE * annualMileage)) / 1000000).toFixed(2));
    emissions.co2 = Number(((((evFactorCO2 * Math.pow(0.96, index)) * numEVs * annualMileage) + (iceFactorCO2 * remainingICE * annualMileage)) / 1000000).toFixed(2));
    emissions.pm10 = Number((((evFactorPM10 * numEVs * annualMileage) + (iceFactorPM10 * remainingICE * annualMileage)) / 1000000).toFixed(2));
    emissions.pm25 = Number((((evFactorPM25 * numEVs * annualMileage) + (iceFactorPM25 * remainingICE * annualMileage)) / 1000000).toFixed(2));
    emissions.sox = Number((((evFactorSOX * numEVs * annualMileage) + (iceFactorSOX * remainingICE * annualMileage)) / 1000000).toFixed(2));
    emissions.voc = Number((((evFactorVOC * numEVs * annualMileage) + (iceFactorVOC * remainingICE * annualMileage)) / 1000000).toFixed(2));

    return emissions;
};