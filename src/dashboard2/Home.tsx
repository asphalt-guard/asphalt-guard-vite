import { useEffect, useState } from "react";
import DashboardShell from "./DashboardShell";
import {
    CAPTURE_LIST_SELECT,
    formatPhilippineDateTime,
    type CaptureRow,
} from "../lib/captureUtils";
import { getUserByUID, supabase } from "../lib/supabase";

type UsersRow = { username?: string | null };

type ConditionKey = "good" | "fair" | "deteriorating" | "critical";

function classifyByMaxTemp(maxTemp: number): ConditionKey {
    if (maxTemp <= 50) return "good";
    if (maxTemp <= 60) return "fair";
    if (maxTemp <= 70) return "deteriorating";
    return "critical";
}

function DashboardLayout() {
    const [user, setUser] = useState<UsersRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalInspected: 0,
        totalDefects: 0,
        good: 0,
        fair: 0,
        deteriorating: 0,
        critical: 0,
        latestTime: "N/A",
        peakTemp: null as number | null,
        avgTemp: null as number | null,
        thermalSamples: 0,
    });

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);

            const {
                data: { session },
            } = await supabase.auth.getSession();
            const userData = (await getUserByUID(
                session?.user.id,
            )) as UsersRow | null;
            setUser(userData);

            const { data } = await supabase
                .from("captures")
                .select(CAPTURE_LIST_SELECT)
                .eq("gps_valid", true)
                .order("captured_at", { ascending: false });

            const captures = (data as CaptureRow[]) ?? [];

            if (captures.length > 0) {
                const totalInspected = captures.length;
                let totalDefects = 0;
                let good = 0,
                    fair = 0,
                    deteriorating = 0,
                    critical = 0;

                const thermalValues: number[] = [];

                captures.forEach((cap) => {
                    totalDefects +=
                        (cap.yolo_crack === true ? 1 : 0) +
                        (cap.yolo_pothole === true ? 1 : 0);

                    if (typeof cap.thermal_ambient_c === "number") {
                        thermalValues.push(cap.thermal_ambient_c);
                        const bucket = classifyByMaxTemp(cap.thermal_ambient_c);
                        if (bucket === "good") good++;
                        else if (bucket === "fair") fair++;
                        else if (bucket === "deteriorating") deteriorating++;
                        else critical++;
                    }
                });

                const formattedTime = formatPhilippineDateTime(
                    captures[0].captured_at,
                );

                const peakTemp =
                    thermalValues.length > 0
                        ? Math.max(...thermalValues)
                        : null;
                const avgTemp =
                    thermalValues.length > 0
                        ? Math.round(
                              thermalValues.reduce((a, b) => a + b, 0) /
                                  thermalValues.length,
                          )
                        : null;

                setStats({
                    totalInspected,
                    totalDefects,
                    good,
                    fair,
                    deteriorating,
                    critical,
                    latestTime: formattedTime,
                    peakTemp,
                    avgTemp,
                    thermalSamples: thermalValues.length,
                });
            } else {
                setStats({
                    totalInspected: 0,
                    totalDefects: 0,
                    good: 0,
                    fair: 0,
                    deteriorating: 0,
                    critical: 0,
                    latestTime: "N/A",
                    peakTemp: null,
                    avgTemp: null,
                    thermalSamples: 0,
                });
            }

            setLoading(false);
        };

        initDashboard();
    }, []);

    const conditionBreakdown = [
        {
            label: "Good",
            range: "≤ 50°C",
            value: stats.good,
            color: "bg-emerald-500",
        },
        {
            label: "Fair",
            range: "51–60°C",
            value: stats.fair,
            color: "bg-yellow-500",
        },
        {
            label: "Deteriorating",
            range: "61–70°C",
            value: stats.deteriorating,
            color: "bg-orange-500",
        },
        {
            label: "Critical",
            range: "> 70°C",
            value: stats.critical,
            color: "bg-red-500",
        },
    ];

    const defectRate =
        stats.totalInspected > 0
            ? (stats.totalDefects / stats.totalInspected).toFixed(2)
            : "0.00";

    return (
        <DashboardShell title="Dashboard" activePath="dashboard" loading={loading}>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Welcome back,</p>
                        <p className="text-xl font-semibold text-white">
                            {user?.username?.trim() || "Guest"}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Latest Inspection</p>
                        <p className="text-xs font-medium text-gray-300">
                            {stats.latestTime}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {[
                        { title: "Inspected", value: stats.totalInspected },
                        { title: "Defects", value: stats.totalDefects },
                        { title: "Good", value: stats.good },
                        { title: "Critical", value: stats.critical },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-lg bg-gray-800/70 p-3"
                        >
                            <p className="text-xs text-gray-500">{item.title}</p>
                            <p className="mt-1 text-xl font-semibold text-white">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg bg-gray-800/70 p-3">
                    <p className="mb-3 text-xs text-gray-500">
                        Condition Breakdown
                    </p>
                    <div className="space-y-3">
                        {conditionBreakdown.map((item) => {
                            const pct =
                                stats.thermalSamples > 0
                                    ? Math.round(
                                          (item.value / stats.thermalSamples) *
                                              100,
                                      )
                                    : 0;
                            return (
                                <div key={item.label}>
                                    <div className="mb-1 flex justify-between text-xs">
                                        <span className="text-gray-400">
                                            {item.label}{" "}
                                            <span className="text-gray-600">
                                                ({item.range})
                                            </span>
                                        </span>
                                        <span className="text-gray-300">
                                            {item.value} ({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-gray-700">
                                        <div
                                            className={`h-1.5 rounded-full ${item.color}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-800/70 p-3">
                        <p className="mb-2 text-xs text-gray-500">Summary</p>
                        <div className="space-y-2">
                            {[
                                { label: "Fair", value: stats.fair },
                                {
                                    label: "Deteriorating",
                                    value: stats.deteriorating,
                                },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    className="flex justify-between text-xs"
                                >
                                    <span className="text-gray-500">
                                        {row.label}
                                    </span>
                                    <span className="text-gray-300">
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg bg-gray-800/70 p-3 flex flex-col justify-between">
                        <p className="text-[10px] text-gray-500 uppercase">
                            Defect Rate
                        </p>
                        <p className="text-2xl font-bold text-white">
                            {defectRate}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-orange-800/30 bg-orange-950/50 p-2">
                        <p className="text-[10px] uppercase text-orange-400">
                            Peak Surface Temp
                        </p>
                        <p className="text-sm font-bold text-orange-300">
                            {stats.peakTemp !== null
                                ? `${stats.peakTemp}°C`
                                : "—"}
                        </p>
                    </div>
                    <div className="rounded-lg border border-amber-800/30 bg-amber-950/50 p-2">
                        <p className="text-[10px] uppercase text-amber-400">
                            Avg Surface Temp
                        </p>
                        <p className="text-sm font-bold text-amber-300">
                            {stats.avgTemp !== null
                                ? `${stats.avgTemp}°C`
                                : "—"}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gray-800/70 p-2">
                        <p className="text-[10px] uppercase text-gray-500">
                            Thermal Samples
                        </p>
                        <p className="text-sm font-bold text-white">
                            {stats.thermalSamples}
                        </p>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

export default DashboardLayout;
