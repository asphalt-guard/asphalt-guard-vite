import { useEffect, useState } from "react";
import SideNavigation from "../components/SideNavigation";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

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

function Users() {
    const navigate = useNavigate();
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
                <p>Users</p>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-5 min-h-0 overflow-hidden">
                <div style={{ margin: "10px", minWidth: "fit-content" }}>
                    <SideNavigation onNavigate={handleNavigation} activePath="users" />
                </div>

                <div
                    className="flex-1 min-h-0 min-w-0 bg-white rounded-lg shadow-md border border-[#e0e0e0] p-5 sm:p-6 overflow-y-auto"
                    style={{ margin: "10px" }}
                >
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Directory</p>
                            <p className="text-2xl font-semibold text-gray-900">All users</p>
                            <p className="mt-1 text-sm text-gray-600">
                                Accounts registered in the system with their assigned roles.
                            </p>
                        </div>

                        {loadError ? (
                            <div
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                                role="alert"
                            >
                                Could not load users: {loadError}
                            </div>
                        ) : null}

                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-semibold text-gray-900"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-semibold text-gray-900"
                                        >
                                            Username
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-semibold text-gray-900"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-semibold text-gray-900"
                                        >
                                            Role
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {!loading && rows.length === 0 && !loadError ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-12 text-center text-gray-500"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.user_id} className="hover:bg-gray-50/80">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {displayName(row)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {row.username?.trim() || "—"}
                                                </td>
                                                <td className="max-w-56 truncate px-4 py-3 text-gray-700">
                                                    {row.email?.trim() || "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 ring-1 ring-inset ring-slate-200/80">
                                                        {row.role?.trim() || "—"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {!loading ? (
                            <p className="text-xs text-gray-500">
                                {rows.length} {rows.length === 1 ? "user" : "users"} total
                            </p>
                        ) : null}
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

export default Users;
