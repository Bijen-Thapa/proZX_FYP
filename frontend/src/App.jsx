import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";

import userProfile from "./components/userProfile";

import { Route, Routes } from "react-router-dom";

import { CookiesProvider, useCookies } from "react-cookie";

function App() {
	const [cookies, setCookie] = useCookies(['user'])
	const [count, setCount] = useState(0);

	function handleLogin(user) {
		setCookie("user", user, { path: "/" });
	}
	return (
		<div className="">
			<CookiesProvider>
				{/* check if cookie is set */}
				{/* <div>
					{cookies.user ? (
						"cok"
					) : "no"}
				</div> */}
				<NavBar />
				<Routes>

					{/* <Route path={} element={<Home />} /> */}
					<Route path={"/"} element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/userprofile" element={<userProfile />} />
					{/* <Route path="/artists" element={<Artist />} />
				<Route path="/services" element={<Services />} />
				<Route path="/about" element={<About />} />
				<Route path="/enquiry" element={<Enquiry />} /> */}
				</Routes>
				<Footer />
			</CookiesProvider>
		</div>
	);
}

export default App;
