import axios from "axios";
import { useState } from "react";
import { CookiesProvider, useCookies } from "react-cookie";
import { Alert } from "@material-tailwind/react";
import { WarningCircle, Eye, EyeClosed } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import userProfile from "./userProfile";
import { Link, Links } from "react-router-dom";


export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cookies, setCookie] = useCookies(["user"]);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const action = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:3000/auth/login", formData);
            
            if (response.data.token) {
                // Changed from 'user' to 'token'
                localStorage.setItem('token', response.data.token);
                setCookie("token", response.data.token, { path: "/" }); // If you want to keep cookies
                setAlert({
                    type: "success",
                    message: "Login successful! Redirecting..."
                });
                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 1500);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                setAlert({
                    type: "warning",
                    message: "Email not verified. Redirecting to verification page..."
                });
                setTimeout(() => {
                    navigate("/verify-email", { 
                        state: { email: formData.email }
                    });
                }, 1500);
            } else {
                setAlert({
                    type: "error",
                    message: error.response?.data?.message || "Invalid email or password"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {alert.message && (
                <Alert
                    color={
                        alert.type === "success" ? "green" :
                        alert.type === "warning" ? "yellow" : "red"
                    }
                    className="fixed top-4 right-4 z-50"
                    animate={{
                        mount: { y: 0 },
                        unmount: { y: 100 },
                    }}
                >
                    <div className="flex items-center gap-2">
                        <WarningCircle className="h-5 w-5" />
                        <span>{alert.message}</span>
                    </div>
                </Alert>
            )}

            <CookiesProvider>
                <div className="justify-center align-middle px-10 py-3 lg:px-8 bg-white mx-96 my-16 border-red-200 border-spacing-1 border  rounded-3xl">
                    <div>
                        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                            {/* <img
                        alt="Your Company"
                        src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                        className="mx-auto h-10 w-auto"
                    /> */}
                            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-800">
                                Log in to your account
                            </h2>
                        </div>

                        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                            <form onSubmit={action} method="POST" className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="flex text-sm/6 font-medium text-gray-400 "
                                    >
                                        Email address
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="example@gmail,com"
                                            required
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData({ ...formData, email: e.target.value });
                                            }}
                                            autoComplete="email"
                                            className="block w-full rounded-md border-spacing-1 border-cyan-300 bg-gray-200 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 border"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm/6 font-medium text-gray-400"
                                        >
                                            Password
                                        </label>
                                    </div>
                                    <div className="mt-2 relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="xxxxxx"
                                            required
                                            value={formData.password}
                                            onChange={(e) => {
                                                setFormData({ ...formData, password: e.target.value });
                                            }}
                                            autoComplete="current-password"
                                            className="border block w-full rounded-md border-spacing-1 border-cyan-300 bg-gray-200 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeClosed className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            "Sign in"
                                        )}
                                    </button>
                                </div>
                                <div className="text-sm">
                                    <a
                                        href="#"
                                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </form>
                            <hr className="border mt-3" />
                            <p className="mt-3 text-center text-sm/6 text-gray-500">
                                Not a member?{" "}
                                <a
                                    href="/register"
                                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                                >
                                    Signup now
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </CookiesProvider>
        </>
    );
}
