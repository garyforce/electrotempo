import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  FormControl,
  DialogProps,
  Snackbar,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
  IconButton,
  Input,
  CircularProgress,
  Icon,
  Switch,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { Check, Close, Delete, Edit } from "@mui/icons-material";

import {
  postTerminalScenario,
  useCreateScenarioData,
} from "api/terminal/scenarios";
import { Terminal, TerminalScenario } from "types/terminal";
import { useVehicles } from "api/terminal/vehicles";
import {
  ChargerData,
  FleetMixVehicle,
  VehicleData,
} from "types/terminal-scenario";
import { NewTerminalVehicleType } from "types/vehicle-types";
import { useAuth0 } from "@auth0/auth0-react";

export type BasicDialogProps = {
  DialogProps: DialogProps;
  selectedTerminal: {
    id: number;
    name: string;
  };
  selectedFacility: {
    id: number;
    name: string;
  };
  terminals?: Terminal[];
  refetchData: () => void;
};

const VEHICLE_REPLACEMENT_LIFECYCLE_YEARS = 12;
const BATTERY_REPLACEMENT_LIFECYCLE_YEARS = 6;

const tableColumns = {
  "2": [
    "Make",
    "Model",
    "Battery Size (KWH)",
    "Battery Charge Rate",
    "Price ($)",
    "Buy America Compliant?",
    "Action",
  ],
  "3": [
    "Make - Model​",
    "Charge Rate (KW)​",
    "Voltage (V)​",
    "Price ($)​",
    "Action",
  ],
  "4": [
    "Utility rate​",
    "Generation Charge ​",
    "Transmission Charge​",
    "Distribution Charge​",
  ],
  "4.2": [
    "PPA rate​",
    "Generation Charge",
    "Transmission Charge​",
    "Distribution Charge​",
  ],
};

