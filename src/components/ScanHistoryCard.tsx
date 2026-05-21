import { Thermometer } from "lucide-react"

type ScanRecord = {
	id: string | number
	created_at: string
	annotated_img_url?: string | null
	thermal_img_url?: string | null
	pothole_count?: number | null
	max_temp?: number | null
}

interface ScanHistoryCardProps {
	scan: ScanRecord
}

function ScanHistoryCard({ scan }: ScanHistoryCardProps) {
	const date = new Date(scan.created_at).toLocaleDateString()
	const time = new Date(scan.created_at).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	})

	const potholeCount = scan.pothole_count ?? 0
	const maxTemp = typeof scan.max_temp === "number" ? scan.max_temp : null
	const hasThermal = Boolean(scan.thermal_img_url)

	return (
		<div className="rounded-[10px] p-3 border border-transparent hover:border-gray-300 hover:shadow-md hover:bg-gray-50 flex justify-between items-center transition-all cursor-pointer gap-4">
			<div className="flex items-center gap-3 min-w-0">
				{/* Image previews: annotated + thermal */}
				<div className="flex gap-2 shrink-0">
					<div className="relative bg-gray-200 w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
						{scan.annotated_img_url ? (
							<img
								src={scan.annotated_img_url}
								alt="Annotated scan preview"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 px-1 text-center">
								No image
							</div>
						)}
					</div>
					<div className="relative bg-gray-200 w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
						{hasThermal ? (
							<img
								src={scan.thermal_img_url ?? ""}
								alt="Thermal scan preview"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 px-1 text-center">
								No thermal
							</div>
						)}
						<span className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-semibold tracking-wide text-white bg-black/55 rounded px-1">
							THERMAL
						</span>
					</div>
				</div>

				<div className="flex flex-col min-w-0">
					<p className="font-bold text-gray-800 truncate">
						{potholeCount}{" "}
						{potholeCount === 1 ? "Pothole" : "Potholes"} detected
					</p>
					<p
						className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${
							maxTemp !== null ? "text-orange-600" : "text-gray-400"
						}`}
					>
						<Thermometer size={12} aria-hidden />
						<span>
							Max temp: {maxTemp !== null ? `${maxTemp}°C` : "—"}
						</span>
					</p>
					<p className="text-xs text-gray-400">
						Scan ID: #{scan.id.toString().slice(-4)}
					</p>
				</div>
			</div>

			<div className="flex flex-col items-end text-sm text-gray-500 shrink-0">
				<p className="font-medium">{time}</p>
				<p>{date}</p>
			</div>
		</div>
	)
}

export default ScanHistoryCard
