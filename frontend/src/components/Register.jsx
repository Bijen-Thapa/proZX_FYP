import React from "react";
import { useState } from "react";
import { Alert } from "@material-tailwind/react";
import { WarningCircle } from "iconoir-react";
import axios from "axios";

function Register() {
	const [res, setRes] = useState();
	const [formData, setFormData] = useState({
		userName: "",
		email: "",
		phone: "",
		address: "",
		password: "",
	});
	const action = async (e) => {
		e.preventDefault();
		try {
			await setRes(axios.post("http://localhost:3000/auth/register", formData));
			console.log("res", res);
			console.log("res tok", res.data);
			if (res.data) {
				console.log("aaa");
				
			}
			if (res.message == "success") {
			}
		} catch (error) {}
	};
	return (
		<div>
			<div className="max-w-4xl max-sm:max-w-lg mx-auto font-[sans-serif] px-16 py-5 w-2/5 my-5 border-red-200 border-spacing-1 border  rounded-3xl">
				<div className="text-center mb-2 sm:mb-6">
					<h4 className="text-gray-800  mt-3 text-left text-2xl/9 font-bold tracking-tight">
						Create an account
					</h4>
				</div>

				<form>
					<div className="grid sm:grid-cols-1 gap-6 ">
						<div className="flex ">
							<div className="w-1/2 mr-3">
								<label className="text-gray-600 text-sm mb-2 block text-left">
									First Name
								</label>
								<input
									name="userName"
									type="text"
									className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
									placeholder="Enter name"
								/>
							</div>
							<div className="w-1/2">
								<label className="text-gray-600 text-sm mb-2 block text-left">
									Last Name
								</label>
								<input
									name="lname"
									type="text"
									className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
									placeholder="Enter last name"
								/>
							</div>
						</div>
						<div className="flex">
							<div className="w-1/2 mr-3">
								<label className="text-gray-600 text-sm mb-2 block text-left">
									Email Id
								</label>
								<input
									name="email"
									type="text"
									className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
									placeholder="Enter email"
									value={formData.email}
									onChange={(e) => {
										setFormData({ ...formData, email: e.target.value });
									}}
								/>
							</div>
							<div className="w-1/2">
								<label className="text-gray-600 text-sm mb-2 block text-left">
									Mobile No.
								</label>
								<input
									name="number"
									type="number"
									className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
									placeholder="Enter mobile number"
								/>
							</div>
						</div>
						<div>
							<label className="text-gray-600 text-sm mb-2 block text-left">
								Address
							</label>
							<input
								name="address"
								type="text"
								className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
								placeholder="Enter address"
								value={formData.address}
								onChange={(e) => {
									setFormData({ ...formData, address: e.target.value });
								}}
							/>
						</div>
						<div>
							<label className="text-gray-600 text-sm mb-2 block text-left">
								Password
							</label>
							<input
								name="password"
								type="password"
								className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
								placeholder="Enter password"
							/>
						</div>
						<div>
							<label className="text-gray-600 text-sm mb-2 block text-left">
								Confirm Password
							</label>
							<input
								name="password"
								type="password"
								className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
								placeholder="Enter confirm password"
								value={formData.password}
								onChange={(e) => {
									setFormData({ ...formData, password: e.target.value });
								}}
							/>
						</div>
					</div>

					<div className="mt-8">
						<button
							type="button"
							className="mx-auto block py-3 px-6 text-sm tracking-wider rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none "
						>
							Sign up
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Register;
