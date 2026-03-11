import { useState, useRef } from "react"

function App() {
	const [image, setImage] = useState(null)
	const [previewUrl, setPreviewUrl] = useState(null) // Separate state for the display URL
	const [isLoading, setIsLoading] = useState(false)
	const fileInputRef = useRef(null)

	const handleSelectClick = () => {
		fileInputRef.current.click()
	}

	const handleFileChange = (event) => {
		const file = event.target.files[0]
		if (file) {
			setImage(file)
			// Create a temporary URL for the local file preview
			setPreviewUrl(URL.createObjectURL(file))
		}
	}

	const handleScan = async () => {
		if (!image) return

		setIsLoading(true)
		const formData = new FormData()
		formData.append("file", image)

		try {
			const response = await fetch("http://192.168.254.107:7860/detect", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) throw new Error("Scan failed")

			// 1. Get the response as a Blob (the processed image)
			const imageBlob = await response.blob()

			// 2. Create a URL for the processed image
			const processedImageUrl = URL.createObjectURL(imageBlob)

			// 3. Update the preview with the result from the API
			setPreviewUrl(processedImageUrl)
		} catch (error) {
			console.error("Error:", error)
			alert(error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex h-screen justify-center items-center font-sans">
			<div className="flex flex-col rounded-[10px] border border-[#CCCCCC] p-5 shadow-2xl gap-5 bg-white">
				<p className="text-2xl m-0 font-bold">AsphaltGuard</p>
				<p className="m-0 text-gray-600">Select image to scan for potholes</p>

				<input
					type="file"
					className="hidden"
					ref={fileInputRef}
					accept="image/*"
					onChange={handleFileChange}
				/>

				{/* The Box */}
				<div className="bg-[#EEEEEE] h-37.5 w-75 rounded flex items-center justify-center overflow-hidden border border-[#CCCCCC] relative">
					{previewUrl ? (
						<img
							src={previewUrl}
							alt="Preview"
							className={`h-full w-full object-cover ${isLoading ? "opacity-50" : "opacity-100"}`}
						/>
					) : (
						<span className="text-gray-400 text-sm text-center px-4">
							No image selected
						</span>
					)}

					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/10">
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

export default App
