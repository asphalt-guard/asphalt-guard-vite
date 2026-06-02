import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Map,
    Radio,
    Thermometer,
    User,
    Users,
    Cpu,
    History,
} from "lucide-react";

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

interface SideNavigationProps {
    onNavigate?: (path: string) => void;
    activePath?: string;
}

function SideNavigation({
    onNavigate,
    activePath = "dashboard",
}: SideNavigationProps) {
    const [activeItem, setActiveItem] = useState(activePath);

    useEffect(() => {
        setActiveItem(activePath);
    }, [activePath]);

    const navItems: NavItem[] = [
        {
            id: "map",
            label: "Map",
            icon: <Map size={20} />,
            path: "/map",
        },
        {
            id: "live-feed",
            label: "Live Feed",
            icon: <Radio size={20} />,
            path: "/live-feed",
        },
        {
            id: "dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/dashboard",
        },
        {
            id: "account",
            label: "Account",
            icon: <User size={20} />,
            path: "/account",
        },
        {
            id: "users",
            label: "Users",
            icon: <Users size={20} />,
            path: "/users",
        },
        {
            id: "models",
            label: "AI Models",
            icon: <Cpu size={20} />,
            path: "/ai-models",
        },
        {
            id: "thermal-sensors",
            label: "Thermal Sensors",
            icon: <Thermometer size={20} />,
            path: "/thermal-sensors",
        },
        {
            id: "history",
            label: "History",
            icon: <History size={20} />,
            path: "/history",
        },
    ];

    const handleClick = (item: NavItem) => {
        setActiveItem(item.id);
        onNavigate?.(item.path);
    };

    return (
        <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => handleClick(item)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        activeItem === item.id
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800/70 text-gray-300 hover:bg-gray-700/70 hover:text-white"
                    }`}
                >
                    <span className="flex shrink-0 items-center">
                        {item.icon}
                    </span>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}

export default SideNavigation;
