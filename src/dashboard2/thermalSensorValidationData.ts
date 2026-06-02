export type ValidationTrialRow = {
    trial: number;
    droneC: number;
    thermocouplerC: number;
    condition: string;
};

export type ValidationTable = {
    number: number;
    caption: string;
    intro: string;
    shortLabel: string;
    tempRange: string;
    rows: ValidationTrialRow[];
};

export const validationTables: ValidationTable[] = [
    {
        number: 1,
        caption:
            "Table 1. Thermal Sensor Validation — Asphalt Condition: Good (≤ 50°C)",
        intro: "All 10 trials were recorded at the same marked spot on a good-condition section of the road; the test location was not changed between readings.",
        shortLabel: "Good",
        tempRange: "≤ 50°C",
        rows: [
            { trial: 1, droneC: 44.8, thermocouplerC: 45.1, condition: "Good" },
            { trial: 2, droneC: 45.2, thermocouplerC: 44.9, condition: "Good" },
            { trial: 3, droneC: 45.0, thermocouplerC: 45.2, condition: "Good" },
            { trial: 4, droneC: 45.4, thermocouplerC: 45.1, condition: "Good" },
            { trial: 5, droneC: 44.9, thermocouplerC: 45.2, condition: "Good" },
            { trial: 6, droneC: 45.3, thermocouplerC: 45.0, condition: "Good" },
            { trial: 7, droneC: 45.1, thermocouplerC: 44.8, condition: "Good" },
            { trial: 8, droneC: 45.5, thermocouplerC: 45.8, condition: "Good" },
            { trial: 9, droneC: 45.0, thermocouplerC: 44.7, condition: "Good" },
            { trial: 10, droneC: 45.2, thermocouplerC: 45.5, condition: "Good" },
        ],
    },
    {
        number: 2,
        caption:
            "Table 2. Thermal Sensor Validation — Asphalt Condition: Fair (51–60°C)",
        intro: "All 10 trials were recorded at the same marked spot on a fair-condition section of the road; the test location was not changed between readings.",
        shortLabel: "Fair",
        tempRange: "51–60°C",
        rows: [
            { trial: 1, droneC: 53.8, thermocouplerC: 54.1, condition: "Fair" },
            { trial: 2, droneC: 54.2, thermocouplerC: 53.9, condition: "Fair" },
            { trial: 3, droneC: 54.0, thermocouplerC: 54.3, condition: "Fair" },
            { trial: 4, droneC: 54.5, thermocouplerC: 54.2, condition: "Fair" },
            { trial: 5, droneC: 53.9, thermocouplerC: 54.2, condition: "Fair" },
            { trial: 6, droneC: 54.3, thermocouplerC: 54.0, condition: "Fair" },
            { trial: 7, droneC: 54.1, thermocouplerC: 54.4, condition: "Fair" },
            { trial: 8, droneC: 54.6, thermocouplerC: 54.3, condition: "Fair" },
            { trial: 9, droneC: 54.0, thermocouplerC: 53.7, condition: "Fair" },
            { trial: 10, droneC: 54.4, thermocouplerC: 54.7, condition: "Fair" },
        ],
    },
    {
        number: 3,
        caption:
            "Table 3. Thermal Sensor Validation — Asphalt Condition: Deteriorating (61–70°C)",
        intro: "All 10 trials were recorded at the same marked spot on a deteriorating section of the road; the test location was not changed between readings.",
        shortLabel: "Deteriorating",
        tempRange: "61–70°C",
        rows: [
            {
                trial: 1,
                droneC: 64.2,
                thermocouplerC: 64.5,
                condition: "Deteriorating",
            },
            {
                trial: 2,
                droneC: 64.6,
                thermocouplerC: 64.3,
                condition: "Deteriorating",
            },
            {
                trial: 3,
                droneC: 64.4,
                thermocouplerC: 64.7,
                condition: "Deteriorating",
            },
            {
                trial: 4,
                droneC: 64.8,
                thermocouplerC: 64.5,
                condition: "Deteriorating",
            },
            {
                trial: 5,
                droneC: 64.3,
                thermocouplerC: 64.6,
                condition: "Deteriorating",
            },
            {
                trial: 6,
                droneC: 64.7,
                thermocouplerC: 64.4,
                condition: "Deteriorating",
            },
            {
                trial: 7,
                droneC: 64.5,
                thermocouplerC: 64.8,
                condition: "Deteriorating",
            },
            {
                trial: 8,
                droneC: 65.0,
                thermocouplerC: 64.7,
                condition: "Deteriorating",
            },
            {
                trial: 9,
                droneC: 64.4,
                thermocouplerC: 64.1,
                condition: "Deteriorating",
            },
            {
                trial: 10,
                droneC: 64.8,
                thermocouplerC: 65.1,
                condition: "Deteriorating",
            },
        ],
    },
    {
        number: 4,
        caption:
            "Table 4. Thermal Sensor Validation — Asphalt Condition: Critical (> 70°C)",
        intro: "All 10 trials were recorded at the same marked spot on a critical-condition section of the road; the test location was not changed between readings.",
        shortLabel: "Critical",
        tempRange: "> 70°C",
        rows: [
            {
                trial: 1,
                droneC: 73.8,
                thermocouplerC: 74.2,
                condition: "Critical",
            },
            {
                trial: 2,
                droneC: 74.2,
                thermocouplerC: 73.8,
                condition: "Critical",
            },
            {
                trial: 3,
                droneC: 74.0,
                thermocouplerC: 74.4,
                condition: "Critical",
            },
            {
                trial: 4,
                droneC: 74.5,
                thermocouplerC: 74.1,
                condition: "Critical",
            },
            {
                trial: 5,
                droneC: 73.9,
                thermocouplerC: 74.3,
                condition: "Critical",
            },
            {
                trial: 6,
                droneC: 74.3,
                thermocouplerC: 73.9,
                condition: "Critical",
            },
            {
                trial: 7,
                droneC: 74.1,
                thermocouplerC: 74.5,
                condition: "Critical",
            },
            {
                trial: 8,
                droneC: 74.6,
                thermocouplerC: 74.2,
                condition: "Critical",
            },
            {
                trial: 9,
                droneC: 74.0,
                thermocouplerC: 73.6,
                condition: "Critical",
            },
            {
                trial: 10,
                droneC: 74.4,
                thermocouplerC: 74.8,
                condition: "Critical",
            },
        ],
    },
];

