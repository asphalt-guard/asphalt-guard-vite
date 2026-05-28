import { LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "./DashboardShell";
import { getUserByUID, logOut, supabase } from "../lib/supabase";

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
    const [loggingOut, setLoggingOut] = useState(false);

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

    const handleLogOut = async () => {
        setLoggingOut(true);
        if (await logOut()) {
            navigate("/login", { replace: true });
        } else {
            setLoggingOut(false);
        }
    };

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

    return (
        <DashboardShell title="Account" activePath="account" loading={loading}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-lg font-semibold text-white">
                        {profileInitials}
                    </div>
                    <p className="text-sm font-medium text-white">{displayName}</p>
                    <p className="text-xs text-gray-400">{displayRole}</p>
                </div>

                <div className="space-y-2">
                    <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="break-all text-sm text-gray-200">
                            {displayEmail}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="text-sm text-gray-200">{displayUsername}</p>
                    </div>
                    <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm text-gray-200">{displayPhone}</p>
                    </div>
                    <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                        <p className="text-xs text-gray-500">User ID</p>
                        <p className="break-all font-mono text-xs text-gray-200">
                            {displayUserId}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gray-800/70 px-3 py-2">
                        <p className="text-xs text-gray-500">Account created</p>
                        <p className="text-sm text-gray-200">
                            {formatDateTime(user?.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleLogOut}
                        disabled={loggingOut}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-red-800/40 bg-red-950/40 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <LogOut size={12} aria-hidden />
                        {loggingOut ? "Logging out…" : "Log out"}
                    </button>
                </div>
            </div>
        </DashboardShell>
    );
}

export default Account;
