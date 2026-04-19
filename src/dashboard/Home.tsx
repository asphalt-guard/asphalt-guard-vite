import { useEffect, useState } from "react"
import { getUserByUID, logOut, supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

function DashboardHome() {
	const navigate = useNavigate()
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [stats, setStats] = useState({
		totalInspected: 0,
		totalDefects: 0,
		good: 0,
		fair: 0,
		deteriorating: 0,
		critical: 0,
		latestTime: "N/A",
	})

	useEffect(() => {
		const initDashboard = async () => {
			setLoading(true)

			// 1. Auth and User Setup
			const {
				data: { session },
			} = await supabase.auth.getSession()
			const userData = await getUserByUID(session?.user.id)
			setUser(userData)

			// 2. Fetch all scans to calculate logic
			// @ts-expect-error yes
			const { data: scans, error } = await supabase
				.from("scan_history")
				.select("*")
				.order("created_at", { ascending: false })

			if (scans && scans.length > 0) {
				const totalInspected = scans.length
				let totalDefects = 0
				let good = 0,
					fair = 0,
					deteriorating = 0,
					critical = 0

				scans.forEach((scan) => {
					const count = scan.pothole_count || 0
					totalDefects += count

					// Logic based on your requirements
					if (count === 0) good++
					else if (count === 1) fair++
					else if (count === 2) deteriorating++
					else if (count >= 3) critical++
				})

				// Format Latest Inspection Time (from the first item in sorted list)
				const latest = new Date(scans[0].created_at)
				const formattedTime = `${latest.toLocaleDateString()} ${latest.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

				setStats({
					totalInspected,
					totalDefects,
					good,
					fair,
					deteriorating,
					critical,
					latestTime: formattedTime,
				})
			}

			setLoading(false)
		}

		initDashboard()
	}, [])

	const handlePotholeScanner = async () => {
		setLoading(true)
		setTimeout(() => {
			navigate("/demo/yolo26")
		}, 500)
	}

	const handleScanHistory = async () => {
		setLoading(true)
		setTimeout(() => {
			navigate("/dashboard/scanhistory")
		}, 500)
	}

	const handleLogOut = async () => {
		setLoading(true)
		if (await logOut()) navigate("/login")
	}

	return (
		<div className="flex min-h-screen font-sans bg-gray-50 flex-col">
			<div className="flex justify-between items-center p-5 border-b border-b-[#cccccc] shadow bg-white">
				<div className="flex gap-2.5">
					<img
						src="/asphaltguard-favicon.svg"
						alt="AsphaltGuard logo"
						className="h-6 w-6"
					/>
					<p>AsphaltGuard</p>
				</div>
				<p>Dashboard</p>
			</div>
			<div className="flex flex-1 justify-center items-center p-2.5">
				<div className="flex flex-col gap-5 border border-[#cccccc] p-10 rounded-[10px] shadow-2xl">
					<div className="flex justify-between ">
						<p className="text-center">Dashboard</p>

						{
							// @ts-expect-error yes
							user && <p>Hello, {user.username}</p>
						}
					</div>
					<div className="border-b border-b-[#cccccc]"></div>
					<div className="flex justify-between gap-20">
						<p>Total Inspected Areas</p>
						<p>{stats.totalInspected}</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Total Detected Defects</p>
						<p>{stats.totalDefects}</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Good Conditions</p>
						<p>{stats.good}</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Fair Conditions</p>
						<p>{stats.fair}</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Deteriorating Conditions</p>
						<p>{stats.deteriorating}</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Critical Conditions</p>
						<p>{stats.critical}</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Latest Inspection Time</p>
						<p>{stats.latestTime}</p>
					</div>
					<button
						className={
							"shadow p-2.5 rounded-[10px] transition-all w-full border hover:text-white font-normal hover:bg-black bg-white text-black hover:border-black"
						}
						onClick={handleScanHistory}
					>
						Scan History
					</button>
					<div className="border-b border-b-[#cccccc]"></div>
					<button
						className={
							"shadow p-2.5 rounded-[10px] transition-all w-full border text-white font-medium bg-black hover:bg-white hover:text-black border-black"
						}
						onClick={handlePotholeScanner}
					>
						AI Pothole Scanner
					</button>
					<button
						className={
							"shadow p-2.5 rounded-[10px] transition-all w-full border text-white font-medium bg-[red] hover:bg-white hover:text-[red] border-[red]"
						}
						onClick={handleLogOut}
					>
						Sign Out
					</button>
				</div>
			</div>
			{loading && (
				<div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px] z-50">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
				</div>
			)}
		</div>
	)
}

export default DashboardHome