export default function AddScenarioDialog({
  DialogProps,
  selectedTerminal,
  selectedFacility,
  terminals,
  refetchData,
}: BasicDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [submitButtonTooltip, setSubmitButtonTooltip] = useState("");
  const [snackbarType, setSnackBarType] = useState<
    "success" | "info" | "error" | "warning"
  >("success");

  const [configuration, setConfiguration] = useState("new");
  const [scenarioId, setScenarioId] = useState("");
  const [configurationName, setConfigurationName] = useState("");
  const [fetchVehicleTypes, setFetchVehicleTypes] = useState(true);
  const [prevScenarios, setPrevScenarios] = useState<TerminalScenario[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState(0);
  const [table1Data, setTable1Data] = useState<any[][]>();
  const [table2Data, setTable2Data] = useState<any[][]>();
  const [newRowData, setNewRowData] = useState<any[]>(Array(6).fill(undefined));
  const [editPrice, setEditPrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [deleteTableEntry, setDeleteTableEntry] = useState<number | null>(null);
  const [newTerminalScenario, setNewTerminalScenario] = useState<any>(null);
  const [vehicleTypes, setVehicleTypes] = useState<
    NewTerminalVehicleType[] | undefined
  >([]);
  const [buyAmerica, setBuyAmerica] = useState<boolean | null>(null);

  const [hourData, setHourData] = useState<number[]>(
    Array.from({ length: 24 }, () => 1)
  );

  const [vehicleInfo, setVehicleInfo] = useState<FleetMixVehicle>({
    id: undefined,
    iceReferenceVehicle: "None",
  });

  const {
    createScenarioData,
    loadingCreateScenarioData,
    errorLoadingCreateScenarioData,
    refetch,
  } = useCreateScenarioData(
    selectedTerminal.id,
    selectedFacility.id,
    scenarioId !== "" ? Number(scenarioId) : undefined
  );

  const { vehicles } = useVehicles(selectedVehicleTypeId);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const selectedTerminalObject = terminals?.find(
      (terminal) => terminal.id === selectedTerminal.id
    );

    if (selectedTerminalObject) {
      const selectedFacilityObject =
        selectedTerminalObject.terminalFacilities.find(
          (facility) => facility.id === selectedFacility.id
        );

      if (selectedFacilityObject) {
        setPrevScenarios(selectedFacilityObject.terminalScenarios);
      }
    }
  }, [terminals, selectedTerminal, selectedFacility]);

  useEffect(() => {
    if (selectedVehicleTypeId > 0) {
      setFetchVehicleTypes(false);
    }
    const newData = createScenarioData?.newTerminalScenarioData;
    const chartData = newData?.shiftSchedule.length
      ? newData?.shiftSchedule
      : Array.from({ length: 24 }, () => 1);

    setConfigurationName(newData?.scenarioName ?? "");
    setNewTerminalScenario(newData);
    setVehicleTypes(createScenarioData?.vehicleTypes);
    setHourData(chartData);

    setSelectedVehicleTypeId(newData?.fleetMix.vehicleTypeId ?? 0);

    setVehicleInfo({
      ...vehicleInfo,
      id: newData?.fleetMix.vehicleTypeId ?? undefined,
    });

    setNewTerminalScenario((prevData: any) => ({
      ...prevData,
      shiftSchedule: chartData,
      chargerMaintenanceCostPct:
        (newData?.chargerMaintenanceCostPct ?? 0) * 100,
      fleetMix: {
        ...prevData?.fleetMix,
        iceVehicleDowntime: (newData?.fleetMix?.iceVehicleDowntime ?? 0) * 100,
        evExpectedDowntime: (newData?.fleetMix?.evExpectedDowntime ?? 0) * 100,
        vehicleMaintenanceCostPct:
          (newData?.fleetMix?.vehicleMaintenanceCostPct ?? 0) * 100,
      },
    }));

    const { evOptions, chargers, utilityRates, ppaRates } =
      handleTableData(newData);
    setTable1Data([evOptions, chargers, utilityRates]);
    setTable2Data(ppaRates);
  }, [scenarioId, createScenarioData]);

  useEffect(() => {
    if (fetchVehicleTypes && vehicles.length) {
      const iceVehicle = vehicles.find((vehicle) => !vehicle.isEV);

      setVehicleInfo({
        ...vehicleInfo,
        iceReferenceVehicle: iceVehicle?.name ?? "None",
      });

      const evVehicles = vehicles.filter((vehicle) => vehicle.isEV);
      const evVehiclesTableData = evVehicles.map((vehicle) => [
        vehicle.id,
        vehicle.make,
        vehicle.model,
        vehicle.batteryCapacityKwh,
        vehicle.batteryMaxChargeRateKw,
        vehicle.priceUsd,
        vehicle.buyAmericaCompliance,
      ]);

      const remainingData = table1Data?.slice(1) || [];
      setTable1Data([evVehiclesTableData, ...remainingData]);
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          iceVehicleId: iceVehicle?.id,
          evOptions: evVehicles.map(
            ({ isEV, organizationId, ...rest }) => rest
          ),
        },
      }));
    }
    setFetchVehicleTypes(true);
  }, [vehicles]);

  const handleTableData = (newData: any) => {
    const evOptions = newData?.fleetMix.evOptions.map(
      (vehicle: {
        id: number | null;
        make: string;
        model: string;
        batteryCapacityKwh: number;
        batteryMaxChargeRateKw: number;
        priceUsd: number;
        buyAmericaCompliance?: boolean;
      }) => [
        vehicle.id,
        vehicle.make,
        vehicle.model,
        vehicle.batteryCapacityKwh,
        vehicle.batteryMaxChargeRateKw,
        vehicle.priceUsd,
        vehicle.buyAmericaCompliance,
      ]
    );

    const chargers = newData?.chargerOptions.map(
      (option: {
        id: number;
        make: string;
        model: string;
        chargeRateKw: number;
        voltage: number;
        priceUsd: number;
      }) => [
        option.id,
        `${option.make} - ${option.model}`,
        option.chargeRateKw,
        option.voltage,
        option.priceUsd,
      ]
    );

    const updatedRates = newData?.utilityRateStructure;
    const utilityRates = [
      [
        `${updatedRates?.name} - energy`,
        updatedRates?.generationChargePricePerKwh,
        updatedRates?.transmissionChargePricePerKwh,
        updatedRates?.distributionChargePricePerKwh,
      ],
      [
        `${updatedRates?.name} - demand`,
        updatedRates?.generationDemandChargePricePerKw,
        updatedRates?.transmissionDemandChargePricePerKw,
        updatedRates?.distributionDemandChargePricePerKw,
      ],
    ];

    const ppaRates = [
      [
        `${updatedRates?.name} - energy`,
        updatedRates?.ppaGenerationChargePricePerKwh,
        updatedRates?.ppaTransmissionChargePricePerKwh,
        updatedRates?.ppaDistributionChargePricePerKwh,
      ],
      [
        `${updatedRates?.name} - demand`,
        updatedRates?.ppaGenerationDemandChargePricePerKw,
        updatedRates?.ppaTransmissionDemandChargePricePerKw,
        updatedRates?.ppaDistributionDemandChargePricePerKw,
      ],
    ];

    return { evOptions, chargers, utilityRates, ppaRates };
  };

  const handleVehicleTypeChange = (vehicleTypeId: number) => {
    setSelectedVehicleTypeId(vehicleTypeId);
    setVehicleInfo({
      ...vehicleInfo,
      id: vehicleTypeId,
    });
    const iceReferenceFuelConsumption = vehicleTypes?.filter(
      (vehicleType: { id: number }) => vehicleType.id === vehicleTypeId
    )[0].iceReferenceFuelConsumption;
    setNewTerminalScenario((prevData: any) => ({
      ...prevData,
      fleetMix: {
        ...prevData.fleetMix,
        iceVehicleFuelConsumption: Number(iceReferenceFuelConsumption),
        vehicleTypeId,
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);

    const modifiedTerminalScenario = {
      ...newTerminalScenario,
      chargerMaintenanceCostPct:
        newTerminalScenario?.chargerMaintenanceCostPct / 100,
      fleetMix: newTerminalScenario?.fleetMix
        ? {
            ...newTerminalScenario.fleetMix,
            iceVehicleDowntime:
              newTerminalScenario.fleetMix.iceVehicleDowntime / 100,
            evExpectedDowntime:
              newTerminalScenario.fleetMix.evExpectedDowntime / 100,
            vehicleMaintenanceCostPct:
              newTerminalScenario.fleetMix.vehicleMaintenanceCostPct / 100,
          }
        : undefined,
    };

    const apiToken = await getAccessTokenSilently();

    postTerminalScenario(
      selectedTerminal.id,
      selectedFacility.id,
      apiToken,
      modifiedTerminalScenario
    )
      .then(() => {
        setShowSnackbar(true);
        setSnackbarMessage(
          "Configuration created successfully! Running optimization..."
        );
        setSnackBarType("success");
        setSubmitButtonDisabled(true);
        setSubmitButtonTooltip("Configuration already submitted");
        refetchData();
      })
      .catch((error) => {
        setShowSnackbar(true);
        setSnackbarMessage("Error creating configuration");
        setSnackBarType("error");
      });

    setTimeout(() => {
      DialogProps.onClose?.({}, "backdropClick");
    }, 6000);
  };

  const disableSubmitBtn = useMemo(() => {
    let disability = false;
    if (!configurationName) disability = true;
    if (!newTerminalScenario?.planningHorizonYears) disability = true;
    if (!newTerminalScenario?.fleetMix?.vehicleTypeId) disability = true;
    if (!newTerminalScenario?.fleetMix?.fleetSize) disability = true;
    if (!newTerminalScenario?.fleetMix?.vehiclesPerShift) disability = true;
    if (!vehicleInfo.id) disability = true;
    if (submitButtonDisabled) disability = true;
    if (!newTerminalScenario?.fleetMix?.evOptions?.length) disability = true;
    if (!newTerminalScenario?.chargerOptions?.length) disability = true;
    return disability;
  }, [
    configurationName,
    newTerminalScenario?.fleetMix,
    newTerminalScenario?.planningHorizonYears,
    newTerminalScenario?.chargerOptions,
    vehicleInfo,
    submitButtonDisabled,
  ]);

  const handleExistingFleetSizeChange = (e: any) => {
    if (
      newTerminalScenario?.fleetMix.vehiclesPerShift &&
      newTerminalScenario?.fleetMix.vehiclesPerShift >
        Math.max(parseInt(e.target.value), 0)
    ) {
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          fleetSize: Math.max(parseInt(e.target.value), 0),
          vehiclesPerShift: Math.max(parseInt(e.target.value), 0),
        },
      }));
    } else {
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          fleetSize: Math.max(parseInt(e.target.value), 0),
        },
      }));
    }
  };

  const handleVehiclesPerShiftChange = (e: any) => {
    setNewTerminalScenario((prevData: any) => ({
      ...prevData,
      fleetMix: {
        ...prevData.fleetMix,
        vehiclesPerShift: Math.max(
          Math.min(
            parseInt(e.target.value),
            newTerminalScenario?.fleetMix.fleetSize
          ),
          0
        ),
      },
    }));
  };

  const handleHourClick = (index: number): void => {
    const newData = [...hourData];
    newData[index] = (newData[index] + 1) % 3;
    setHourData(newData);
    setNewTerminalScenario((prevData: any) => ({
      ...prevData,
      shiftSchedule: newData,
    }));
  };

  const terminalNameText = useMemo(() => {
    return `Terminal: ${selectedTerminal.name}`;
  }, [selectedTerminal]);
  const facilityNameText = useMemo(() => {
    return `Facility: ${selectedFacility.name}`;
  }, [selectedFacility]);

  const chartData: ChartData<"bar"> = {
    labels: Array.from(
      { length: 24 },
      (_, i) => `${i === 0 ? 12 : i > 12 ? i - 12 : i} ${i < 12 ? "AM" : "PM"}`
    ),
    datasets: [
      {
        label: "Unused",
        data: hourData.map((value) => (value === 0 ? 1 : 0)),
        backgroundColor: "white",
        borderColor: "#000",
        borderWidth: 1,
        stack: "stack",
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: "Shift",
        data: hourData.map((value) => (value === 1 ? 1 : 0)),
        backgroundColor: "#05C2CC",
        borderColor: "#000",
        borderWidth: 1,
        stack: "stack",
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: "Break",
        data: hourData.map((value) => (value === 2 ? 1 : 0)),
        backgroundColor: "#FDBE02",
        borderWidth: 1,
        borderColor: "#000",
        stack: "stack",
        barPercentage: 1,
        categoryPercentage: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    // maintainAspectRatio: false,
    scales: {
      x: {
        type: "category",
        labels: Array.from(
          { length: 24 },
          (_, i) =>
            `${i === 0 ? 12 : i > 12 ? i - 12 : i} ${i < 12 ? "AM" : "PM"}`
        ),
        grid: {
          color: "#000",
        },
      },
      y: {
        display: false,
      },
    },
    animation: {
      duration: 0,
    },
    onHover: (event, chartElement) => {
      const target = event.native?.target as HTMLElement;
      target.style.cursor = chartElement[0] ? "pointer" : "default";
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index as number;
        handleHourClick(index);
      }
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
  };

  const handleChangeVehicleReplacementLifecycle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!newTerminalScenario?.fleetMix.batteryReplacementLifecycleYears)
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          vehicleReplacementLifecycleYears: getCorrectInt(
            e.target.value,
            BATTERY_REPLACEMENT_LIFECYCLE_YEARS + 1,
            24
          ),
        },
      }));
    else {
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          vehicleReplacementLifecycleYears: getCorrectInt(
            e.target.value,
            2,
            24
          ),
        },
      }));
    }
    if (
      newTerminalScenario?.fleetMix.batteryReplacementLifecycleYears &&
      e.target.value !== "" &&
      parseInt(e.target.value) <=
        newTerminalScenario?.fleetMix.batteryReplacementLifecycleYears
    ) {
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          batteryReplacementLifecycleYears:
            (getCorrectInt(e.target.value, 2, 24) || 2) - 1,
        },
      }));
    }
  };

  const handleChangeBatteryReplacementLifecycle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!newTerminalScenario?.fleetMix.vehicleReplacementLifecycleYears) {
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          batteryReplacementLifecycleYears: getCorrectInt(
            e.target.value,
            1,
            VEHICLE_REPLACEMENT_LIFECYCLE_YEARS - 1
          ),
        },
      }));
    } else {
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          batteryReplacementLifecycleYears: getCorrectInt(
            e.target.value,
            1,
            23
          ),
        },
      }));
    }
    if (
      newTerminalScenario?.fleetMix.vehicleReplacementLifecycleYears &&
      e.target.value !== "" &&
      parseInt(e.target.value) >=
        newTerminalScenario?.fleetMix.vehicleReplacementLifecycleYears
    ) {
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          vehicleReplacementLifecycleYears:
            (getCorrectInt(e.target.value, 1, 23) || 0) + 1,
        },
      }));
    }
  };
  const getCorrectInt = (value: string, min: number, max: number) => {
    if (value === "") {
      return undefined;
    }
    return Math.max(Math.min(parseInt(value), max), min);
  };
  const getCorrectFloat = (value: string, min: number, max: number) => {
    if (value === "") {
      return undefined;
    }
    return Math.max(Math.min(parseFloat(value), max), min);
  };

  const handleChangeConfiguration = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfiguration(event.target.value);
  };

  const handleInputChange = (
    value: string,
    rowIndex: number,
    columnIndex: number,
    setFunction: any,
    tableIdentifier: "table1" | "table2"
  ) => {
    setFunction((prevData: any) => {
      let newData = [...prevData];

      if (tableIdentifier === "table1") {
        newData[2][rowIndex] = [...newData[2][rowIndex]];
        newData[2][rowIndex][columnIndex] = value;
      } else {
        newData[rowIndex] = [...newData[rowIndex]];
        newData[rowIndex][columnIndex] = value;
      }
      return newData;
    });
  };

  const handleSaveTable = () => {
    const utilityRatesRow1 = table1Data?.[2]?.[0];
    const utilityRatesRow2 = table1Data?.[2]?.[1];
    const ppaRatesRow1 = table2Data?.[0];
    const ppaRatesRow2 = table2Data?.[1];

    const utilityRateStructure = {
      generationChargePricePerKwh: Number(utilityRatesRow1?.[1]) || 0,
      transmissionChargePricePerKwh: Number(utilityRatesRow1?.[2]) || 0,
      distributionChargePricePerKwh: Number(utilityRatesRow1?.[3]) || 0,
      generationDemandChargePricePerKw: Number(utilityRatesRow2?.[1]) || 0,
      transmissionDemandChargePricePerKw: Number(utilityRatesRow2?.[2]) || 0,
      distributionDemandChargePricePerKw: Number(utilityRatesRow2?.[3]) || 0,
      ppaGenerationChargePricePerKwh: Number(ppaRatesRow1?.[1]) || 0,
      ppaTransmissionChargePricePerKwh: Number(ppaRatesRow1?.[2]) || 0,
      ppaDistributionChargePricePerKwh: Number(ppaRatesRow1?.[3]) || 0,
      ppaGenerationDemandChargePricePerKw: Number(ppaRatesRow2?.[1]) || 0,
      ppaTransmissionDemandChargePricePerKw: Number(ppaRatesRow2?.[2]) || 0,
      ppaDistributionDemandChargePricePerKw: Number(ppaRatesRow2?.[3]) || 0,
    };

    setNewTerminalScenario({
      ...newTerminalScenario,
      utilityRateStructure: utilityRateStructure,
    });
    setEditMode(false);
  };

  const handleDeleteTableEntry = (index: number) => {
    const targetData = table1Data?.[step - 2];
    const entryToDelete = targetData?.[index];

    const updatedData = (targetData ?? []).filter((_, i) => i !== index);
    const newData = (table1Data ?? []).map((arr, i) =>
      i === step - 2 ? updatedData : arr
    );

    if (step === 2) {
      const updatedEVs = newTerminalScenario?.fleetMix?.evOptions.filter(
        (option: any) => {
          if (option.id !== undefined) {
            return option.id !== entryToDelete[0];
          } else {
            return !(
              option.make === entryToDelete[1] &&
              option.model === entryToDelete[2]
            );
          }
        }
      );

      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          evOptions: updatedEVs,
        },
      }));
    }

    if (step === 3) {
      const updatedChargers = newTerminalScenario?.chargerOptions.filter(
        (option: any) => {
          if (option.id !== undefined) {
            return option.id !== entryToDelete[0];
          } else {
            return !(`${option.make} - ${option.model}` === entryToDelete[1]);
          }
        }
      );

      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        chargerOptions: updatedChargers,
      }));
    }

    setTable1Data(newData);
    setDeleteTableEntry(null);
  };

  const handleSaveNewEntry = () => {
    setEditMode(false);

    let updatedData = [...(table1Data ?? [])];

    if (step === 3) {
      const makeModelCombined = `${newRowData[0]} - ${newRowData[1]}`;
      const adjustedNewRowData = [
        undefined,
        makeModelCombined,
        ...newRowData.slice(2),
      ];
      updatedData[step - 2].unshift(adjustedNewRowData);
    } else {
      newRowData.unshift(undefined);
      updatedData[step - 2].unshift(newRowData);
    }
    setTable1Data(updatedData);
    setNewRowData(Array(step === 3 ? 5 : 4).fill(undefined));

    if (step === 2) {
      const updatedEntry: VehicleData = {
        id: newRowData[0],
        make: newRowData[1],
        model: newRowData[2],
        batteryCapacityKwh: Number(newRowData[3]),
        batteryMaxChargeRateKw: Number(newRowData[4]),
        priceUsd: Number(newRowData[5]),
        vehicleTypeId: selectedVehicleTypeId,
        buyAmericaCompliance: newRowData[6],
        isEV: true,
      };

      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          evOptions: [...prevData.fleetMix.evOptions, updatedEntry],
        },
      }));
    }

    if (step === 3) {
      const updatedEntry: ChargerData = {
        id: undefined,
        make: newRowData[0],
        model: newRowData[1],
        chargeRateKw: Number(newRowData[2]),
        voltage: Number(newRowData[3]),
        priceUsd: Number(newRowData[4]),
        amperage: newRowData[5],
      };
      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        chargerOptions: [...prevData.chargerOptions, updatedEntry],
      }));
    }
  };

  const handleInputChangeForRowData = (
    e: { target: { value: any; checked?: any } },
    columnIndex: number
  ) => {
    let updatedNewRowData = [...newRowData];

    updatedNewRowData[columnIndex] = e.target.value;
    if (columnIndex === 5) {
      updatedNewRowData[columnIndex] = e.target.checked;
    }

    if (step === 2 && columnIndex === 2) {
      const quarterValue = Number(e.target.value) / 4;
      updatedNewRowData[3] =
        !isNaN(quarterValue) && isFinite(quarterValue) ? quarterValue : "";
    }
    setNewRowData(updatedNewRowData);
  };

  const handleEditPrice = (index: number) => {
    const updatedTableData = [...(table1Data?.[step - 2] ?? [])];
    const entryToUpdate = [...updatedTableData[index]];
    entryToUpdate[step === 2 ? 5 : 4] = newPrice;
    if (step === 2) {
      entryToUpdate[6] = buyAmerica;
    }
    updatedTableData[index] = entryToUpdate;
    setTable1Data((prevState) => {
      const newState = [...(prevState ?? [])];
      newState[step - 2] = updatedTableData;
      return newState;
    });

    if (step === 2) {
      const updatedEvOptions = newTerminalScenario?.fleetMix?.evOptions.map(
        (option: any) => {
          if (option.id === entryToUpdate[0]) {
            return {
              ...option,
              priceUsd: newPrice,
              buyAmericaCompliance: buyAmerica,
            };
          }
          return option;
        }
      );

      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        fleetMix: {
          ...prevData.fleetMix,
          evOptions: updatedEvOptions,
        },
      }));
    }

    if (step === 3) {
      const updatedChargers = newTerminalScenario?.chargerOptions.map(
        (charger: any) => {
          if (charger.id === entryToUpdate[0]) {
            return { ...charger, id: undefined, priceUsd: newPrice };
          }
          return charger;
        }
      );

      setNewTerminalScenario((prevData: any) => ({
        ...prevData,
        chargerOptions: updatedChargers,
      }));
    }

    setNewPrice(null);
    setEditPrice(null);
  };

  const handleCancelNewEntry = () => {
    setEditMode(false);
    setNewRowData(Array(step === 2 ? 6 : 5).fill(undefined));
  };

  const handleNext = () => {
    if (step < 4) {
      setEditMode(false);
      setDeleteTableEntry(null);
      setEditPrice(null);
      setNewRowData(Array(step === 1 ? 6 : 5).fill(undefined));
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setEditMode(false);
      setDeleteTableEntry(null);
      setEditPrice(null);
      setNewRowData(Array(step === 3 ? 6 : 5).fill(undefined));
      setStep((prevStep) => prevStep - 1);
    }
  };

  return (
    <>
      <Dialog
        {...DialogProps}
        maxWidth="md"
        fullWidth
        className="add-new-configuration-dialog"
      >
        {loadingCreateScenarioData ? (
          <div
            style={{ display: "grid", placeItems: "center", minHeight: 600 }}
          >
            <CircularProgress size={100} />
          </div>
        ) : errorLoadingCreateScenarioData ? (
          <Stack
            sx={{
              justifyContent: "center",
              alignItems: "center",
              minHeight: 600,
              color: "red",
            }}
            spacing={2}
          >
            <h3>An error occurred, please try again.</h3>
            <Button onClick={refetch} variant="contained" color="primary">
              Reload
            </Button>
          </Stack>
        ) : (
          <>
            <DialogTitle>
              <Stack
                mt={1}
                direction="row"
                justifyContent={"space-between"}
                spacing={4}
              >
                <Typography variant="h3">
                  <b>Create a New Configuration - Step&nbsp;{step}</b>
                </Typography>

                {step === 1 ? (
                  <Typography sx={{ fontSize: "17px" }}>
                    <b>{terminalNameText}</b>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <b>{facilityNameText}</b>
                  </Typography>
                ) : (
                  <Typography variant="h2">{configurationName}</Typography>
                )}
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack>
                <Stack spacing={2}>
                  {step === 1 && (
                    <Stack mt={0.6} direction={"row"} spacing={2}>
                      <TextField
                        required
                        label="Configuration Name"
                        sx={{ width: "36%" }}
                        size="small"
                        value={configurationName}
                        onChange={(e) => {
                          setConfigurationName(e.target.value);
                          setNewTerminalScenario((prevData: any) => ({
                            ...prevData,
                            scenarioName: e.target.value,
                          }));
                        }}
                      />
                      <TextField
                        required
                        label="Planning Horizon (years)"
                        className="planning-horizon"
                        type="number"
                        size="small"
                        sx={{ width: "26%" }}
                        value={Math.max(
                          newTerminalScenario?.planningHorizonYears,
                          0
                        )}
                        onChange={(e) =>
                          setNewTerminalScenario((prevData: any) => ({
                            ...prevData,
                            planningHorizonYears:
                              getCorrectInt(e.target.value, 0, 24) || 0,
                          }))
                        }
                      />
                    </Stack>
                  )}

                  {step === 2 && (
                    <Stack direction="row" spacing={2}>
                      <Typography
                        sx={{ fontSize: "17px", fontWeight: 500, mt: 0.7 }}
                      >
                        <b> ICE Reference Vehicle:&nbsp;&nbsp;</b>
                        {vehicleInfo.iceReferenceVehicle}
                      </Typography>
                    </Stack>
                  )}

                  {step === 1 && (
                    <Stack direction="row">
                      <RadioGroup
                        row
                        value={configuration}
                        onChange={handleChangeConfiguration}
                      >
                        <FormControlLabel
                          value="new"
                          control={<Radio />}
                          label="Create a new configuration"
                        />
                        <FormControlLabel
                          value="copy"
                          control={<Radio />}
                          label="Copy an existing configuration"
                        />
                      </RadioGroup>

                      {configuration === "copy" && (
                        <FormControl
                          variant="outlined"
                          size="small"
                          sx={{
                            width: prevScenarios.length !== 0 ? "26%" : "26%",
                          }}
                        >
                          {prevScenarios.length !== 0 ? (
                            <>
                              <InputLabel>List of configurations</InputLabel>
                              <Select
                                label="List of configurations"
                                value={scenarioId}
                                onChange={(event) =>
                                  setScenarioId(event.target.value)
                                }
                              >
                                <MenuItem value={""}>None</MenuItem>
                                {prevScenarios.map((scenario) => (
                                  <MenuItem
                                    key={scenario.id}
                                    value={scenario.id}
                                  >
                                    {scenario.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </>
                          ) : (
                            <TextField
                              label="List of configurations"
                              value={"No configurations available"}
                              size="small"
                              disabled
                              sx={{ input: { cursor: "not-allowed" } }}
                              InputProps={{ style: { fontSize: "13px" } }}
                              InputLabelProps={{
                                style: { fontSize: "12px" },
                              }}
                            />
                          )}
                        </FormControl>
                      )}
                    </Stack>
                  )}

                  <Stack spacing={1}>
                    {step === 1 && (
                      <Stack
                        spacing={2}
                        width="80%"
                        className="shift-information"
                      >
                        <Typography variant="h3">Shift Information</Typography>
                        <Bar
                          data={chartData}
                          options={chartOptions}
                          height={"90px"}
                        />
                      </Stack>
                    )}
                    <Stack spacing={2} width={step === 1 ? "92%" : "99%"}>
                      {step === 1 && (
                        <>
                          <Typography variant="h3">Work Information</Typography>
                          <Stack
                            spacing={{ md: 1, lg: 2 }}
                            direction="row"
                            width="110%"
                            alignItems="center"
                          >
                            <FormControl
                              sx={{
                                width: "28%",
                                "& .MuiInputBase-input": {
                                  fontSize: "14px",
                                },
                              }}
                            >
                              <InputLabel
                                sx={{ fontSize: "14px" }}
                                id="light-duty-label"
                                size="small"
                                required
                              >
                                Vehicle Type
                              </InputLabel>
                              <Select
                                value={vehicleInfo.id}
                                labelId="light-duty-label"
                                label="Vehicle Type"
                                size="small"
                                onChange={(e) => {
                                  handleVehicleTypeChange(
                                    Number(e.target.value)
                                  );
                                }}
                                required
                              >
                                {createScenarioData &&
                                  vehicleTypes?.map((vehicleType) => (
                                    <MenuItem
                                      value={vehicleType.id}
                                      key={vehicleType.id}
                                    >
                                      {vehicleType.name}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                            <Tooltip title="In Diesel-Gallon Equivalent per hour">
                              <TextField
                                label="ICE Vehicle Fuel Consumption"
                                sx={{
                                  width: "29%",
                                }}
                                size="small"
                                required
                                placeholder="Diesel-Gallons per hour"
                                value={
                                  newTerminalScenario?.fleetMix
                                    ?.iceVehicleFuelConsumption
                                }
                                onChange={(e) =>
                                  setNewTerminalScenario((prevData: any) => ({
                                    ...prevData,
                                    fleetMix: {
                                      ...prevData.fleetMix,
                                      iceVehicleFuelConsumption:
                                        getCorrectFloat(
                                          e.target.value,
                                          0,
                                          Infinity
                                        ),
                                    },
                                  }))
                                }
                                type="number"
                                InputLabelProps={{
                                  shrink: true,
                                  style: { fontSize: "11px" },
                                }}
                              />
                            </Tooltip>
                            <TextField
                              label={"Existing ICE Fleet Size"}
                              type="number"
                              value={newTerminalScenario?.fleetMix?.fleetSize}
                              sx={{ width: "22%" }}
                              size="small"
                              onChange={(e) => handleExistingFleetSizeChange(e)}
                              required
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                            <TextField
                              label={"Number per Shift"}
                              type="number"
                              value={
                                newTerminalScenario?.fleetMix?.vehiclesPerShift
                              }
                              sx={{ width: "19%" }}
                              size="small"
                              onChange={(e) => handleVehiclesPerShiftChange(e)}
                              required
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                            <TextField
                              label="ICE Reference Vehicle"
                              value={vehicleInfo.iceReferenceVehicle}
                              sx={{
                                width: { md: "34%", lg: "30%" },
                              }}
                              size="small"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                            <div style={{ width: "20%" }} />
                          </Stack>
                        </>
                      )}

                      {step !== 1 && (
                        <Typography variant="h3">
                          {step === 2
                            ? "Vehicle Information – EV Options"
                            : step === 3
                            ? "Charger Information – Options"
                            : "Utility Information – Options"}
                        </Typography>
                      )}

                      {step !== 1 && (
                        <>
                          <TableContainer
                            component={Paper}
                            sx={{
                              maxHeight: step === 4 ? 230 : 276,
                              minHeight: step === 4 ? 165 : 240,
                              overflowY: "auto",
                            }}
                          >
                            <Table
                              sx={{
                                minWidth: 650,
                              }}
                            >
                              <TableHead
                                sx={{
                                  background: "#222222",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                }}
                              >
                                <TableRow sx={{ color: "#fff" }}>
                                  {tableColumns[
                                    step.toString() as string as keyof typeof tableColumns
                                  ]?.map((column, index) => (
                                    <TableCell
                                      key={index}
                                      sx={{ color: "#fff" }}
                                      align={
                                        column === "Action" ? "center" : "left"
                                      }
                                    >
                                      {column}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {step !== 4 && editMode && (
                                  <TableRow>
                                    {[...Array(step === 2 ? 6 : 5)].map(
                                      (_, columnIndex) =>
                                        columnIndex === 1 &&
                                        step === 3 ? null : (
                                          <TableCell key={columnIndex}>
                                            {step === 3 && columnIndex === 0 ? (
                                              <Stack
                                                direction="row"
                                                spacing={3}
                                              >
                                                <Input
                                                  value={
                                                    newRowData[columnIndex] ||
                                                    ""
                                                  }
                                                  placeholder="Make"
                                                  type="string"
                                                  onChange={(e) =>
                                                    handleInputChangeForRowData(
                                                      e,
                                                      columnIndex
                                                    )
                                                  }
                                                />
                                                <Input
                                                  value={
                                                    newRowData[
                                                      columnIndex + 1
                                                    ] || ""
                                                  }
                                                  placeholder="Model"
                                                  type="string"
                                                  onChange={(e) =>
                                                    handleInputChangeForRowData(
                                                      e,
                                                      columnIndex + 1
                                                    )
                                                  }
                                                />
                                              </Stack>
                                            ) : step === 2 &&
                                              columnIndex === 5 ? (
                                              <Switch
                                                onChange={(e) =>
                                                  handleInputChangeForRowData(
                                                    e,
                                                    columnIndex
                                                  )
                                                }
                                              />
                                            ) : (
                                              <Input
                                                value={
                                                  newRowData[columnIndex] || ""
                                                }
                                                placeholder={
                                                  tableColumns[
                                                    step.toString() as keyof typeof tableColumns
                                                  ][
                                                    columnIndex -
                                                      (step === 3 &&
                                                      columnIndex > 1
                                                        ? 1
                                                        : 0)
                                                  ]
                                                }
                                                type={
                                                  columnIndex === 0 ||
                                                  (step === 2 &&
                                                    columnIndex === 1)
                                                    ? "string"
                                                    : "number"
                                                }
                                                onChange={(e) =>
                                                  handleInputChangeForRowData(
                                                    e,
                                                    columnIndex
                                                  )
                                                }
                                              />
                                            )}
                                          </TableCell>
                                        )
                                    )}
                                  </TableRow>
                                )}

                                {table1Data &&
                                  table1Data[step - 2]?.map((column, index) => (
                                    <TableRow key={index}>
                                      {column?.map(
                                        (value: any, columnIndex: number) =>
                                          (step === 4 ||
                                            (step !== 4 &&
                                              columnIndex !== 0)) && (
                                            <TableCell
                                              key={columnIndex}
                                              align="left"
                                            >
                                              {step === 4 &&
                                              editMode &&
                                              columnIndex !== 0 ? (
                                                <Input
                                                  value={value}
                                                  type="number"
                                                  onChange={(e) =>
                                                    handleInputChange(
                                                      e.target.value,
                                                      index,
                                                      columnIndex,
                                                      setTable1Data,
                                                      "table1"
                                                    )
                                                  }
                                                />
                                              ) : step === 4 &&
                                                columnIndex !== 0 ? (
                                                index === 1 ? (
                                                  `${value}($/KW)`
                                                ) : (
                                                  `${value}($/KWH)`
                                                )
                                              ) : ((step === 2 &&
                                                  columnIndex === 5) ||
                                                  (step === 3 &&
                                                    columnIndex === 4)) &&
                                                editPrice === index ? (
                                                <Input
                                                  value={newPrice}
                                                  type="number"
                                                  onChange={(e) =>
                                                    setNewPrice(
                                                      Number(e.target.value)
                                                    )
                                                  }
                                                />
                                              ) : step === 2 &&
                                                columnIndex === 6 ? (
                                                editPrice === index ? (
                                                  <Switch
                                                    defaultChecked={value}
                                                    onChange={(e) =>
                                                      setBuyAmerica(
                                                        e.target.checked
                                                      )
                                                    }
                                                  />
                                                ) : value === true ? (
                                                  <Icon color="success">
                                                    <Check />
                                                  </Icon>
                                                ) : (
                                                  <Icon color="error">
                                                    <Close />
                                                  </Icon>
                                                )
                                              ) : isNaN(+value) ? (
                                                value
                                              ) : (
                                                (+value).toLocaleString()
                                              )}
                                            </TableCell>
                                          )
                                      )}
                                      {step !== 4 && (
                                        <TableCell
                                          align="center"
                                          sx={{ minWidth: "80px" }}
                                        >
                                          {deleteTableEntry === index ||
                                          editPrice === index ? (
                                            <>
                                              <Tooltip
                                                placement="top"
                                                title={
                                                  editPrice === index
                                                    ? "Save"
                                                    : "Confirm deletion"
                                                }
                                              >
                                                <IconButton
                                                  color="primary"
                                                  onClick={() => {
                                                    if (editPrice === index) {
                                                      handleEditPrice(index);
                                                    } else {
                                                      handleDeleteTableEntry(
                                                        index
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <Check
                                                    sx={{ fontSize: "15px" }}
                                                  />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip
                                                placement="top"
                                                title="cancel"
                                              >
                                                <IconButton
                                                  color="error"
                                                  onClick={() => {
                                                    setEditPrice(null);
                                                    setNewPrice(null);
                                                    setDeleteTableEntry(null);
                                                  }}
                                                >
                                                  <Close
                                                    sx={{ fontSize: "15px" }}
                                                  />
                                                </IconButton>
                                              </Tooltip>
                                            </>
                                          ) : (
                                            <>
                                              <Tooltip
                                                title="Edit"
                                                placement="top"
                                              >
                                                <IconButton
                                                  sx={{ color: "grey" }}
                                                  onClick={() => {
                                                    setEditPrice(index);
                                                    setNewPrice(
                                                      step === 2
                                                        ? column[5]
                                                        : column[4]
                                                    );
                                                  }}
                                                >
                                                  <Edit />
                                                </IconButton>
                                              </Tooltip>
                                              <IconButton
                                                color="error"
                                                onClick={() =>
                                                  setDeleteTableEntry(index)
                                                }
                                              >
                                                <Delete />
                                              </IconButton>
                                            </>
                                          )}
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          {step !== 4 && (
                            <Stack direction="row" spacing={1}>
                              {editMode && (
                                <Button
                                  variant="contained"
                                  sx={{
                                    width: "10%",
                                    background: "#d3494e",
                                    "&:hover": {
                                      background: "#96212c",
                                    },
                                  }}
                                  onClick={handleCancelNewEntry}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                variant="contained"
                                sx={{
                                  width: editMode ? "10%" : "20%",
                                  background: editMode ? "#1DC487" : "06c2cc",
                                  "&:hover": {
                                    background: editMode ? "#1d8e65" : "0aa0a8",
                                  },
                                }}
                                disabled={
                                  (editMode &&
                                    newRowData.some(
                                      (value) => value === undefined
                                    )) ||
                                  (step === 2 &&
                                    newTerminalScenario?.fleetMix?.evOptions
                                      ?.length === 6) ||
                                  (step === 3 &&
                                    newTerminalScenario?.chargerOptions
                                      ?.length === 6)
                                }
                                onClick={() => {
                                  setEditMode(!editMode);

                                  if (editMode) {
                                    handleSaveNewEntry();
                                  }
                                }}
                              >
                                {!editMode
                                  ? step === 2
                                    ? "Add vehicle"
                                    : "Add Charger"
                                  : "Save"}
                              </Button>
                            </Stack>
                          )}
                        </>
                      )}

                      {step === 4 && (
                        <TableContainer
                          component={Paper}
                          sx={{
                            maxHeight: 230,
                            overflowY: "auto",
                          }}
                        >
                          <Table sx={{ minWidth: 650 }}>
                            <TableHead
                              sx={{
                                background: "#222222",
                                position: "sticky",
                                top: 0,
                                zIndex: 1,
                              }}
                            >
                              <TableRow sx={{ color: "#fff" }}>
                                {tableColumns[
                                  "4.2" as string as keyof typeof tableColumns
                                ]?.map((column, index) => (
                                  <TableCell key={index} sx={{ color: "#fff" }}>
                                    {column}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {table2Data?.map((column, index) => (
                                <TableRow key={index}>
                                  {column?.map(
                                    (value: any, columnIndex: number) => (
                                      <TableCell key={columnIndex} align="left">
                                        {editMode && columnIndex !== 0 ? (
                                          <Input
                                            value={value}
                                            type="number"
                                            onChange={(e) =>
                                              handleInputChange(
                                                e.target.value,
                                                index,
                                                columnIndex,
                                                setTable2Data,
                                                "table2"
                                              )
                                            }
                                          />
                                        ) : columnIndex !== 0 ? (
                                          index === 1 ? (
                                            `${value}($/KW)`
                                          ) : (
                                            `${value}($/KWH)`
                                          )
                                        ) : (
                                          value.toLocaleString()
                                        )}
                                      </TableCell>
                                    )
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {step === 2 && (
                        <Stack direction={"row"} pt={2} spacing={2}>
                          <Tooltip title="Percent of time the vehicle is out for repair or maintenance">
                            <TextField
                              label="ICE Vehicle Downtime (%)​"
                              value={
                                newTerminalScenario?.fleetMix
                                  ?.iceVehicleDowntime
                              }
                              onChange={(e) => {
                                setNewTerminalScenario((prevData: any) => ({
                                  ...prevData,
                                  fleetMix: {
                                    ...prevData.fleetMix,
                                    iceVehicleDowntime: getCorrectInt(
                                      e.target.value ?? "",
                                      0,
                                      99
                                    ),
                                  },
                                }));
                              }}
                              sx={{ width: "20%" }}
                              size="small"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Percent of time the vehicle is out for repair or maintenance">
                            <TextField
                              label="EV Downtime(expected)"
                              value={
                                newTerminalScenario?.fleetMix
                                  ?.evExpectedDowntime
                              }
                              onChange={(e) => {
                                setNewTerminalScenario((prevData: any) => ({
                                  ...prevData,
                                  fleetMix: {
                                    ...prevData.fleetMix,
                                    evExpectedDowntime: getCorrectInt(
                                      e.target.value ?? "",
                                      0,
                                      99
                                    ),
                                  },
                                }));
                              }}
                              sx={{ width: "20%" }}
                              size="small"
                              type="number"
                              required
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                          </Tooltip>

                          <Tooltip title="Replacement cycle for equipment in years">
                            <TextField
                              label="EV Replacement (years)​"
                              value={
                                newTerminalScenario?.fleetMix
                                  ?.vehicleReplacementLifecycleYears
                              }
                              onChange={(e) =>
                                handleChangeVehicleReplacementLifecycle(e)
                              }
                              sx={{ width: "19%" }}
                              size="small"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Replacement cycle for equipment in years">
                            <TextField
                              label="Battery Replacement Lifecycle"
                              value={
                                newTerminalScenario?.fleetMix
                                  ?.batteryReplacementLifecycleYears
                              }
                              onChange={(e) =>
                                setNewTerminalScenario((prevData: any) => ({
                                  ...prevData,
                                  fleetMix: {
                                    ...prevData.fleetMix,
                                    batteryReplacementLifecycleYears:
                                      getCorrectInt(e.target.value, 0, 24),
                                  },
                                }))
                              }
                              onBlur={handleChangeBatteryReplacementLifecycle}
                              sx={{ width: "23%" }}
                              size="small"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Annual maintenance as % of equipment cost">
                            <TextField
                              label="Vehicle Maintenance (%)"
                              value={
                                newTerminalScenario?.fleetMix
                                  ?.vehicleMaintenanceCostPct
                              }
                              onChange={(e) => {
                                setNewTerminalScenario((prevData: any) => ({
                                  ...prevData,
                                  fleetMix: {
                                    ...prevData.fleetMix,
                                    vehicleMaintenanceCostPct: getCorrectInt(
                                      e.target.value ?? "",
                                      0,
                                      Infinity
                                    ),
                                  },
                                }));
                              }}
                              sx={{ width: "20%" }}
                              size="small"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Fuel cost per gallon">
                            <TextField
                              label="ICE Fuel cost*​"
                              value={newTerminalScenario?.iceFuelCostPerGallon}
                              sx={{ width: "12%" }}
                              size="small"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "11px" },
                              }}
                              onChange={(e) => {
                                const intValue = getCorrectInt(
                                  e.target.value ?? "",
                                  0,
                                  Infinity
                                );
                                setNewTerminalScenario((prevData: any) => ({
                                  ...prevData,
                                  iceFuelCostPerGallon: intValue,
                                }));
                              }}
                            />
                          </Tooltip>
                        </Stack>
                      )}

                      {step === 3 && (
                        <Stack direction={"row"} pt={2} spacing={2}>
                          <Tooltip title="Replacement cycle for equipment in years">
                            <TextField
                              label="Charger Replacement Lifecycle"
                              value={
                                newTerminalScenario?.chargerReplacementLifecycleYears
                              }
                              onChange={(e) =>
                                setNewTerminalScenario((prevData: any) => ({
                                  ...prevData,
                                  chargerReplacementLifecycleYears:
                                    getCorrectInt(e.target.value, 0, 24),
                                }))
                              }
                              sx={{ width: "20%" }}
                              size="small"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "12px" },
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Annual maintenance as % of equipment cost">
                            <TextField
                              label="Charger Maintenance (%)"
                              value={
                                newTerminalScenario?.chargerMaintenanceCostPct
                              }
                              onChange={(e) => {
                                setNewTerminalScenario((prevData: any) => ({
                                  ...prevData,
                                  chargerMaintenanceCostPct: getCorrectInt(
                                    e.target.value ?? "",
                                    0,
                                    100
                                  ),
                                }));
                              }}
                              sx={{ width: "20%" }}
                              size="small"
                              type="number"
                              InputLabelProps={{
                                shrink: true,
                                style: { fontSize: "12px" },
                              }}
                            />
                          </Tooltip>
                          <div style={{ width: "20%" }} />
                          <div style={{ width: "20%" }} />
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Stack
                width="100%"
                p={2}
                direction="row"
                justifyContent={"space-between"}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Go Back
                </Button>
                {step === 4 ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ px: 4 }}
                      onClick={
                        !editMode
                          ? () => setEditMode((prev) => !prev)
                          : handleSaveTable
                      }
                    >
                      {editMode ? "Save" : "Edit"}
                    </Button>

                    <Tooltip title={submitButtonTooltip} placement={"left"}>
                      <span>
                        <LoadingButton
                          className="submit-button"
                          variant="contained"
                          onClick={handleSubmit}
                          loading={loading}
                          disabled={disableSubmitBtn}
                        >
                          Finish
                        </LoadingButton>
                      </span>
                    </Tooltip>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    sx={{
                      px: 4,
                      bgcolor: "#097969 ",
                      "&:hover": {
                        bgcolor: "#088F8F ",
                      },
                    }}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity={snackbarType}>{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
}
