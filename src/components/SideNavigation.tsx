import { useState } from "react"
import {
	LayoutDashboard,
	User,
	Users,
	Cpu,
	History,
	Settings,
} from "lucide-react"

interface NavItem {
	id: string
	label: string
	icon: React.ReactNode
	path: string
}

interface SideNavigationProps {
	onNavigate?: (path: string) => void
	activePath?: string
}

function SideNavigation({
	onNavigate,
	activePath = "dashboard",
}: SideNavigationProps) {
	const [activeItem, setActiveItem] = useState(activePath)

	const navItems: NavItem[] = [
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
			id: "history",
			label: "History",
			icon: <History size={20} />,
			path: "/history",
		},
		{
			id: "settings",
			label: "Settings",
			icon: <Settings size={20} />,
			path: "/settings",
		},
	]

	const handleClick = (item: NavItem) => {
		setActiveItem(item.id)
		onNavigate?.(item.path)
	}

	return (
		<nav className="flex flex-col gap-3 p-5 bg-white rounded-lg shadow-md border border-[#e0e0e0] h-full w-64">
			{navItems.map((item) => (
				<button
					key={item.id}
					onClick={() => handleClick(item)}
					className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 whitespace-normal ${
						activeItem === item.id
							? "bg-black text-white shadow-md"
							: "text-gray-700 hover:bg-gray-100 hover:text-black border border-transparent hover:border-gray-300"
					}`}
				>
					<span className="flex items-center">{item.icon}</span>
					<span className="font-medium text-sm">{item.label}</span>
				</button>
			))}
		</nav>
	)
}

export default SideNavigation
