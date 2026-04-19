import { useEffect, useState } from "react"
import { getUserByUID, supabase } from "../lib/supabase"
import ScanHistoryCard from "../components/ScanHistoryCard"

function DashboardScanHistory() {
	const [user, setUser] = useState(null)
	const [scans, setScans] = useState([]) // New state for DB data
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const initDashboard = async () => {
			setLoading(true)

			// Get Session & User
			const {
				data: { session },
			} = await supabase.auth.getSession()
			if (session?.user) {
				const userData = await getUserByUID(session.user.id)
				setUser(userData)

				// Fetch Scan History from DB
				const { data, error } = await supabase
					.from("scan_history")
					.select("*")
					.order("created_at", { ascending: false }) // Newest first

				// @ts-expect-error yes
				if (!error) setScans(data)
			}

			setLoading(false)
		}

		initDashboard()
	}, [])

	return (
		<div className="flex min-h-screen font-sans bg-gray-50 flex-col">
			<div className="flex justify-between items-center p-5 border-b border-b-[#cccccc] shadow bg-white">
				<div className="flex gap-2.5">
					<img
						src="/asphaltguard-favicon.svg"
						alt="AsphaltGuard logo"
						className="h-6 w-6"
					/>
					<p className="font-bold">AsphaltGuard</p>
				</div>
				<p>Dashboard</p>
			</div>

			<div className="flex flex-1 justify-center items-start p-10">
				<div className="flex flex-col gap-5 border border-[#cccccc] p-6 rounded-[10px] shadow-2xl bg-white w-full max-w-2xl">
					<div className="flex justify-between items-center">
						<p className="">Scan History</p>
						{user && (
							// @ts-expect-error yes
							<p className="text-gray-600 text-sm">Hello, {user.username}</p>
						)}
					</div>

					<div className="border-b border-b-[#cccccc]"></div>

					<div className="flex flex-col gap-3">
						{scans.length > 0 ? (
							// @ts-expect-error yes
							scans.map((scan) => <ScanHistoryCard key={scan.id} scan={scan} />)
						) : (
							<p className="text-center text-gray-400 py-10">No scans found.</p>
						)}
					</div>
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

export default DashboardScanHistory
