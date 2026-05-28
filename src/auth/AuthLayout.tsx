import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const inputClassName =
    "w-full rounded-lg border border-gray-700 bg-gray-800/70 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const labelClassName = "text-xs font-medium text-gray-400";

export { inputClassName, labelClassName };

type AuthLayoutProps = {
    children: ReactNode;
    headerLink?: { to: string; label: string };
    loading?: boolean;
};

export default function AuthLayout({
    children,
    headerLink,
    loading = false,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-950 font-sans">
            <header className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <img
                        src="/asphaltguard-favicon.svg"
                        alt="AsphaltGuard"
                        className="h-7 w-7"
                    />
                    <span className="text-sm font-semibold text-white">
                        AsphaltGuard
                    </span>
                </div>
                {headerLink ? (
                    <Link
                        to={headerLink.to}
                        className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                    >
                        {headerLink.label}
                    </Link>
                ) : null}
            </header>

            <main className="flex flex-1 items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/95 p-8 shadow-2xl backdrop-blur-md">
                    {children}
                </div>
            </main>

            {loading ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                </div>
            ) : null}
        </div>
    );
}
