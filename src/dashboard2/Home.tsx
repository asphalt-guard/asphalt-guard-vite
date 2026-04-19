import { useEffect, useState } from "react";
import SideNavigation from "../components/SideNavigation";
import { getUserByUID, supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

type UsersRow = { username?: string | null };

function DashboardLayout() {
    const navigate = useNavigate();
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

            const { data: scans } = await supabase
                .from("scan_history")
                .select("*")
                .order("created_at", { ascending: false });

            type ScanRow = {
                pothole_count?: number | null;
                created_at: string;
            };

            if (scans && scans.length > 0) {
                const totalInspected = scans.length;
                let totalDefects = 0;
                let good = 0,
                    fair = 0,
                    deteriorating = 0,
                    critical = 0;

                (scans as ScanRow[]).forEach((scan) => {
                    const count = scan.pothole_count || 0;
                    totalDefects += count;

                    if (count === 0) good++;
                    else if (count === 1) fair++;
                    else if (count === 2) deteriorating++;
                    else if (count >= 3) critical++;
                });

                const latest = new Date((scans as ScanRow[])[0].created_at);
                const formattedTime = `${latest.toLocaleDateString()} ${latest.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

                setStats({
                    totalInspected,
                    totalDefects,
                    good,
                    fair,
                    deteriorating,
                    critical,
                    latestTime: formattedTime,
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
                });
            }

            setLoading(false);
        };

        initDashboard();
    }, []);

    const conditionBreakdown = [
        {
            label: "Good Conditions",
            value: stats.good,
            color: "bg-emerald-500",
        },
        { label: "Fair Conditions", value: stats.fair, color: "bg-yellow-500" },
        {
            label: "Deteriorating Conditions",
            value: stats.deteriorating,
            color: "bg-orange-500",
        },
        {
            label: "Critical Conditions",
            value: stats.critical,
            color: "bg-red-500",
        },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const defectRate =
        stats.totalInspected > 0
            ? (stats.totalDefects / stats.totalInspected).toFixed(2)
            : "0.00";

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
                <p>Dashboard</p>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-5 min-h-0 overflow-hidden">
                {/* Navigation Sidebar */}
                <div style={{ margin: "10px", minWidth: "fit-content" }}>
                    <SideNavigation
                        onNavigate={handleNavigation}
                        activePath="dashboard"
                    />
                </div>

                {/* Main Content */}
                <div
                    className="flex-1 min-h-0 min-w-0 bg-white rounded-lg shadow-md border border-[#e0e0e0] p-5 overflow-y-auto"
                    style={{ margin: "10px" }}
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Welcome back,
                                </p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {user?.username?.trim() || "Guest"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">
                                    Latest Inspection
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {stats.latestTime}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {[
                                {
                                    title: "Total Inspected Areas",
                                    value: stats.totalInspected,
                                },
                                {
                                    title: "Total Detected Defects",
                                    value: stats.totalDefects,
                                },
                                { title: "Good Conditions", value: stats.good },
                                {
                                    title: "Critical Conditions",
                                    value: stats.critical,
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                >
                                    <p className="text-sm text-gray-600">
                                        {item.title}
                                    </p>
                                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <p className="text-base font-medium text-gray-900 mb-4">
                                Condition Breakdown
                            </p>
                            <div className="space-y-4">
                                {conditionBreakdown.map((item) => {
                                    const percentage =
                                        stats.totalInspected > 0
                                            ? Math.round(
                                                  (item.value /
                                                      stats.totalInspected) *
                                                      100,
                                              )
                                            : 0;

                                    return (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-700">
                                                    {item.label}
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {item.value} ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                                <div
                                                    className={`h-2 rounded-full ${item.color}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <p className="text-base font-medium text-gray-900 mb-4">
                                    Dashboard Summary
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded bg-gray-50 border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            Fair Conditions
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {stats.fair}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded bg-gray-50 border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            Deteriorating Conditions
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {stats.deteriorating}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded bg-gray-50 border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            Latest Inspection
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {stats.latestTime}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <p className="text-base font-medium text-gray-900 mb-4">
                                    Defect Rate
                                </p>
                                <div className="h-44 w-full bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col justify-center">
                                    <p className="text-sm text-gray-600">
                                        Average defects per inspected area
                                    </p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">
                                        {defectRate}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Based on the recent data
                                    </p>
                                </div>
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

export default DashboardLayout;
