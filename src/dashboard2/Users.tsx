import { useEffect, useState } from "react";
import DashboardShell from "./DashboardShell";
import { supabase } from "../lib/supabase";

type UserListRow = {
    user_id: string;
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
    role?: string | null;
};

function displayName(row: UserListRow) {
    const name = row.full_name?.trim();
    if (name) return name;
    const u = row.username?.trim();
    if (u) return u;
    const e = row.email?.trim();
    if (e) return e;
    return row.user_id ? `${row.user_id.slice(0, 8)}…` : "—";
}

function userInitials(row: UserListRow) {
    const source =
        row.full_name?.trim() || row.username?.trim() || "?";
    return source
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

function Users() {
    const [rows, setRows] = useState<UserListRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            setLoadError(null);

            const { data, error } = await supabase
                .from("users")
                .select("user_id, full_name, username, email, role")
                .order("username", { ascending: true });

            if (error) {
                setLoadError(error.message);
                setRows([]);
            } else {
                setRows((data ?? []) as UserListRow[]);
            }

            setLoading(false);
        };

        loadUsers();
    }, []);

    return (
        <DashboardShell title="Users" activePath="users" loading={loading}>
            <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-500">
                    {rows.length}{" "}
                    {rows.length === 1 ? "user" : "users"} registered
                </p>

                {loadError ? (
                    <div
                        className="rounded-lg border border-red-800/30 bg-red-950/50 px-4 py-3 text-sm text-red-300"
                        role="alert"
                    >
                        Could not load users: {loadError}
                    </div>
                ) : null}

                {rows.length === 0 && !loadError ? (
                    <p className="text-sm text-gray-400">No users found.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {rows.map((row) => (
                            <div
                                key={row.user_id}
                                className="rounded-lg bg-gray-800/70 p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-semibold text-white">
                                        {userInitials(row)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-white">
                                            {displayName(row)}
                                        </p>
                                        <p className="truncate text-[11px] text-gray-400">
                                            {row.email?.trim() || "—"}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-300">
                                        {row.role?.trim() || "—"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

export default Users;
