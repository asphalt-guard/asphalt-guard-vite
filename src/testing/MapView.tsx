import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Road, LayoutDashboard, User as UserIcon, Users, Cpu, ChevronLeft } from "lucide-react";
import { getUserByUID, supabase } from "../lib/supabase";
import "leaflet/dist/leaflet.css";

type UsersRow = {
    user_id: string;
    full_name?: string | null;
    role?: string | null;
    contact_number?: string | null;
    created_at?: string | null;
    username?: string | null;
    email?: string | null;
};

type CaptureRow = {
    id: number;
    gps_latitude: number;
    gps_longitude: number;
    thermal_max_c: number | null;
    thermal_min_c: number | null;
    thermal_mean_c: number | null;
    thermal_ambient_c: number | null;
    thermal_grid: number[][] | null;
    image_url: string | null;
    yolo_crack: boolean | null;
    yolo_pothole: boolean | null;
    captured_at: string;
};

const PSU_CENTER: [number, number] = [14.99723753271071, 120.65322118793094];

const SVG_ICONS: Record<string, string> = {
    school: `<path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M18 4.933V21"/><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/><path d="M6 4.933V21"/><circle cx="12" cy="9" r="2"/>`,
    user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    circleAlert: `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>`,
    circle: `<circle cx="12" cy="12" r="10"/>`,
};

function makePin(svgKey: string, pinColor: string) {
    const svgInner = SVG_ICONS[svgKey];
    const html = `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50% 50% 50% 0;background:${pinColor};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg)">${svgInner}</svg></div>`;
    return L.divIcon({
        html,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
}

const psuIcon = makePin("school", "#1e293b");
const userLocIcon = makePin("user", "#2563eb");
const alertIcon = makePin("circleAlert", "#dc2626");
const goodIcon = makePin("circle", "#16a34a");

function getCaptureIcon(cap: CaptureRow) {
    const isAlert =
        (cap.thermal_max_c !== null && cap.thermal_max_c >= 51) ||
        cap.yolo_crack === true ||
        cap.yolo_pothole === true;
    return isAlert ? alertIcon : goodIcon;
}

function FlyToUser() {
    const map = useMap();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, {
                    duration: 2,
                });
            },
            () => {},
        );
    }, [map]);

    return null;
}

function FlyToPosition({ position }: { position: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 18, { duration: 1.2 });
        }
    }, [map, position]);

    return null;
}

const INFERNO_STOPS: [number, number, number][] = [
    [0, 0, 4], [10, 7, 34], [31, 12, 72], [60, 9, 101], [89, 0, 110],
    [120, 14, 106], [148, 33, 97], [174, 53, 84], [197, 76, 68],
    [216, 100, 50], [231, 127, 33], [241, 158, 16], [245, 191, 10],
    [242, 225, 37], [252, 255, 164],
];

function inferno(t: number): string {
    const clamped = Math.max(0, Math.min(1, t));
    const pos = clamped * (INFERNO_STOPS.length - 1);
    const i = Math.min(Math.floor(pos), INFERNO_STOPS.length - 2);
    const f = pos - i;
    const a = INFERNO_STOPS[i], b = INFERNO_STOPS[i + 1];
    const r = Math.round(a[0] + (b[0] - a[0]) * f);
    const g = Math.round(a[1] + (b[1] - a[1]) * f);
    const bl = Math.round(a[2] + (b[2] - a[2]) * f);
    return `rgb(${r},${g},${bl})`;
}

const TEMP_MIN = 0;
const TEMP_MAX = 100;

function ThermalGrid({ grid }: { grid: number[][] }) {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;

    return (
        <div
            className="w-full"
            style={{
                display: "grid",
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                aspectRatio: `${cols} / ${rows}`,
            }}
        >
            {grid.flatMap((row, r) =>
                row.map((val, c) => (
                    <div
                        key={`${r}-${c}`}
                        title={`${val.toFixed(1)}°C`}
                        style={{
                            backgroundColor: inferno(
                                Math.max(0, Math.min(1, (val - TEMP_MIN) / (TEMP_MAX - TEMP_MIN))),
                            ),
                        }}
                    />
                )),
            )}
        </div>
    );
}

const BUTTONS = [
    { icon: Road, label: "Asphalt Condition" },
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: UserIcon, label: "Account" },
    { icon: Users, label: "Users" },
    { icon: Cpu, label: "AI Models" },
];

