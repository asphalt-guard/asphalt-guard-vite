import { useEffect, useState } from "react"
import { getUserByUID, logOut, supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

function DashboardHome() {
	const navigate = useNavigate()
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const initAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			const user = await getUserByUID(session?.user.id)
			setUser(user)
			setLoading(false)
		}

		initAuth()
	}, [])

	const handlePotholeScanner = async () => {
		setLoading(true)
		setTimeout(() => {
			navigate("/demo/yolo26")
		}, 500)
	}

	const handleLogOut = async () => {
		setLoading(true)
		if (await logOut()) navigate("/login")
	}

	return (
		<div className="flex min-h-screen font-sans bg-gray-50 flex-col">
			<div className="flex justify-between items-center p-5 border-b border-b-[#cccccc] shadow bg-white">
				<p className="font-bold">AsphaltGuard</p>
				<p className="text-sm">Dashboard</p>
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
						<p>0</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Total Detected Defects</p>
						<p>0</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Good Conditions</p>
						<p>0</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Fair Conditions</p>
						<p>0</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Deteriorating Conditions</p>
						<p>0</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Number of Critical Conditions</p>
						<p>0</p>
					</div>
					<div className="flex justify-between gap-20">
						<p>Latest Inspection Time</p>
						<p>N/A</p>
					</div>
					<div className="border-b border-b-[#cccccc]"></div>
					<button
						className={
							"shadow p-2.5 rounded-[10px] transition-all w-full border text-white font-medium bg-black hover:bg-white hover:text-black border-black"
						}
						onClick={handlePotholeScanner}
					>
						Try AI Pothole Scanner
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
