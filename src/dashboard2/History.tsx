import { useEffect, useState } from "react";
import SideNavigation from "../components/SideNavigation";
import ScanHistoryCard from "../components/ScanHistoryCard";
import { getUserByUID, supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

type UsersRow = { username?: string | null };

/** Fields used by `ScanHistoryCard` from `scan_history` */
type ScanHistoryRow = {
    id: string | number;
    created_at: string;
    annotated_img_url: string;
    pothole_count?: number | null;
};

function History() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UsersRow | null>(null);
    const [scans, setScans] = useState<ScanHistoryRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initHistory = async () => {
            setLoading(true);

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                const userData = (await getUserByUID(session.user.id)) as UsersRow | null;
                setUser(userData);

                const { data, error } = await supabase
                    .from("scan_history")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (!error && data) {
                    setScans(data as ScanHistoryRow[]);
                } else {
                    setScans([]);
                }
            } else {
                setUser(null);
                setScans([]);
            }

            setLoading(false);
        };

        initHistory();
    }, []);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

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
                <p>History</p>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-5 min-h-0 overflow-hidden">
                {/* Navigation Sidebar */}
                <div style={{ margin: "10px", minWidth: "fit-content" }}>
                    <SideNavigation onNavigate={handleNavigation} activePath="history" />
                </div>

                {/* Main Content */}
                <div
                    className="flex-1 min-h-0 min-w-0 bg-white rounded-lg shadow-md border border-[#e0e0e0] p-5 sm:p-6 overflow-y-auto"
                    style={{ margin: "10px" }}
                >
                    <div className="mx-auto flex h-full min-h-0 max-w-4xl flex-col gap-6">
                        {/* Intro + summary */}
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-linear-to-br from-white via-slate-50/90 to-emerald-50/40 px-5 py-6 shadow-sm sm:px-7 sm:py-7">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/12 blur-2xl"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -bottom-8 left-1/4 h-24 w-24 rounded-full bg-slate-400/8 blur-xl"
                            />
                            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-xl">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800/80">
                                        Scan history
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                        Inspection log
                                    </h2>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                        Past runs from the pothole scanner, newest first. Use this list to compare
                                        defect counts across sessions.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                                    {user?.username?.trim() ? (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/90 px-3.5 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm">
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
                                                aria-hidden
                                            />
                                            {user.username}
                                        </span>
                                    ) : null}
                                    <div className="flex min-w-34 items-baseline gap-2 rounded-2xl border border-gray-200/90 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-sm">
                                        <span className="text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
                                            {scans.length}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {scans.length === 1 ? "scan" : "scans"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List panel */}
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/90 shadow-inner">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/90 bg-white/95 px-4 py-3.5 sm:px-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Recorded scans</p>
                                    <p className="text-xs text-gray-500">Sorted by date · most recent at the top</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200/80">
                                    {scans.length} {scans.length === 1 ? "entry" : "entries"}
                                </span>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                                {scans.length > 0 ? (
                                    <ul className="flex flex-col gap-3">
                                        {scans.map((scan) => (
                                            <li
                                                key={String(scan.id)}
                                                className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/3 transition hover:border-gray-300 hover:shadow-md"
                                            >
                                                <div className="flex items-stretch gap-0">
                                                    <div
                                                        className="hidden w-1 shrink-0 bg-linear-to-b from-emerald-500 to-teal-600 sm:block"
                                                        aria-hidden
                                                    />
                                                    <div className="min-w-0 flex-1 p-1.5 sm:p-2">
                                                        <ScanHistoryCard scan={scan} />
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/80 px-6 py-14 text-center">
                                        <div
                                            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 shadow-inner"
                                            aria-hidden
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="h-7 w-7"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6.827 6.175A2.31 2.31 0 0 0 5.186 7.23c-.38.558-.647 1.186-.849 1.837a18.905 18.905 0 0 0 0 5.866c.203.651.47 1.279.85 1.838.19.281.423.537.696.752M6.827 6.175A2.31 2.31 0 0 1 8.47 5.118c.547-.07 1.09-.108 1.63-.108 4.418 0 8 3.403 8 7.99 0 1.65-.5 3.18-1.35 4.51M6.827 6.175C8.22 4.84 10.018 4 12 4c4.418 0 8 3.403 8 7.99 0 1.65-.5 3.18-1.35 4.51m0 0a17.904 17.904 0 0 1-8.005 2.047M18 17.75l2.35 2.35"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-base font-semibold text-gray-900">No scans yet</p>
                                        <p className="mt-1.5 max-w-sm text-sm text-gray-500">
                                            Run the AI pothole scanner to capture a road segment. Completed runs will
                                            appear here with previews and defect counts.
                                        </p>
                                    </div>
                                )}
                            </div>
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

export default History;
