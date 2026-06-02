import {
    ArrowUpRight,
    Camera,
    Car,
    CheckCircle2,
    Minus,
    Sparkles,
    Thermometer,
    TrendingUp,
} from "lucide-react";
import DashboardShell from "./DashboardShell";
import {
    accuracySummaryRows,
    accuracyTrendRows,
    validationTables,
    type ValidationTable,
    type ValidationTrialRow,
} from "./thermalSensorValidationData";

type ConditionStyle = {
    accent: string;
    badge: string;
    dot: string;
    glow: string;
    ring: string;
};

const conditionStyles: Record<string, ConditionStyle> = {
    Good: {
        accent: "text-emerald-300",
        badge: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
        dot: "bg-emerald-400",
        glow: "from-emerald-500/20 to-transparent",
        ring: "ring-emerald-500/30",
    },
    Fair: {
        accent: "text-yellow-300",
        badge: "bg-yellow-500/20 text-yellow-300 ring-yellow-500/30",
        dot: "bg-yellow-400",
        glow: "from-yellow-500/20 to-transparent",
        ring: "ring-yellow-500/30",
    },
    Deteriorating: {
        accent: "text-orange-300",
        badge: "bg-orange-500/20 text-orange-300 ring-orange-500/30",
        dot: "bg-orange-400",
        glow: "from-orange-500/20 to-transparent",
        ring: "ring-orange-500/30",
    },
    Critical: {
        accent: "text-red-300",
        badge: "bg-red-500/20 text-red-300 ring-red-500/30",
        dot: "bg-red-400",
        glow: "from-red-500/20 to-transparent",
        ring: "ring-red-500/30",
    },
};

function getConditionStyle(label: string): ConditionStyle {
    return (
        conditionStyles[label] ?? {
            accent: "text-gray-300",
            badge: "bg-gray-500/20 text-gray-300 ring-gray-500/30",
            dot: "bg-gray-400",
            glow: "from-gray-500/20 to-transparent",
            ring: "ring-gray-500/30",
        }
    );
}

function absDiff(a: number, b: number) {
    return Math.abs(a - b);
}

function TrialRow({ row }: { row: ValidationTrialRow }) {
    const diff = absDiff(row.droneC, row.thermocouplerC);
    const style = getConditionStyle(row.condition);
    const maxTemp = Math.max(row.droneC, row.thermocouplerC);
    const dronePct = (row.droneC / maxTemp) * 100;
    const thermoPct = (row.thermocouplerC / maxTemp) * 100;

    return (
        <div className="rounded-lg bg-gray-900/50 px-3 py-2.5 ring-1 ring-gray-700/50">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-gray-500">
                    Trial {row.trial}
                </span>
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge} ring-1`}
                >
                    Δ {diff.toFixed(1)}°C
                </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-sky-400">
                        <Camera size={11} />
                        Drone
                    </div>
                    <p className="text-sm font-semibold text-white">
                        {row.droneC.toFixed(1)}°
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className="h-full rounded-full bg-sky-500"
                            style={{ width: `${dronePct}%` }}
                        />
                    </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-500">
                    <Minus size={12} />
                </div>
                <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1 text-[10px] text-violet-400">
                        RC Car
                        <Car size={11} />
                    </div>
                    <p className="text-sm font-semibold text-white">
                        {row.thermocouplerC.toFixed(1)}°
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className="ml-auto h-full rounded-full bg-violet-500"
                            style={{ width: `${thermoPct}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConditionCard({ table }: { table: ValidationTable }) {
    const style = getConditionStyle(table.shortLabel);
    const avgDrone =
        table.rows.reduce((sum, row) => sum + row.droneC, 0) /
        table.rows.length;
    const avgDiff =
        table.rows.reduce(
            (sum, row) => sum + absDiff(row.droneC, row.thermocouplerC),
            0,
        ) / table.rows.length;

    return (
        <article
            className={`overflow-hidden rounded-2xl bg-gray-800/70 ring-1 ${style.ring} shadow-lg`}
        >
            <div
                className={`bg-linear-to-r ${style.glow} px-4 py-4 sm:px-5`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
                            />
                            <span
                                className={`text-lg font-semibold ${style.accent}`}
                            >
                                {table.shortLabel}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">
                            {table.tempRange} · 10 spot checks, same location
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-900/60 px-3 py-2 text-right ring-1 ring-gray-700/60">
                        <p className="text-[10px] uppercase text-gray-500">
                            Avg match
                        </p>
                        <p className="text-sm font-bold text-white">
                            {avgDiff.toFixed(2)}°C off
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 px-4 py-4 sm:px-5">
                <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-900/40 px-3 py-2 text-xs">
                    <span className="text-gray-500">Drone avg</span>
                    <span className="font-semibold text-sky-300">
                        {avgDrone.toFixed(1)}°C
                    </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    {table.rows.map((row) => (
                        <TrialRow key={row.trial} row={row} />
                    ))}
                </div>
            </div>
        </article>
    );
}

function TrendBadge({ trend }: { trend: string }) {
    const isIncreased = trend.startsWith("Increased");
    const isBaseline = trend === "Baseline";

    if (isBaseline) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-medium text-blue-300 ring-1 ring-blue-500/25">
                <Sparkles size={12} />
                {trend}
            </span>
        );
    }

    if (isIncreased) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-500/25">
                <ArrowUpRight size={12} />
                {trend}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/25">
            <Minus size={12} />
            {trend}
        </span>
    );
}

