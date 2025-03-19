import axios from "axios";
import { useState } from "react";
import { CookiesProvider, useCookies } from "react-cookie";
import { Alert } from "@material-tailwind/react";
import { WarningCircle } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import userProfile from "./userProfile";
import { Link, Links } from "react-router-dom";


export default function Login() {
	const navigate = useNavigate();
	const [res, setRes] = useState();
	const [cookies, setCookie] = useCookies(["user"]);

	const [alert, setAlert] = useState("");
	const [formData, setFormData] = useState({ email: "", password: "" });
	const action = async (e) => {
		e.preventDefault();
		try {
			await setRes(
				axios.post("http://localhost:3000/auth/login", formData).then((res) => {
					console.log("resr", res);
					setCookie("user", res.data.token, { path: "/" });
					// this.props.history.push("/userprofile");
					<Link to={"/userprofile"}></Link>;
					// return <userProfile/>
					console.log("res tok", res.Promise);
				})
			);
			if (res.data) {
				console.log("aaa");
				setAlert("success");
				navigate("/")
				console.log(Alert);
			}
		} catch (error) {}
	};

	return (
		<>
			{alert == "success" ? (
				<Alert>
					<Alert.Icon>
						<WarningCircle className="h-5 w-5" />
					</Alert.Icon>
					<Alert.Content>A simple alert for showing message.</Alert.Content>
					<Alert.DismissTrigger />
				</Alert>
			) : alert == "warning" ? (
				<Alert>
					<Alert.Icon>
						<WarningCircle className="h-5 w-5" />
					</Alert.Icon>
					<Alert.Content>A simple alert for showing message.</Alert.Content>
					<Alert.DismissTrigger />
				</Alert>
			) : // <WarningAlert />
			alert == "error" ? (
				<Alert>
					<Alert.Icon>
						<WarningCircle className="h-5 w-5" />
					</Alert.Icon>
					<Alert.Content>A simple alert for showing message.</Alert.Content>
					<Alert.DismissTrigger />
				</Alert>
			) : (
				// <ErrorAlert />
				""
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
									<div className="mt-2">
										<input
											id="password"
											name="password"
											type="password"
											placeholder="xxxxxx"
											required
											value={formData.password}
											onChange={(e) => {
												setFormData({ ...formData, password: e.target.value });
											}}
											autoComplete="current-password"
											className="border block w-full rounded-md border-spacing-1 border-cyan-300 bg-gray-200 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
										/>
									</div>
								</div>

								<div>
									<button
										type="submit"
										className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
									>
										Sign in
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
