import { useEffect, useRef, useState } from "react";
import SideNavigation from "../components/SideNavigation";
import { getUserByUID, supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Video, Wifi } from "lucide-react";

type UsersRow = { username?: string | null };

type FeedStatus = "loading" | "online" | "error";

const feeds = [
    {
        id: "feed-1",
        label: "Live Detection",
        url: "https://stream.asphaltguard.online/stream/dual",
    },
    {
        id: "feed-2",
        label: "Thermal Imaging",
        url: "https://stream.asphaltguard.online/stream/thermal",
    },
];

const RETRY_DELAY_MS = 3000;

function LiveFeed() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UsersRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [feedStatus, setFeedStatus] = useState<Record<string, FeedStatus>>(
        () =>
            feeds.reduce(
                (acc, feed) => {
                    acc[feed.id] = "loading";
                    return acc;
                },
                {} as Record<string, FeedStatus>,
            ),
    );
    const [feedReloadKey, setFeedReloadKey] = useState<Record<string, number>>(
        () =>
            feeds.reduce(
                (acc, feed) => {
                    acc[feed.id] = 0;
                    return acc;
                },
                {} as Record<string, number>,
            ),
    );

    // Track per-feed retry timers so we can cancel them on success/unmount.
    const retryTimeoutsRef = useRef<Record<string, number>>({});

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

    // Cancel any pending retry timers on unmount.
    useEffect(() => {
        const timers = retryTimeoutsRef.current;
        return () => {
            Object.values(timers).forEach((id) => window.clearTimeout(id));
        };
    }, []);

    const clearRetry = (id: string) => {
        const existing = retryTimeoutsRef.current[id];
        if (existing) {
            window.clearTimeout(existing);
            delete retryTimeoutsRef.current[id];
        }
    };

    const scheduleRetry = (id: string) => {
        clearRetry(id);
        retryTimeoutsRef.current[id] = window.setTimeout(() => {
            delete retryTimeoutsRef.current[id];
            // Bump the cache-buster so the <img> remounts and opens a fresh
            // connection; flip to "loading" so the UI shows the spinner while
            // we wait for the next onLoad or onError.
            setFeedReloadKey((prev) => ({
                ...prev,
                [id]: (prev[id] ?? 0) + 1,
            }));
            setFeedStatus((prev) => ({ ...prev, [id]: "loading" }));
        }, RETRY_DELAY_MS);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleImgLoad = (id: string) => {
        clearRetry(id);
        setFeedStatus((prev) =>
            prev[id] === "online" ? prev : { ...prev, [id]: "online" },
        );
    };

    const handleImgError = (id: string) => {
        setFeedStatus((prev) =>
            prev[id] === "error" ? prev : { ...prev, [id]: "error" },
        );
        scheduleRetry(id);
    };

    const anyOnline = Object.values(feedStatus).some((s) => s === "online");

    return (
        <div className="flex h-screen overflow-hidden font-sans bg-gray-50 flex-col p-5">
            {/* Header */}
            <div
                className="flex justify-between items-center p-5 rounded-lg shadow-md border border-[#e0e0e0] bg-white"
                style={{ margin: "0 10px 10px 10px" }}
            >
                <div className="flex gap-2.5">
                    <img
                        src="/asphaltguard-favicon.svg"
                        alt="AsphaltGuard logo"
                        className="h-6 w-6"
                    />
                    <p>AsphaltGuard</p>
                </div>
                <p>Live Feed</p>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-5 min-h-0 overflow-hidden">
                {/* Navigation Sidebar */}
                <div style={{ margin: "10px", minWidth: "fit-content" }}>
                    <SideNavigation
                        onNavigate={handleNavigation}
                        activePath="live-feed"
                    />
                </div>

                {/* Main Content */}
                <div
                    className="flex-1 min-h-0 min-w-0 bg-white rounded-lg shadow-md border border-[#e0e0e0] p-5 overflow-hidden"
                    style={{ margin: "10px" }}
                >
                    <div className="flex h-full min-h-0 flex-col gap-4">
                        <div className="flex items-center justify-between shrink-0">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Welcome back,
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {user?.username?.trim() || "Guest"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                        anyOnline
                                            ? "bg-red-500 animate-pulse"
                                            : "bg-gray-300"
                                    }`}
                                    aria-hidden
                                />
                                <p className="text-sm font-medium text-gray-700">
                                    {anyOnline ? "Live" : "Offline"}
                                </p>
                            </div>
                        </div>

                        <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 md:grid-cols-2">
                            {feeds.map((feed) => {
                                const status = feedStatus[feed.id];
                                const reloadKey = feedReloadKey[feed.id] ?? 0;
                                const streamSrc =
                                    reloadKey > 0
                                        ? `${feed.url}?_=${reloadKey}`
                                        : feed.url;
                                return (
                                    <div
                                        key={feed.id}
                                        className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-gray-200"
                                    >
                                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Video
                                                    size={18}
                                                    className="text-gray-700"
                                                />
                                                <p className="text-base font-medium text-gray-900">
                                                    {feed.label}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${
                                                        status === "online"
                                                            ? "bg-red-500 animate-pulse"
                                                            : status === "error"
                                                              ? "bg-gray-400"
                                                              : "bg-yellow-400"
                                                    }`}
                                                    aria-hidden
                                                />
                                                <p className="text-xs font-medium text-gray-600">
                                                    {status === "online"
                                                        ? "Live"
                                                        : status === "error"
                                                          ? "Offline"
                                                          : "Connecting"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative flex flex-1 min-h-0 items-center justify-center bg-gray-900">
                                            <img
                                                key={reloadKey}
                                                src={streamSrc}
                                                alt={feed.label}
                                                onLoad={() =>
                                                    handleImgLoad(feed.id)
                                                }
                                                onError={() =>
                                                    handleImgError(feed.id)
                                                }
                                                className={`h-full w-full object-contain ${
                                                    status === "online"
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                }`}
                                            />
                                            {status !== "online" && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {status === "loading" ? (
                                                        <div className="text-center">
                                                            <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                                                            <p className="text-sm text-gray-200">
                                                                Connecting to
                                                                stream...
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center px-6">
                                                            <Wifi
                                                                size={40}
                                                                className="mx-auto mb-3 text-gray-500"
                                                            />
                                                            <p className="text-sm text-gray-300">
                                                                Stream is offline
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Retrying
                                                                automatically...
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] z-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                </div>
            )}
        </div>
    );
}

export default LiveFeed;
