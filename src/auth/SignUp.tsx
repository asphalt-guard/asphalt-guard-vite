import { UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout, { inputClassName, labelClassName } from "./AuthLayout";
import { createNewUser, supabase } from "../lib/supabase";

function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        role: "user",
        contact_number: "",
        username: "",
        email: "",
    });

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isFormValid =
        formData.username.trim() !== "" &&
        formData.full_name.trim() !== "" &&
        formData.email.includes("@") &&
        password.length >= 6 &&
        password === confirmPassword;

    // @ts-expect-error yes
    const handleChangeForm = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // @ts-expect-error yes
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        if (await createNewUser(formData, password)) {
            navigate("/dashboard");
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) navigate("/dashboard");
        };

        initAuth();
    }, [navigate]);

    return (
        <AuthLayout
            loading={loading}
            headerLink={{ to: "/login", label: "Login" }}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-700 bg-gray-800/70 text-gray-300">
                    <UserPlusIcon size={22} aria-hidden />
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-xl font-semibold text-white">
                        Create new account
                    </h1>
                    <p className="text-sm text-gray-400">
                        Admins will need to verify your identity later
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="username" className={labelClassName}>
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChangeForm}
                            className={inputClassName}
                            autoComplete="username"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="full_name" className={labelClassName}>
                            Full name
                        </label>
                        <input
                            id="full_name"
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChangeForm}
                            className={inputClassName}
                            autoComplete="name"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="contact_number"
                            className={labelClassName}
                        >
                            Contact number
                        </label>
                        <input
                            id="contact_number"
                            type="text"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChangeForm}
                            className={inputClassName}
                            autoComplete="tel"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className={labelClassName}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClassName}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="confirm_password"
                            className={labelClassName}
                        >
                            Confirm password
                        </label>
                        <input
                            id="confirm_password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClassName}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <div className="w-full border-t border-gray-800" />

                <button
                    type="button"
                    disabled={!isFormValid || loading}
                    onClick={handleSubmit}
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        isFormValid && !loading
                            ? "cursor-pointer bg-blue-600 text-white hover:bg-blue-500"
                            : "cursor-not-allowed bg-gray-800 text-gray-500"
                    }`}
                >
                    {loading ? "Creating account…" : "Continue"}
                </button>
            </div>
        </AuthLayout>
    );
}

export default SignUp;