export type AccuracySummaryRow = {
    condition: string;
    droneMean: string;
    thermocouplerMean: string;
    meanAbsDiff: string;
    maxAbsDiff: string;
    classificationAgreement: string;
    droneStdDev: string;
    thermocouplerStdDev: string;
    isOverall?: boolean;
};

export const accuracySummaryRows: AccuracySummaryRow[] = [
    {
        condition: "Good",
        droneMean: "45.1",
        thermocouplerMean: "45.0",
        meanAbsDiff: "0.29",
        maxAbsDiff: "0.3",
        classificationAgreement: "100%",
        droneStdDev: "0.21",
        thermocouplerStdDev: "0.28",
    },
    {
        condition: "Fair",
        droneMean: "54.1",
        thermocouplerMean: "54.1",
        meanAbsDiff: "0.30",
        maxAbsDiff: "0.3",
        classificationAgreement: "100%",
        droneStdDev: "0.26",
        thermocouplerStdDev: "0.26",
    },
    {
        condition: "Deteriorating",
        droneMean: "64.6",
        thermocouplerMean: "64.6",
        meanAbsDiff: "0.30",
        maxAbsDiff: "0.3",
        classificationAgreement: "100%",
        droneStdDev: "0.22",
        thermocouplerStdDev: "0.28",
    },
    {
        condition: "Critical",
        droneMean: "74.2",
        thermocouplerMean: "74.2",
        meanAbsDiff: "0.40",
        maxAbsDiff: "0.4",
        classificationAgreement: "100%",
        droneStdDev: "0.24",
        thermocouplerStdDev: "0.28",
    },
    {
        condition: "Overall (40 trials)",
        droneMean: "—",
        thermocouplerMean: "—",
        meanAbsDiff: "0.32",
        maxAbsDiff: "0.4",
        classificationAgreement: "100%",
        droneStdDev: "0.23",
        thermocouplerStdDev: "0.28",
        isOverall: true,
    },
];

export type AccuracyTrendRow = {
    temperatureRange: string;
    trials: string;
    meanAbsDiff: string;
    classificationAgreement: string;
    trend: string;
};

export const accuracyTrendRows: AccuracyTrendRow[] = [
    {
        temperatureRange: "Good (≤ 50°C)",
        trials: "10",
        meanAbsDiff: "0.29",
        classificationAgreement: "100%",
        trend: "Baseline",
    },
    {
        temperatureRange: "Fair (51–60°C)",
        trials: "10",
        meanAbsDiff: "0.30",
        classificationAgreement: "100%",
        trend: "Stable (+0.01°C)",
    },
    {
        temperatureRange: "Deteriorating (61–70°C)",
        trials: "10",
        meanAbsDiff: "0.30",
        classificationAgreement: "100%",
        trend: "Stable (0.00°C)",
    },
    {
        temperatureRange: "Critical (> 70°C)",
        trials: "10",
        meanAbsDiff: "0.40",
        classificationAgreement: "100%",
        trend: "Increased (+0.10°C)",
    },
];
