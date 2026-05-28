import { useEffect, useRef, useState } from "react";
import { Video, Wifi } from "lucide-react";
import DashboardShell from "./DashboardShell";
import { getUserByUID, supabase } from "../lib/supabase";

type UsersRow = { username?: string | null };

type FeedStatus = "loading" | "online" | "error";

const feeds = [
    {
        id: "feed-1",
        label: "Camera",
        url: "https://stream.asphaltguard.online/video/camera",
    },
    {
        id: "feed-2",
        label: "Thermal Camera",
        url: "https://stream.asphaltguard.online/video/thermal",
    },
];

const RETRY_DELAY_MS = 3000;

function LiveFeed() {
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
            setFeedReloadKey((prev) => ({
                ...prev,
                [id]: (prev[id] ?? 0) + 1,
            }));
            setFeedStatus((prev) => ({ ...prev, [id]: "loading" }));
        }, RETRY_DELAY_MS);
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
                                className="flex min-h-0 flex-col gap-2"
                            >
                                <p className="text-[10px] uppercase text-gray-500">
                                    {feed.label}
                                </p>
                                <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-black aspect-video">
                                    <img
                                        key={reloadKey}
                                        src={streamSrc}
                                        alt={feed.label}
                                        onLoad={() => handleImgLoad(feed.id)}
                                        onError={() => handleImgError(feed.id)}
                                        className={`h-full w-full object-cover ${
                                            status === "online"
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                    {status !== "online" && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {status === "loading" ? (
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
                                            status === "online"
                                                ? "animate-pulse bg-emerald-400"
                                                : status === "error"
                                                  ? "bg-red-400"
                                                  : "animate-pulse bg-yellow-400"
                                        }`}
                                        aria-hidden
                                    />
                                    <p className="text-xs text-gray-500">
                                        {status === "online"
                                            ? "Live"
                                            : status === "error"
                                              ? "Offline"
                                              : "Connecting"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardShell>
    );
}

export default LiveFeed;
