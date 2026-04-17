import SideNavigation from "../components/SideNavigation"
import { useNavigate } from "react-router-dom"

function Settings() {
	const navigate = useNavigate()

	const handleNavigation = (path: string) => {
		navigate(path)
	}

	return (
		<div className="flex min-h-screen font-sans bg-gray-50 flex-col p-5">
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
				<p>Settings</p>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-1 gap-5">
				{/* Navigation Sidebar */}
				<div style={{ margin: "10px", minWidth: "fit-content" }}>
					<SideNavigation onNavigate={handleNavigation} activePath="settings" />
				</div>

				{/* Main Content */}
				<div
					className="flex-1 bg-white rounded-lg shadow-md border border-[#e0e0e0]"
					style={{ margin: "10px" }}
				>
					{/* Content will go here */}
				</div>
			</div>
		</div>
	)
}

export default Settings
