import { LogInIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { inputClassName, labelClassName } from "./AuthLayout";
import { logIn, supabase } from "../lib/supabase";

function Login() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [credentials, setCredentials] = useState({ email: "", password: "" });

    // @ts-expect-error yes
    const handleChangeForm = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogin = async () => {
        setMessage("");
        setLoading(true);
        if (await logIn(credentials)) {
            navigate("/dashboard");
        } else {
            setLoading(false);
            setMessage("Username or password is wrong");
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) navigate("/dashboard");

            setLoading(false);
        };

        initAuth();
    }, [navigate]);

    return (
        <AuthLayout
            loading={loading}
            headerLink={{ to: "/signup", label: "Create Account" }}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-700 bg-gray-800/70 text-gray-300">
                    <LogInIcon size={22} aria-hidden />
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-xl font-semibold text-white">
                        Login with email
                    </h1>
                    <p className="text-sm text-gray-400">
                        Only admins can access important data
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className={labelClassName}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="text"
                            name="email"
                            value={credentials.email}
                            onChange={handleChangeForm}
                            className={inputClassName}
                            autoComplete="email"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className={labelClassName}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChangeForm}
                            className={inputClassName}
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-red-400">{message}</p>
                        <Link
                            to="/signup"
                            className="shrink-0 text-xs text-gray-500 transition-colors hover:text-gray-300"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <div className="w-full border-t border-gray-800" />

                <button
                    type="button"
                    onClick={handleLogin}
                    className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    Continue
                </button>
            </div>
        </AuthLayout>
    );
}

export default Login;
