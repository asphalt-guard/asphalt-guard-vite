import { LogInIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { logIn, supabase } from "../lib/supabase"

function Login() {
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [message, setMessage] = useState("")

	const [credentials, setCredentials] = useState({ email: "", password: "" })

	// @ts-expect-error yes
	const handleChangeForm = (e) => {
		const { name, value } = e.target
		setCredentials((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleLogin = async () => {
		setMessage("")
		setLoading(true)
		if (await logIn(credentials)) {
			navigate("/dashboard")
		} else {
			setLoading(false)
			setMessage("Username or password is wrong")
		}
	}

	useEffect(() => {
		const initAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (session) navigate("/dashboard")

			setLoading(false)
		}

		initAuth()
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
					<p>AsphaltGuard</p>
				</div>
				<Link to="/signup" className="underline">
					Create Account
				</Link>
			</div>
			<div className="flex flex-1 justify-center items-center p-2.5">
				<div className="flex flex-col justify-center items-center gap-5 border border-[#cccccc] p-10 rounded-[10px] shadow-2xl">
					<div className="p-2.5 border border-[#CCCCCC] rounded">
						<LogInIcon />
					</div>
					<div className="flex flex-col justify-center items-center">
						<p className="text-2xl">Login with email</p>
						<p className="text-gray-600 text-center">
							Only admins can access important data
						</p>
					</div>
					<div className="flex flex-col justify-center items-center gap-2.5 w-full">
						<div className="flex flex-col gap-1 w-full">
							<label
								htmlFor="email"
								className="text-sm font-medium text-gray-700"
							>
								📧 Email
							</label>
							<input
								id="email"
								type="text"
								name="email"
								value={credentials.email}
								onChange={handleChangeForm}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full"
							/>
						</div>
						<div className="flex flex-col gap-1 w-full">
							<label
								htmlFor="password"
								className="text-sm font-medium text-gray-700"
							>
								🔒 Password
							</label>
							<input
								id="password"
								type="password"
								name="password"
								value={credentials.password}
								onChange={handleChangeForm}
								className="border border-[#cccccc] rounded-[10px] p-2.5 w-full"
							/>
						</div>
						<div className="flex justify-between w-full">
							<p className="text-[0.7rem] text-[red]">{message}</p>
							<Link
								to="/signup"
								className="text-[0.7rem] underline text-gray-600"
							>
								Forgot Password?
							</Link>
						</div>
					</div>
					<div className="border-b border-b-[#cccccc] w-full"></div>

					<button
						onClick={handleLogin}
						className="p-2.5 bg-black rounded-[10px] cursor-pointer w-full hover:bg-white text-white hover:text-black border"
					>
						<p className="">Continue</p>
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

export default Login
