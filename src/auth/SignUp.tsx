import { ShoppingBagIcon, UserPlusIcon } from "lucide-react"
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
				<div className="flex gap-2.5">
					<ShoppingBagIcon />
					<p>AsphaltGuard</p>
				</div>
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
						<div className="flex flex-col gap-1">
							<label
								htmlFor="username"
								className="text-sm font-medium text-gray-700"
							>
								👤 Username
							</label>
							<input
								id="username"
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChangeForm}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label
								htmlFor="full_name"
								className="text-sm font-medium text-gray-700"
							>
								🧑 Full Name
							</label>
							<input
								id="full_name"
								type="text"
								name="full_name"
								value={formData.full_name}
								onChange={handleChangeForm}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label
								htmlFor="contact_number"
								className="text-sm font-medium text-gray-700"
							>
								📞 Contact Number
							</label>
							<input
								id="contact_number"
								type="text"
								name="contact_number"
								value={formData.contact_number}
								onChange={handleChangeForm}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label
								htmlFor="email"
								className="text-sm font-medium text-gray-700"
							>
								📧 Email
							</label>
							<input
								id="email"
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChangeForm}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label
								htmlFor="password"
								className="text-sm font-medium text-gray-700"
							>
								🔒 Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label
								htmlFor="confirm_password"
								className="text-sm font-medium text-gray-700"
							>
								🔒 Confirm Password
							</label>
							<input
								id="confirm_password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full focus:outline-black"
							/>
						</div>
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
