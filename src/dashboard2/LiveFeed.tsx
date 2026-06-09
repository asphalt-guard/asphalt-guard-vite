import { useEffect, useRef, useState } from "react";
import { Video, Wifi } from "lucide-react";
import ThermalGrid from "../components/ThermalGrid";
import DashboardShell from "./DashboardShell";
import { parseThermalRawResponse } from "../lib/captureUtils";
import { getUserByUID, supabase } from "../lib/supabase";

type UsersRow = { username?: string | null };

type FeedStatus = "loading" | "online" | "error";

const CAMERA_FEED_URL = "https://stream.asphaltguard.online/video/camera";
const THERMAL_RAW_URL =
    "https://stream.asphaltguard.online/api/thermal/raw";
const THERMAL_POLL_MS = 2000;

const RETRY_DELAY_MS = 3000;

function LiveFeed() {
    const [user, setUser] = useState<UsersRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [cameraStatus, setCameraStatus] = useState<FeedStatus>("loading");
    const [thermalStatus, setThermalStatus] = useState<FeedStatus>("loading");
    const [thermalGrid, setThermalGrid] = useState<number[][] | null>(null);
    const [cameraReloadKey, setCameraReloadKey] = useState(0);

    const cameraRetryRef = useRef<number | null>(null);

    useEffect(() => {
        const initLiveFeed = async () => {
            setLoading(true);

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                const userData = (await getUserByUID(
                    session.user.id,
                )) as UsersRow | null;
                setUser(userData);
            } else {
                setUser(null);
            }

            setLoading(false);
        };

        initLiveFeed();
    }, []);

    useEffect(() => {
        let active = true;

        const pollThermal = async () => {
            try {
                const res = await fetch(THERMAL_RAW_URL);
                if (!res.ok) throw new Error("fetch failed");
                const parsed = parseThermalRawResponse(await res.json());
                if (!active) return;
                if (parsed) {
                    setThermalGrid(parsed.grid);
                    setThermalStatus("online");
                } else {
                    setThermalGrid(null);
                    setThermalStatus("error");
                }
            } catch {
                if (!active) return;
                setThermalGrid(null);
                setThermalStatus("error");
            }
        };

        pollThermal();
        const interval = window.setInterval(pollThermal, THERMAL_POLL_MS);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (cameraRetryRef.current) {
                window.clearTimeout(cameraRetryRef.current);
            }
        };
    }, []);

    const clearCameraRetry = () => {
        if (cameraRetryRef.current) {
            window.clearTimeout(cameraRetryRef.current);
            cameraRetryRef.current = null;
        }
    };

    const scheduleCameraRetry = () => {
        clearCameraRetry();
        cameraRetryRef.current = window.setTimeout(() => {
            cameraRetryRef.current = null;
            setCameraReloadKey((prev) => prev + 1);
            setCameraStatus("loading");
        }, RETRY_DELAY_MS);
    };

    const handleCameraLoad = () => {
        clearCameraRetry();
        setCameraStatus((prev) => (prev === "online" ? prev : "online"));
    };

    const handleCameraError = () => {
        setCameraStatus((prev) => (prev === "error" ? prev : "error"));
        scheduleCameraRetry();
    };

    const anyOnline = cameraStatus === "online" || thermalStatus === "online";
    const cameraSrc =
        cameraReloadKey > 0
            ? `${CAMERA_FEED_URL}?_=${cameraReloadKey}`
            : CAMERA_FEED_URL;

    return (
        <DashboardShell
            title="Live Feed"
            activePath="live-feed"
            loading={loading}
            contentClassName="!p-4"
        >
            <div className="flex h-full min-h-0 flex-col gap-4">
                <div className="flex shrink-0 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Video size={18} className="text-blue-400" />
                        <div>
                            <p className="text-xs text-gray-400">Welcome back,</p>
                            <p className="text-sm font-semibold text-white">
                                {user?.username?.trim() || "Guest"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={`h-2 w-2 rounded-full ${
                                anyOnline
                                    ? "animate-pulse bg-emerald-400"
                                    : "bg-red-400"
                            }`}
                            aria-hidden
                        />
                        <p className="text-xs font-medium text-gray-400">
                            {anyOnline ? "Live" : "Offline"}
                        </p>
                    </div>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex min-h-0 flex-col gap-2">
                        <p className="text-[10px] uppercase text-gray-500">
                            Camera
                        </p>
                        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-black aspect-video">
                            <img
                                key={cameraReloadKey}
                                src={cameraSrc}
                                alt="Camera"
                                onLoad={handleCameraLoad}
                                onError={handleCameraError}
                                className={`h-full w-full object-cover ${
                                    cameraStatus === "online"
                                        ? "opacity-100"
                                        : "opacity-0"
                                }`}
                            />
                            {cameraStatus !== "online" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {cameraStatus === "loading" ? (
                                        <div className="text-center">
                                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                                            <p className="text-sm text-gray-400">
                                                Connecting…
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="px-6 text-center">
                                            <Wifi
                                                size={32}
                                                className="mx-auto mb-2 text-gray-500"
                                            />
                                            <p className="text-sm text-gray-400">
                                                Stream offline
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Retrying automatically…
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    cameraStatus === "online"
                                        ? "animate-pulse bg-emerald-400"
                                        : cameraStatus === "error"
                                          ? "bg-red-400"
                                          : "animate-pulse bg-yellow-400"
                                }`}
                                aria-hidden
                            />
                            <p className="text-xs text-gray-500">
                                {cameraStatus === "online"
                                    ? "Live"
                                    : cameraStatus === "error"
                                      ? "Offline"
                                      : "Connecting"}
                            </p>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col gap-2">
                        <p className="text-[10px] uppercase text-gray-500">
                            Thermal Camera
                        </p>
                        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-black aspect-video">
                            {thermalGrid ? (
                                <ThermalGrid grid={thermalGrid} invert />
                            ) : null}
                            {thermalStatus !== "online" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {thermalStatus === "loading" ? (
                                        <div className="text-center">
                                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                                            <p className="text-sm text-gray-400">
                                                Connecting…
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="px-6 text-center">
                                            <Wifi
                                                size={32}
                                                className="mx-auto mb-2 text-gray-500"
                                            />
                                            <p className="text-sm text-gray-400">
                                                Stream offline
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Retrying automatically…
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    thermalStatus === "online"
                                        ? "animate-pulse bg-emerald-400"
                                        : thermalStatus === "error"
                                          ? "bg-red-400"
                                          : "animate-pulse bg-yellow-400"
                                }`}
                                aria-hidden
                            />
                            <p className="text-xs text-gray-500">
                                {thermalStatus === "online"
                                    ? "Live"
                                    : thermalStatus === "error"
                                      ? "Offline"
                                      : "Connecting"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

export default LiveFeed;