function ThermalSensors() {
    const overall = accuracySummaryRows.find((row) => row.isOverall);

    return (
        <DashboardShell title="Thermal Sensors" activePath="thermal-sensors">
            <div className="flex flex-col gap-6">
                <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600/20 via-gray-800/80 to-violet-600/10 p-5 ring-1 ring-blue-500/20">
                    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/25">
                                <CheckCircle2 size={14} />
                                Sensors validated in the field
                            </div>
                            <h2 className="text-xl font-semibold text-white">
                                Drone camera & RC car thermocoupler agree
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-400">
                                40 repeated readings across four asphalt
                                conditions — same test spot each time, same
                                thresholds as the live dashboard.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {[
                                {
                                    label: "Trials",
                                    value: "40",
                                    hint: "10 per condition",
                                },
                                {
                                    label: "Agreement",
                                    value: overall?.classificationAgreement ?? "100%",
                                    hint: "Classification match",
                                },
                                {
                                    label: "Avg gap",
                                    value: `${overall?.meanAbsDiff ?? "0.32"}°C`,
                                    hint: "Between sensors",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl bg-gray-900/70 px-3 py-3 text-center ring-1 ring-gray-700/60 backdrop-blur-sm"
                                >
                                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-white">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-[10px] text-gray-500">
                                        {stat.hint}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Thermometer
                        size={120}
                        className="pointer-events-none absolute -right-4 -top-4 text-white/5"
                    />
                </section>

                <section className="space-y-3">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Field trials
                            </p>
                            <h3 className="text-base font-semibold text-white">
                                Side-by-side sensor reads
                            </h3>
                        </div>
                        <div className="hidden items-center gap-3 text-[11px] text-gray-500 sm:flex">
                            <span className="inline-flex items-center gap-1 text-sky-400">
                                <Camera size={12} /> Drone
                            </span>
                            <span className="inline-flex items-center gap-1 text-violet-400">
                                <Car size={12} /> RC car
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                        {validationTables.map((table) => (
                            <ConditionCard key={table.number} table={table} />
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Accuracy snapshot
                        </p>
                        <h3 className="text-base font-semibold text-white">
                            How tight are the sensors?
                        </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {accuracySummaryRows
                            .filter((row) => !row.isOverall)
                            .map((row) => {
                                const style = getConditionStyle(row.condition);
                                return (
                                    <div
                                        key={row.condition}
                                        className={`rounded-2xl bg-gray-800/70 p-4 ring-1 ${style.ring}`}
                                    >
                                        <div className="mb-3 flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full ${style.dot}`}
                                            />
                                            <p
                                                className={`text-sm font-semibold ${style.accent}`}
                                            >
                                                {row.condition}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">
                                                    Mean gap
                                                </span>
                                                <span className="font-semibold text-white">
                                                    {row.meanAbsDiff}°C
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">
                                                    Agreement
                                                </span>
                                                <span className="font-semibold text-emerald-300">
                                                    {row.classificationAgreement}
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-gray-900/50 px-3 py-2 text-[11px] text-gray-400">
                                                Drone {row.droneMean}° · RC{" "}
                                                {row.thermocouplerMean}°
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    {overall ? (
                        <div className="flex flex-col gap-3 rounded-2xl bg-linear-to-r from-emerald-500/10 to-blue-500/10 p-4 ring-1 ring-emerald-500/20 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Overall — {overall.condition}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Mean difference {overall.meanAbsDiff}°C ·
                                    max {overall.maxAbsDiff}°C ·{" "}
                                    {overall.classificationAgreement} agreement
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/25">
                                <CheckCircle2 size={14} />
                                Validation passed
                            </div>
                        </div>
                    ) : null}
                </section>

                <section className="space-y-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            Temperature climb
                        </p>
                        <h3 className="text-base font-semibold text-white">
                            Does accuracy hold as asphalt heats up?
                        </h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {accuracyTrendRows.map((row, index) => {
                            const label = row.temperatureRange.split(" (")[0];
                            const style = getConditionStyle(label);
                            return (
                                <div
                                    key={row.temperatureRange}
                                    className="relative overflow-hidden rounded-2xl bg-gray-800/70 p-4 ring-1 ring-gray-700/60"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                            Step {index + 1}
                                        </span>
                                        <TrendBadge trend={row.trend} />
                                    </div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${style.dot}`}
                                        />
                                        <p className="text-sm font-semibold text-white">
                                            {label}
                                        </p>
                                    </div>
                                    <p className="mb-4 text-xs text-gray-500">
                                        {row.temperatureRange.match(/\(.+\)/)?.[0]?.slice(1, -1)}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="rounded-lg bg-gray-900/50 px-2 py-2">
                                            <p className="text-[10px] text-gray-500">
                                                Gap
                                            </p>
                                            <p className="text-sm font-bold text-white">
                                                {row.meanAbsDiff}°C
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-900/50 px-2 py-2">
                                            <p className="text-[10px] text-gray-500">
                                                Match
                                            </p>
                                            <p className="text-sm font-bold text-emerald-300">
                                                {row.classificationAgreement}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-gray-800/50 px-4 py-3 ring-1 ring-gray-700/50">
                        <TrendingUp
                            size={18}
                            className="mt-0.5 shrink-0 text-amber-400"
                        />
                        <p className="text-xs leading-relaxed text-gray-400">
                            Agreement stays at 100% across every range. The
                            only bump is a slightly wider gap in the critical
                            band — still under half a degree.
                        </p>
                    </div>
                </section>
            </div>
        </DashboardShell>
    );
}

export default ThermalSensors;