export default function MapView() {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null,
    );
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [panelVisible, setPanelVisible] = useState(false);

    const handlePanelSwitch = (label: string) => {
        if (activePanel === label) {
            setPanelVisible(false);
            setTimeout(() => setActivePanel(null), 200);
        } else if (activePanel) {
            setPanelVisible(false);
            setTimeout(() => {
                setActivePanel(label);
                requestAnimationFrame(() => setPanelVisible(true));
            }, 200);
        } else {
            setActivePanel(label);
            requestAnimationFrame(() => setPanelVisible(true));
        }
    };
    const [accountUser, setAccountUser] = useState<UsersRow | null>(null);
    const [authEmail, setAuthEmail] = useState<string | null>(null);
    const [accountLoading, setAccountLoading] = useState(true);
    const [dashLoading, setDashLoading] = useState(true);
    const [dashStats, setDashStats] = useState({
        totalInspected: 0,
        totalDefects: 0,
        good: 0,
        fair: 0,
        deteriorating: 0,
        critical: 0,
        latestTime: "N/A",
        peakMaxTemp: null as number | null,
        avgMaxTemp: null as number | null,
        thermalSamples: 0,
    });

    const [captures, setCaptures] = useState<CaptureRow[]>([]);
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
    const [selectedCapture, setSelectedCapture] = useState<CaptureRow | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    const openCaptureDetail = (cap: CaptureRow) => {
        setSelectedCapture(cap);
        setFlyTarget([cap.gps_latitude, cap.gps_longitude]);
        requestAnimationFrame(() => setDetailVisible(true));
    };

    const closeCaptureDetail = () => {
        setDetailVisible(false);
        setTimeout(() => setSelectedCapture(null), 200);
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        });
    }, []);

    useEffect(() => {
        const loadCaptures = async () => {
            const { data } = await supabase
                .from("captures")
                .select("id, gps_latitude, gps_longitude, thermal_max_c, thermal_min_c, thermal_mean_c, thermal_ambient_c, thermal_grid, image_url, yolo_crack, yolo_pothole, captured_at")
                .eq("gps_valid", true)
                .order("captured_at", { ascending: false });
            if (data) setCaptures(data as CaptureRow[]);
        };
        loadCaptures();
    }, []);

    useEffect(() => {
        const loadAccount = async () => {
            setAccountLoading(true);
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session?.user) {
                setAccountLoading(false);
                return;
            }
            setAuthEmail(session.user.email ?? null);
            const row = (await getUserByUID(
                session.user.id,
            )) as UsersRow | null;
            setAccountUser(row);
            setAccountLoading(false);
        };
        loadAccount();
    }, []);

    useEffect(() => {
        const loadDashboard = async () => {
            setDashLoading(true);
            const { data: scans } = await supabase
                .from("scan_history")
                .select("*")
                .order("created_at", { ascending: false });

            type ScanRow = {
                pothole_count?: number | null;
                created_at: string;
                max_temp?: number | null;
            };

            if (scans && scans.length > 0) {
                let totalDefects = 0;
                let good = 0,
                    fair = 0,
                    deteriorating = 0,
                    critical = 0;
                const thermalValues: number[] = [];

                (scans as ScanRow[]).forEach((scan) => {
                    totalDefects += scan.pothole_count || 0;
                    if (typeof scan.max_temp === "number") {
                        thermalValues.push(scan.max_temp);
                        if (scan.max_temp <= 50) good++;
                        else if (scan.max_temp <= 60) fair++;
                        else if (scan.max_temp <= 70) deteriorating++;
                        else critical++;
                    }
                });

                const latest = new Date((scans as ScanRow[])[0].created_at);
                const formattedTime = `${latest.toLocaleDateString()} ${latest.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                const peakMaxTemp =
                    thermalValues.length > 0
                        ? Math.max(...thermalValues)
                        : null;
                const avgMaxTemp =
                    thermalValues.length > 0
                        ? Math.round(
                              thermalValues.reduce((a, b) => a + b, 0) /
                                  thermalValues.length,
                          )
                        : null;

                setDashStats({
                    totalInspected: scans.length,
                    totalDefects,
                    good,
                    fair,
                    deteriorating,
                    critical,
                    latestTime: formattedTime,
                    peakMaxTemp,
                    avgMaxTemp,
                    thermalSamples: thermalValues.length,
                });
            }
            setDashLoading(false);
        };
        loadDashboard();
    }, []);

    const defectRate =
        dashStats.totalInspected > 0
            ? (dashStats.totalDefects / dashStats.totalInspected).toFixed(2)
            : "0.00";

    const conditionBreakdown = [
        {
            label: "Good",
            range: "≤ 50°C",
            value: dashStats.good,
            color: "bg-emerald-500",
        },
        {
            label: "Fair",
            range: "51–60°C",
            value: dashStats.fair,
            color: "bg-yellow-500",
        },
        {
            label: "Deteriorating",
            range: "61–70°C",
            value: dashStats.deteriorating,
            color: "bg-orange-500",
        },
        {
            label: "Critical",
            range: "> 70°C",
            value: dashStats.critical,
            color: "bg-red-500",
        },
    ];

    const profileInitials = useMemo(() => {
        const source =
            accountUser?.full_name?.trim() ||
            accountUser?.username?.trim() ||
            "";
        if (!source) return "?";
        return source
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");
    }, [accountUser?.full_name, accountUser?.username]);

    const displayEmail = accountUser?.email?.trim() || authEmail || "—";
    const displayName =
        accountUser?.full_name?.trim() || accountUser?.username?.trim() || "—";
    const displayRole = accountUser?.role?.trim() || "—";
    const displayPhone = accountUser?.contact_number?.trim() || "—";
    const displayUsername = accountUser?.username?.trim() || "—";

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {/* Top Left Buttons */}
            <div className="absolute top-4 left-4 z-1000 flex flex-col gap-3">
                {BUTTONS.map(({ icon: Icon, label }) => (
                    <button
                        key={label}
                        onClick={() => handlePanelSwitch(label)}
                        className={`group flex h-12 min-w-12 max-w-12 items-center rounded-full px-3 shadow-lg hover:max-w-56 hover:scale-110 hover:shadow-xl cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
                            activePanel === label
                                ? "bg-blue-600 hover:bg-blue-500"
                                : "bg-gray-900 hover:bg-gray-800"
                        }`}
                    >
                        <Icon
                            size={22}
                            className="text-white shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:rotate-3"
                        />
                        <span className="whitespace-nowrap text-sm font-medium text-white ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] delay-200">
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Panel */}
            {activePanel && (
                <div
                    className={`absolute top-4 left-20 z-999 w-96 max-h-[calc(100vh-2rem)] rounded-2xl bg-gray-900/95 backdrop-blur-md shadow-2xl overflow-y-auto transition-opacity duration-200 ease-in-out ${
                        panelVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="p-5 flex flex-col">
                        <h2 className="text-lg font-semibold text-white mb-1">
                            {activePanel}
                        </h2>

                        <div className="flex-1 flex flex-col">
                            {activePanel === "Asphalt Condition" ? (
                            captures.length === 0 ? (
                                <p className="text-sm text-gray-400 mt-3">No captures with GPS data found.</p>
                            ) : (
                                <div className="flex-1 flex flex-col gap-2 mt-3">
                                    {captures.map((cap) => {
                                        const temp = cap.thermal_max_c;
                                        const conditionLabel =
                                            temp === null ? "Unknown" :
                                            temp <= 50 ? "Good" :
                                            temp <= 60 ? "Fair" :
                                            temp <= 70 ? "Deteriorating" : "Critical";
                                        const conditionColor =
                                            temp === null ? "bg-gray-600" :
                                            temp <= 50 ? "bg-emerald-500" :
                                            temp <= 60 ? "bg-yellow-500" :
                                            temp <= 70 ? "bg-orange-500" : "bg-red-500";

                                        return (
                                            <button
                                                key={cap.id}
                                                onClick={() => openCaptureDetail(cap)}
                                                className="rounded-lg bg-gray-800/70 p-3 text-left hover:bg-gray-700/70 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium text-white">Capture #{cap.id}</p>
                                                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full text-white ${conditionColor}`}>
                                                        {conditionLabel}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span>{temp !== null ? `${temp}°C` : "—"}</span>
                                                    <span>{new Date(cap.captured_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">
                                                    {cap.gps_latitude.toFixed(6)}, {cap.gps_longitude.toFixed(6)}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )
                        ) : activePanel === "Account" ? (
                            accountLoading ? (
                                <div className="flex-1 flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col gap-4 mt-3">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center text-lg font-semibold text-white">
                                            {profileInitials}
                                        </div>
                                        <p className="text-sm font-medium text-white">
                                            {displayName}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {displayRole}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                                            <p className="text-xs text-gray-500">
                                                Email
                                            </p>
                                            <p className="text-sm text-gray-200 break-all">
                                                {displayEmail}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                                            <p className="text-xs text-gray-500">
                                                Username
                                            </p>
                                            <p className="text-sm text-gray-200">
                                                {displayUsername}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                                            <p className="text-xs text-gray-500">
                                                Contact
                                            </p>
                                            <p className="text-sm text-gray-200">
                                                {displayPhone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : activePanel === "Dashboard" ? (
                            dashLoading ? (
                                <div className="flex-1 flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col gap-4 mt-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            Latest Inspection
                                        </p>
                                        <p className="text-xs font-medium text-gray-300">
                                            {dashStats.latestTime}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            {
                                                title: "Inspected",
                                                value: dashStats.totalInspected,
                                            },
                                            {
                                                title: "Defects",
                                                value: dashStats.totalDefects,
                                            },
                                            {
                                                title: "Good",
                                                value: dashStats.good,
                                            },
                                            {
                                                title: "Critical",
                                                value: dashStats.critical,
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.title}
                                                className="rounded-lg bg-gray-800/70 p-3"
                                            >
                                                <p className="text-xs text-gray-500">
                                                    {item.title}
                                                </p>
                                                <p className="text-xl font-semibold text-white mt-1">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-lg bg-gray-800/70 p-3">
                                        <p className="text-xs text-gray-500 mb-3">
                                            Condition Breakdown
                                        </p>
                                        <div className="space-y-3">
                                            {conditionBreakdown.map((item) => {
                                                const pct =
                                                    dashStats.thermalSamples > 0
                                                        ? Math.round(
                                                              (item.value /
                                                                  dashStats.thermalSamples) *
                                                                  100,
                                                          )
                                                        : 0;
                                                return (
                                                    <div key={item.label}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-gray-400">
                                                                {item.label}{" "}
                                                                <span className="text-gray-600">
                                                                    (
                                                                    {item.range}
                                                                    )
                                                                </span>
                                                            </span>
                                                            <span className="text-gray-300">
                                                                {item.value} (
                                                                {pct}%)
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-700 rounded-full">
                                                            <div
                                                                className={`h-1.5 rounded-full ${item.color}`}
                                                                style={{
                                                                    width: `${pct}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded-lg bg-orange-950/50 border border-orange-800/30 p-2">
                                            <p className="text-[10px] text-orange-400 uppercase">
                                                Peak Surface Temp
                                            </p>
                                            <p className="text-sm font-bold text-orange-300">
                                                {dashStats.peakMaxTemp !== null
                                                    ? `${dashStats.peakMaxTemp}°C`
                                                    : "—"}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-amber-950/50 border border-amber-800/30 p-2">
                                            <p className="text-[10px] text-amber-400 uppercase">
                                                Avg Surface Temp
                                            </p>
                                            <p className="text-sm font-bold text-amber-300">
                                                {dashStats.avgMaxTemp !== null
                                                    ? `${dashStats.avgMaxTemp}°C`
                                                    : "—"}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-800/70 p-2 flex flex-col justify-between">
                                            <p className="text-[10px] text-gray-500 uppercase">
                                                Defect Rate
                                            </p>
                                            <p className="text-sm font-bold text-white">
                                                {defectRate}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : activePanel === "AI Models" ? (
                            <div className="flex-1 flex flex-col gap-4 mt-3">
                                {[
                                    {
                                        id: "model-01",
                                        name: "AsphaltGuard Model v1",
                                        modelType: "YOLOv26n",
                                        dateTrained: "February 18, 2026",
                                        f1Score: 0.81,
                                        description:
                                            "First model trained on the pothole dataset.",
                                        confusionMatrix: [
                                            [84, 7],
                                            [5, 91],
                                        ],
                                        trainingTime: "4h 12m",
                                        status: "Ready for deployment review",
                                    },
                                ].map((model) => (
                                    <div
                                        key={model.id}
                                        className="flex flex-col gap-3"
                                    >
                                        <p className="text-sm font-medium text-white">
                                            {model.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {model.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-gray-800/70 p-2">
                                                <p className="text-[10px] text-gray-500 uppercase">
                                                    Model Type
                                                </p>
                                                <p className="text-sm font-medium text-white">
                                                    {model.modelType}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-gray-800/70 p-2">
                                                <p className="text-[10px] text-gray-500 uppercase">
                                                    Date Trained
                                                </p>
                                                <p className="text-sm font-medium text-white">
                                                    {model.dateTrained}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-gray-800/70 p-2">
                                                <p className="text-[10px] text-gray-500 uppercase">
                                                    Training Time
                                                </p>
                                                <p className="text-sm font-medium text-white">
                                                    {model.trainingTime}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-gray-800/70 p-2">
                                                <p className="text-[10px] text-gray-500 uppercase">
                                                    Status
                                                </p>
                                                <p className="text-sm font-medium text-white">
                                                    {model.status}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-emerald-950/50 border border-emerald-800/30 p-3 flex items-center justify-between">
                                            <p className="text-xs text-emerald-400 uppercase">
                                                F1 Score
                                            </p>
                                            <p className="text-2xl font-bold text-emerald-300">
                                                {model.f1Score.toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-gray-800/70 p-3">
                                            <p className="text-[10px] text-gray-500 uppercase mb-2">
                                                Confusion Matrix
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {model.confusionMatrix
                                                    .flat()
                                                    .map((value, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-center rounded-lg bg-gray-700/50 py-3"
                                                        >
                                                            <span className="text-sm font-semibold text-white">
                                                                {value}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-400 mb-4">
                                    Content for {activePanel}
                                </p>
                                <div className="flex-1 rounded-xl bg-gray-800/50 p-4">
                                    <p className="text-sm text-gray-500">
                                        Panel content goes here...
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* Capture Detail Panel */}
            {selectedCapture && (
                <div
                    className={`absolute top-4 right-4 z-999 w-96 max-h-[calc(100vh-2rem)] rounded-2xl bg-gray-900/95 backdrop-blur-md shadow-2xl overflow-y-auto transition-opacity duration-200 ease-in-out ${
                        detailVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={closeCaptureDetail}
                                className="p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <ChevronLeft size={20} className="text-gray-400" />
                            </button>
                            <h2 className="text-lg font-semibold text-white">
                                Capture #{selectedCapture.id}
                            </h2>
                        </div>

                        {selectedCapture.image_url && (
                            <div className="rounded-xl overflow-hidden">
                                <img
                                    src={selectedCapture.image_url}
                                    alt={`Capture #${selectedCapture.id}`}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {selectedCapture.thermal_grid && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-2">Thermal View</p>
                                <div className="rounded-xl overflow-hidden">
                                    <ThermalGrid grid={selectedCapture.thermal_grid} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-red-950/50 border border-red-800/30 p-2">
                                <p className="text-[10px] text-red-400 uppercase">Max Temp</p>
                                <p className="text-sm font-bold text-red-300">
                                    {selectedCapture.thermal_max_c !== null ? `${selectedCapture.thermal_max_c}°C` : "—"}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-950/50 border border-blue-800/30 p-2">
                                <p className="text-[10px] text-blue-400 uppercase">Min Temp</p>
                                <p className="text-sm font-bold text-blue-300">
                                    {selectedCapture.thermal_min_c !== null ? `${selectedCapture.thermal_min_c}°C` : "—"}
                                </p>
                            </div>
                            <div className="rounded-lg bg-amber-950/50 border border-amber-800/30 p-2">
                                <p className="text-[10px] text-amber-400 uppercase">Mean Temp</p>
                                <p className="text-sm font-bold text-amber-300">
                                    {selectedCapture.thermal_mean_c !== null ? `${selectedCapture.thermal_mean_c}°C` : "—"}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-800/70 p-3 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Captured</span>
                                <span className="text-gray-300">{new Date(selectedCapture.captured_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Coordinates</span>
                                <span className="text-gray-300">
                                    {selectedCapture.gps_latitude.toFixed(6)}, {selectedCapture.gps_longitude.toFixed(6)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <MapContainer
                center={PSU_CENTER}
                zoom={16}
                className="absolute inset-0 z-0 h-full w-full"
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={PSU_CENTER} icon={psuIcon}>
                    <Popup>Pampanga State University</Popup>
                </Marker>
                {userLocation && (
                    <Marker position={userLocation} icon={userLocIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}
                {captures.map((cap) => (
                    <Marker
                        key={cap.id}
                        position={[cap.gps_latitude, cap.gps_longitude]}
                        icon={getCaptureIcon(cap)}
                        eventHandlers={{ click: () => openCaptureDetail(cap) }}
                    />
                ))}
                <FlyToUser />
                <FlyToPosition position={flyTarget} />
            </MapContainer>
        </div>
    );
}
