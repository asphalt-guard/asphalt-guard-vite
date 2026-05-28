import { Routes, Route, Navigate } from "react-router-dom"
import { LastLoginTracker } from "./components/LastLoginTracker"
import YOLO26 from "./demo/YOLO26"
import Login from "./auth/Login"
import SignUp from "./auth/SignUp"
import DashboardHome from "./dashboard/Home"
import DashboardScanHistory from "./dashboard/ScanHistory"
import DashboardLayout from "./dashboard2/Home"
import LiveFeed from "./dashboard2/LiveFeed"
import Account from "./dashboard2/Account"
import Users from "./dashboard2/Users"
import AIModels from "./dashboard2/AIModels"
import History from "./dashboard2/History"
import MapView from "./testing/MapView"

function App() {
	return (
		<>
			<LastLoginTracker />
			<Routes>
				<Route path="/" element={<Navigate to="/dashboard" replace />} />
				<Route path="/demo/yolo26" element={<YOLO26 />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignUp />} />
				{/* Dashboard v2 routes (main) */}
				<Route path="/live-feed" element={<LiveFeed />} />
				<Route path="/dashboard" element={<DashboardLayout />} />
				<Route path="/account" element={<Account />} />
				<Route path="/users" element={<Users />} />
				<Route path="/ai-models" element={<AIModels />} />
				<Route path="/history" element={<History />} />
				{/* Testing routes */}
				<Route path="/map" element={<MapView />} />
				{/* Dashboard v1 routes (legacy) */}
				<Route path="/dashboard-v1" element={<DashboardHome />} />
				<Route
					path="/dashboard-v1/scanhistory"
					element={<DashboardScanHistory />}
				/>
			</Routes>
		</>
	)
}

export default App
