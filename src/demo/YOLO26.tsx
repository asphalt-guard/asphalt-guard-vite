import { useState, useRef } from "react"
import { supabase } from "../lib/supabase"

function YOLO26() {
	const [image, setImage] = useState(null)
	const [previewUrl, setPreviewUrl] = useState(null) // Separate state for the display URL
	const [isLoading, setIsLoading] = useState(false)
	const fileInputRef = useRef(null)
	// @ts-expect-error yes
	const [detectionCount, setDetectionCount] = useState(null)

	const handleSelectClick = () => {
		// @ts-expect-error ble
		fileInputRef.current.click()
	}
	// @ts-expect-error ble
	const handleFileChange = (event) => {
		const file = event.target.files[0]
		if (file) {
			setImage(file)
			// Create a temporary URL for the local file preview
			// @ts-expect-error ble
			setPreviewUrl(URL.createObjectURL(file))
		}
	}

	const handleScan = async () => {
		if (!image) return

		setIsLoading(true)
		const formData = new FormData()
		formData.append("file", image)

		try {
			// 1. Get detection results from your API
			const response = await fetch(
				"https://asphaltguard-pothole.hf.space/detect",
				{
					method: "POST",
					body: formData,
				},
			)

			if (!response.ok) throw new Error("Scan failed")
			const data = await response.json() // Contains {count, image}

			// 2. Prepare for Supabase Upload
			const timestamp = Date.now()
			const originalPath = `original_${timestamp}.jpg`
			const annotatedPath = `annotated_${timestamp}.jpg`

			// Convert the Base64 annotated image back to a Blob for Supabase
			const annotatedBlob = await (await fetch(data.image)).blob()

			// 3. Upload Original Image to Bucket
			// @ts-expect-error yes
			const { data: origData, error: origErr } = await supabase.storage
				.from("ai-pothole-scanner")
				.upload(originalPath, image)

			// 4. Upload Annotated Image to Bucket
			// @ts-expect-error yes
			const { data: annData, error: annErr } = await supabase.storage
				.from("ai-pothole-scanner")
				.upload(annotatedPath, annotatedBlob)

			if (origErr || annErr) throw new Error("Storage upload failed")

			// 5. Get Public URLs
			const {
				data: { publicUrl: original_img_url },
			} = supabase.storage.from("ai-pothole-scanner").getPublicUrl(originalPath)

			const {
				data: { publicUrl: annotated_img_url },
			} = supabase.storage
				.from("ai-pothole-scanner")
				.getPublicUrl(annotatedPath)

			// 6. Save Scan Info to Database
			const { error: dbError } = await supabase.from("scan_history").insert([
				{
					original_img_url,
					annotated_img_url,
					pothole_count: data.count,
					created_at: new Date(),
				},
			])

			if (dbError) throw dbError

			// Update UI
			setPreviewUrl(data.image)
			setDetectionCount(data.count)
		} catch (error) {
			console.error("Error:", error)
			alert("Process failed. See console for details.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen justify-center items-center font-sans bg-gray-50 p-4">
			<div className="flex flex-col rounded-[10px] border border-[#CCCCCC] p-5 shadow-2xl gap-5 bg-white w-85">
				{/* Added a fixed width to the card (w-85) to ensure consistency */}

				<p className="text-2xl m-0 font-bold">AsphaltGuard</p>
				<p className="m-0 text-gray-600">Select image to scan for potholes</p>

				<input
					type="file"
					className="hidden"
					ref={fileInputRef}
					accept="image/*"
					onChange={handleFileChange}
				/>

				{/* The Box: Removed h-37.5, added min-h for empty state */}
				<div className="bg-[#EEEEEE] w-75 rounded flex items-center justify-center overflow-hidden border border-[#CCCCCC] relative min-h-37.5">
					{previewUrl ? (
						<img
							src={previewUrl}
							alt="Preview"
							// Changed h-full object-cover to w-full h-auto
							className={`w-full h-auto block transition-opacity duration-300 ${isLoading ? "opacity-50" : "opacity-100"}`}
						/>
					) : (
						<span className="text-gray-400 text-sm text-center px-4">
							No image selected
						</span>
					)}

					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
						</div>
					)}
				</div>

				<div className="flex gap-2">
					<button
						onClick={handleSelectClick}
						disabled={isLoading}
						className="flex-1 rounded border border-[#CCCCCC] py-2 hover:bg-[#f7f5f5] active:bg-white transition-all disabled:opacity-50"
					>
						{image ? "Change" : "Select"}
					</button>

					{image && (
						<button
							onClick={handleScan}
							disabled={isLoading}
							className="flex-1 bg-black text-white rounded py-2 hover:bg-gray-800 transition-all disabled:bg-gray-400"
						>
							{isLoading ? "Scanning..." : "Scan Now"}
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default YOLO26
