import { useEffect, useMemo, useState } from "react";
import SideNavigation from "../components/SideNavigation";
import { getUserByUID, supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

type UsersRow = {
    user_id: string;
    full_name?: string | null;
    role?: string | null;
    contact_number?: string | null;
    created_at?: string | null;
    username?: string | null;
    email?: string | null;
};

function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function Account() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UsersRow | null>(null);
    const [authEmail, setAuthEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAccount = async () => {
            setLoading(true);
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) {
                setUser(null);
                setAuthEmail(null);
                setLoading(false);
                return;
            }

            setAuthEmail(session.user.email ?? null);
            const row = (await getUserByUID(session.user.id)) as UsersRow | null;
            setUser(row);
            setLoading(false);
        };

        loadAccount();
    }, []);

    const displayEmail = user?.email?.trim() || authEmail || "—";
    const displayName = user?.full_name?.trim() || user?.username?.trim() || "—";
    const displayRole = user?.role?.trim() || "—";
    const displayPhone = user?.contact_number?.trim() || "—";
    const displayUsername = user?.username?.trim() || "—";
    const displayUserId = user?.user_id?.trim() || "—";

    const profileInitials = useMemo(() => {
        const source = user?.full_name?.trim() || user?.username?.trim() || "";
        if (!source) return "?";
        return source
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");
    }, [user?.full_name, user?.username]);

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
                <p>Account</p>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-5 min-h-0 overflow-hidden">
                {/* Navigation Sidebar */}
                <div style={{ margin: "10px", minWidth: "fit-content" }}>
                    <SideNavigation onNavigate={handleNavigation} activePath="account" />
                </div>

                {/* Main Content */}
                <div
                    className="flex-1 min-h-0 min-w-0 bg-white rounded-lg shadow-md border border-[#e0e0e0] p-5 overflow-y-auto"
                    style={{ margin: "10px" }}
                >
                    <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Manage your account</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    Account Settings
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4 xl:col-span-1">
                                <p className="text-sm font-medium text-gray-900 mb-4">Profile</p>
                                <div className="flex flex-col items-center gap-3 mb-5">
                                    <div className="h-24 w-24 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-lg font-semibold text-gray-600">
                                        {profileInitials}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-900">
                                            {displayName}
                                        </p>
                                        <p className="text-xs text-gray-500">{displayRole}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm text-gray-800 break-all">{displayEmail}</p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Contact number</p>
                                        <p className="text-sm text-gray-800">{displayPhone}</p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Username</p>
                                        <p className="text-sm text-gray-800">{displayUsername}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4 xl:col-span-2">
                                <p className="text-sm font-medium text-gray-900 mb-4">
                                    Personal Information
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Full name</p>
                                        <p className="text-sm text-gray-800">{displayName}</p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Role</p>
                                        <p className="text-sm text-gray-800">{displayRole}</p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Username</p>
                                        <p className="text-sm text-gray-800">{displayUsername}</p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm text-gray-800 break-all">{displayEmail}</p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 md:col-span-2">
                                        <p className="text-xs text-gray-500">Contact number</p>
                                        <p className="text-sm text-gray-800">{displayPhone}</p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 md:col-span-2">
                                        <p className="text-xs text-gray-500">User ID</p>
                                        <p className="text-xs text-gray-800 font-mono break-all">
                                            {displayUserId}
                                        </p>
                                    </div>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                                        <p className="text-xs text-gray-500">Account created</p>
                                        <p className="text-sm text-gray-800">
                                            {formatDateTime(user?.created_at)}
                                        </p>
                                    </div>
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

export default Account;
