import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Road, ChevronLeft, MapPin, Video, Car, Drone } from "lucide-react";
import MapCaptureDetail from "../components/MapCaptureDetail";
import MapCaptureList from "../components/MapCaptureList";
import {
    CAPTURE_LIST_SELECT,
    getConditionFromMaxTemp,
    getDroneTempC,
    parseRccarLiveResponse,
    type CaptureRow,
    type RccarLiveData,
} from "../lib/captureUtils";
import { supabase } from "../lib/supabase";
import "leaflet/dist/leaflet.css";

const PSU_CENTER: [number, number] = [14.99723753271071, 120.65322118793094];

const SVG_ICONS: Record<string, string> = {
    school: `<path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M18 4.933V21"/><path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6"/><path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11"/><path d="M6 4.933V21"/><circle cx="12" cy="9" r="2"/>`,
    user: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    circleAlert: `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>`,
    circle: `<circle cx="12" cy="12" r="10"/>`,
    drone: `<path d="M10 2h4"/><path d="m21 7-2-2"/><path d="m5 7 2-2"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M4.5 18.5 7 17l2.5 1.5"/><path d="M14.5 18.5 17 17l2.5 1.5"/><path d="M7 17v-3a5 5 0 0 1 10 0v3"/>`,
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
const fairIcon = makePin("circle", "#eab308");
const goodIcon = makePin("circle", "#16a34a");
const gpsActiveIcon = makePin("drone", "#2563eb");
const gpsStaleIcon = makePin("drone", "#6b7280");

function getCaptureIcon(cap: CaptureRow) {
    if (cap.yolo_crack === true || cap.yolo_pothole === true) {
        return alertIcon;
    }

    const droneTempC = getDroneTempC(cap);
    if (droneTempC !== null) {
        if (droneTempC > 60) return alertIcon;
        if (droneTempC > 50) return fairIcon;
    }

    return goodIcon;
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
            map.flyTo(position, map.getZoom(), { duration: 1.2 });
        }
    }, [map, position]);

    return null;
}

const BUTTONS = [{ icon: Road, label: "Asphalt Condition" }];

