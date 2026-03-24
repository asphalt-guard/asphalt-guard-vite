import { Routes, Route } from "react-router-dom"
import YOLO26 from "./demo/YOLO26"
import Login from "./auth/Login"
import SignUp from "./auth/SignUp"
import DashboardHome from "./dashboard/Home"
import DashboardScanHistory from "./dashboard/ScanHistory"

function App() {
	return (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/demo/yolo26" element={<YOLO26 />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<SignUp />} />
			<Route path="/dashboard" element={<DashboardHome />} />
			<Route path="/dashboard/scanhistory" element={<DashboardScanHistory />} />
		</Routes>
	)
}

export default App
