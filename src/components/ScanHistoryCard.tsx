// @ts-expect-error adding types later
function ScanHistoryCard({ scan }) {
	// Format the timestamp nicely
	const date = new Date(scan.created_at).toLocaleDateString()
	const time = new Date(scan.created_at).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	})

	return (
		<div className="rounded-[10px] p-3 border border-transparent hover:border-gray-300 hover:shadow-md hover:bg-gray-50 flex justify-between items-center transition-all cursor-pointer gap-4">
			<div className="flex items-center gap-4">
				{/* Annotated Image Preview */}
				<div className="bg-gray-200 w-20 h-20 min-w-20 rounded-lg overflow-hidden border border-gray-300">
					<img
						src={scan.annotated_img_url}
						alt="Scan Preview"
						className="w-full h-full object-cover"
					/>
				</div>

				<div className="flex flex-col">
					<p className="font-bold text-gray-800">
						{scan.pothole_count}{" "}
						{scan.pothole_count === 1 ? "Pothole" : "Potholes"} detected
					</p>
					<p className="text-xs text-gray-400">
						Scan ID: #{scan.id.toString().slice(-4)}
					</p>
				</div>
			</div>

			<div className="flex flex-col items-end text-sm text-gray-500">
				<p className="font-medium">{time}</p>
				<p>{date}</p>
			</div>
		</div>
	)
}

export default ScanHistoryCard