export default function MapView() {
    const navigate = useNavigate();
    const [authChecked, setAuthChecked] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) navigate("/login", { replace: true });
            else setAuthChecked(true);
        });
    }, [navigate]);

    useEffect(() => {
        if (authChecked) {
            requestAnimationFrame(() => setContentVisible(true));
        } else {
            setContentVisible(false);
        }
    }, [authChecked]);

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
    const [captures, setCaptures] = useState<CaptureRow[]>([]);
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
    const [selectedCapture, setSelectedCapture] = useState<CaptureRow | null>(
        null,
    );
    const [detailVisible, setDetailVisible] = useState(false);
    const [gpsData, setGpsData] = useState<{
        latitude: number;
        longitude: number;
        valid: boolean;
    } | null>(null);
    const [gpsLastValid, setGpsLastValid] = useState<[number, number] | null>(
        null,
    );
    const [thermalMeanC, setThermalMeanC] = useState<number | null>(null);
    const [rcCarLive, setRcCarLive] = useState<RccarLiveData | null>(null);

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
        let active = true;
        const pollGps = async () => {
            try {
                const res = await fetch(
                    "https://stream.asphaltguard.online/gps",
                );
                if (!res.ok) throw new Error("fetch failed");
                const data = await res.json();
                if (active) {
                    setGpsData(data);
                    if (data.valid) {
                        setGpsLastValid([data.latitude, data.longitude]);
                    }
                }
            } catch {
                if (active) setGpsData(null);
            }
        };
        const pollThermal = async () => {
            try {
                const res = await fetch(
                    "https://stream.asphaltguard.online/api/thermal/raw",
                );
                if (!res.ok) throw new Error("fetch failed");
                const data = await res.json();
                const meanC =
                    typeof data.mean_c === "number"
                        ? data.mean_c
                        : typeof data.mean === "number"
                          ? data.mean
                          : null;
                if (active && !data.error && meanC !== null) {
                    setThermalMeanC(meanC);
                }
            } catch {
                if (active) setThermalMeanC(null);
            }
        };
        const pollRccar = async () => {
            try {
                const res = await fetch(
                    "https://stream.asphaltguard.online/rccar",
                );
                if (!res.ok) throw new Error("fetch failed");
                const data = await res.json();
                if (!active) return;
                setRcCarLive(parseRccarLiveResponse(data));
            } catch {
                if (active) setRcCarLive(null);
            }
        };
        pollGps();
        pollThermal();
        pollRccar();
        const interval = setInterval(() => {
            pollGps();
            pollThermal();
            pollRccar();
        }, 2000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const loadCaptures = async () => {
            const { data } = await supabase
                .from("captures")
                .select(CAPTURE_LIST_SELECT)
                .eq("gps_valid", true)
                .order("captured_at", { ascending: false });
            if (data) setCaptures(data as CaptureRow[]);
        };
        loadCaptures();
    }, []);

    const liveAsphaltCondition = (() => {
        const meanC = thermalMeanC;
        if (meanC == null) {
            return { label: "-", color: null as string | null, analysis: "-" };
        }
        const { label, color } = getConditionFromMaxTemp(meanC);
        const temp = meanC.toFixed(1);
        let analysis: string;
        if (meanC <= 50) {
            analysis = `At ${temp}°C, surface heat is within the good range (≤50°C), so the pavement shows minimal aging stress.`;
        } else if (meanC <= 60) {
            analysis = `At ${temp}°C, surface heat is in the fair range (51–60°C), so mild warming may be starting to age the asphalt.`;
        } else if (meanC <= 70) {
            analysis = `At ${temp}°C, surface heat is in the deteriorating range (61–70°C), so heat stress is accelerating pavement wear.`;
        } else {
            analysis = `At ${temp}°C, surface heat exceeds 70°C, so the pavement is under critical heat stress and needs attention.`;
        }
        return { label: label.toUpperCase(), color, analysis };
    })();

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-gray-950">
            {!authChecked && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                </div>
            )}

            <div
                className={`relative h-full w-full transition-opacity duration-500 ease-out ${
                    authChecked && contentVisible
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                }`}
            >
            {/* Top Left Buttons */}
            <div className="absolute top-4 left-4 z-1000 flex flex-col gap-3">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="group flex h-12 min-w-12 max-w-12 items-center rounded-full px-3 bg-gray-900 shadow-lg hover:max-w-56 hover:scale-110 hover:bg-gray-800 hover:shadow-xl cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
                >
                    <ChevronLeft
                        size={22}
                        className="text-white shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-x-0.5"
                    />
                    <span className="whitespace-nowrap text-sm font-medium text-white ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] delay-200">
                        Back
                    </span>
                </button>
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
                        panelVisible
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="p-5 flex flex-col">
                        <h2 className="text-lg font-semibold text-white mb-1">
                            {activePanel}
                        </h2>

                        <div className="mt-3 flex-1 flex flex-col">
                            <MapCaptureList
                                captures={captures}
                                onSelect={openCaptureDetail}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Live Feed Panel */}
            <div
                className={`absolute top-4 right-4 z-998 flex h-[calc(100vh-2rem)] w-[30rem] flex-col overflow-hidden rounded-2xl bg-gray-900/95 shadow-2xl backdrop-blur-md transition-opacity duration-200 ease-in-out ${
                    selectedCapture && detailVisible
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                }`}
            >
                <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
                    <div className="flex shrink-0 items-center gap-2">
                        <Video size={18} className="text-blue-400" />
                        <h2 className="text-sm font-semibold text-white">
                            Live Feed
                        </h2>
                    </div>

                    <div className="shrink-0 rounded-lg border border-gray-700/50 bg-gray-800/70 p-2.5">
                        <div className="mb-1.5 flex items-center gap-2">
                            <Road size={14} className="text-gray-400" />
                            <p className="text-xs text-gray-400 uppercase font-medium">
                                Asphalt Condition
                            </p>
                        </div>
                        {liveAsphaltCondition.color ? (
                            <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase text-white ${liveAsphaltCondition.color}`}
                            >
                                {liveAsphaltCondition.label}
                            </span>
                        ) : (
                            <p className="text-base font-bold text-white">
                                {liveAsphaltCondition.label}
                            </p>
                        )}
                        <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-gray-500">
                            Analysis: {liveAsphaltCondition.analysis}
                        </p>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-2">
                        <div className="rounded-lg border border-gray-700/50 bg-gray-800/70 p-2">
                            <div className="mb-1 flex items-center gap-1.5">
                                <Drone size={14} className="text-gray-400" />
                                <p className="text-[10px] text-gray-400 uppercase font-medium">
                                    Drone
                                </p>
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase">
                                Temp Data
                            </p>
                            <p className="text-base font-bold text-white">
                                {thermalMeanC !== null
                                    ? `${thermalMeanC.toFixed(1)}°C`
                                    : "—"}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-700/50 bg-gray-800/70 p-2">
                            <div className="mb-1 flex items-center gap-1.5">
                                <Car size={14} className="text-gray-400" />
                                <p className="text-[10px] text-gray-400 uppercase font-medium">
                                    RC Car
                                </p>
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase">
                                Temp Data
                            </p>
                            <p className="text-base font-bold text-white">
                                {rcCarLive?.temperature_c !== null &&
                                rcCarLive?.temperature_c !== undefined
                                    ? `${rcCarLive.temperature_c.toFixed(1)}°C`
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                        <div>
                            <p className="mb-0.5 text-[10px] text-gray-500 uppercase">
                                Camera
                            </p>
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                                <img
                                    src="https://stream.asphaltguard.online/video/camera"
                                    alt="Camera Feed"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="mb-0.5 text-[10px] text-gray-500 uppercase">
                                Thermal
                            </p>
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                                <img
                                    src="https://stream.asphaltguard.online/video/thermal"
                                    alt="Thermal Feed"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (gpsLastValid) setFlyTarget(gpsLastValid);
                        }}
                        disabled={!gpsLastValid}
                        className={`shrink-0 rounded-lg bg-gray-800/70 p-2 w-full text-left transition-all duration-150 ${
                            gpsLastValid
                                ? "hover:bg-gray-700/70 hover:scale-[1.02] hover:shadow-lg hover:ring-1 hover:ring-gray-600/50 cursor-pointer active:scale-[0.98]"
                                : "opacity-60"
                        }`}
                    >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-gray-400" />
                                <p className="text-[10px] text-gray-400 uppercase font-medium">
                                    GPS Status
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`inline-block h-2 w-2 rounded-full ${
                                        gpsData === null
                                            ? "bg-red-400"
                                            : gpsData.valid
                                              ? "bg-emerald-400 animate-pulse"
                                              : "bg-yellow-400 animate-pulse"
                                    }`}
                                />
                                <span
                                    className={`text-[10px] font-medium ${
                                        gpsData === null
                                            ? "text-red-400"
                                            : gpsData.valid
                                              ? "text-emerald-400"
                                              : "text-yellow-400"
                                    }`}
                                >
                                    {gpsData === null
                                        ? "No Connection"
                                        : gpsData.valid
                                          ? "GPS Fix Active"
                                          : "No Fix"}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[10px] text-gray-500">
                                    Latitude
                                </p>
                                <p className="text-xs font-mono text-white">
                                    {gpsData?.valid
                                        ? gpsData.latitude.toFixed(6)
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500">
                                    Longitude
                                </p>
                                <p className="text-xs font-mono text-white">
                                    {gpsData?.valid
                                        ? gpsData.longitude.toFixed(6)
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Capture Detail Panel */}
            {selectedCapture && (
                <div
                    className={`absolute top-4 right-4 z-999 w-96 max-h-[calc(100vh-2rem)] rounded-2xl bg-gray-900/95 backdrop-blur-md shadow-2xl overflow-y-auto transition-opacity duration-200 ease-in-out ${
                        detailVisible
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="p-5">
                        <MapCaptureDetail
                            capture={selectedCapture}
                            onClose={closeCaptureDetail}
                        />
                    </div>
                </div>
            )}

            <MapContainer
                center={PSU_CENTER}
                zoom={16}
                maxZoom={25}
                className="absolute inset-0 z-0 h-full w-full"
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={25}
                    maxNativeZoom={19}
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
                {gpsLastValid && (
                    <Marker
                        position={gpsLastValid}
                        icon={gpsData?.valid ? gpsActiveIcon : gpsStaleIcon}
                    >
                        <Popup>
                            {gpsData?.valid
                                ? "GPS Device (Active)"
                                : "GPS Device (Last Known)"}
                        </Popup>
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
        </div>
    );
}
