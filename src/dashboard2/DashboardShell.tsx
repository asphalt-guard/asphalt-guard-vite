import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SideNavigation from "../components/SideNavigation";

const NAV_FADE_MS = 300;

type DashboardShellProps = {
    title: string;
    activePath: string;
    loading?: boolean;
    children: ReactNode;
    contentClassName?: string;
};

export default function DashboardShell({
    title,
    activePath,
    loading = false,
    children,
    contentClassName = "",
}: DashboardShellProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [contentVisible, setContentVisible] = useState(false);
    const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (loading) {
            setContentVisible(false);
            return;
        }

        setContentVisible(false);
        const frame = requestAnimationFrame(() => setContentVisible(true));
        return () => cancelAnimationFrame(frame);
    }, [loading, location.pathname]);

    useEffect(() => {
        return () => {
            if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
        };
    }, []);

    const handleNavigate = useCallback(
        (path: string) => {
            if (path === location.pathname) return;

            setContentVisible(false);
            if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
            navTimeoutRef.current = window.setTimeout(() => {
                navigate(path);
            }, NAV_FADE_MS);
        },
        [location.pathname, navigate],
    );

    return (
        <div className="relative flex h-screen overflow-hidden bg-gray-950 font-sans">
            <aside className="flex w-56 shrink-0 flex-col gap-4 p-4">
                <div className="flex items-center gap-2.5 px-2">
                    <img
                        src="/asphaltguard-favicon.svg"
                        alt="AsphaltGuard"
                        className="h-7 w-7"
                    />
                    <span className="text-sm font-semibold text-white">
                        AsphaltGuard
                    </span>
                </div>
                <SideNavigation
                    onNavigate={handleNavigate}
                    activePath={activePath}
                />
            </aside>

            <main
                className={`flex min-h-0 min-w-0 flex-1 flex-col p-4 pl-0 transition-opacity duration-300 ease-out ${
                    contentVisible
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-gray-900/95 shadow-2xl backdrop-blur-md">
                    <header className="shrink-0 border-b border-gray-800 px-6 py-4">
                        <h1 className="text-lg font-semibold text-white">
                            {title}
                        </h1>
                    </header>
                    <div
                        className={`min-h-0 flex-1 overflow-y-auto p-6 ${contentClassName}`}
                    >
                        {children}
                    </div>
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
