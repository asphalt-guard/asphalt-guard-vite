import { UserPlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createNewUser, supabase } from "../lib/supabase"

function SignUp() {
	const navigate = useNavigate()

	const [formData, setFormData] = useState({
		full_name: "",
		role: "user", // Added a default or it could be empty
		contact_number: "",
		username: "",
		email: "",
	})

	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [loading, setLoading] = useState(false)

	// 1. Define the validation logic
	const isFormValid =
		formData.username.trim() !== "" &&
		formData.full_name.trim() !== "" &&
		formData.email.includes("@") &&
		password.length >= 6 &&
		password === confirmPassword

	// @ts-expect-error yes
	const handleChangeForm = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	// @ts-expect-error yes
	const handleSubmit = async (e) => {
		e.preventDefault() // Good practice to prevent default form behavior
		if (!isFormValid) return

		setLoading(true)
		// Simulate API call
		if (await createNewUser(formData, password)) {
			navigate("/dashboard")
		} else {
			setLoading(false)
		}
	}

	useEffect(() => {
		const initAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (session) navigate("/dashboard")
		}

		initAuth()
	}, [])

	return (
		<div className="flex min-h-screen font-sans bg-gray-50 flex-col">
			<div className="flex justify-between items-center p-5 border-b border-b-[#cccccc] shadow bg-white">
				<p className="font-bold">AsphaltGuard</p>
				<Link to="/login" className="underline text-sm">
					Login
				</Link>
			</div>

			<div className="flex flex-1 justify-center items-center p-2.5">
				<div className="flex flex-col justify-center items-center gap-5 border border-[#cccccc] p-10 rounded-[10px] shadow-2xl bg-white max-w-md w-full">
					<div className="p-2.5 border border-[#CCCCCC] rounded">
						<UserPlusIcon />
					</div>
					<div className="flex flex-col justify-center items-center">
						<h1 className="text-2xl font-semibold">Create new account</h1>
						<p className="text-gray-600 text-center">
							Admins will need to verify your identity later
						</p>
					</div>

					<div className="flex flex-col justify-center gap-2.5 w-full">
						<input
							type="text"
							name="username"
							placeholder="👤 Username"
							value={formData.username}
							onChange={handleChangeForm}
							className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
						/>
						<input
							type="text"
							name="full_name"
							placeholder="🧑 Full Name"
							value={formData.full_name}
							onChange={handleChangeForm}
							className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
						/>
						<input
							type="text"
							name="contact_number"
							placeholder="📞 Contact Number"
							value={formData.contact_number}
							onChange={handleChangeForm}
							className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
						/>
						<input
							type="email"
							name="email"
							placeholder="📧 Email"
							value={formData.email}
							onChange={handleChangeForm}
							className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
						/>
						<input
							type="password"
							placeholder="🔒 Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
						/>
						<input
							type="password"
							placeholder="🔒 Confirm Password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
						/>
					</div>

					<div className="border-b border-b-[#cccccc] w-full"></div>

					<button
						disabled={!isFormValid || loading}
						onClick={handleSubmit}
						className={`p-2.5 rounded-[10px] transition-all w-full border text-white font-medium
                            ${
															isFormValid && !loading
																? "bg-black hover:bg-white hover:text-black border-black"
																: "bg-gray-400 cursor-not-allowed border-gray-400"
														}`}
					>
						{loading ? "Creating account..." : "Continue"}
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

export default SignUp
