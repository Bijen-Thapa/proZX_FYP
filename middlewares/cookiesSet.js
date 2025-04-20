const jwt = require("jsonwebtoken");
require("dotenv").config();

const cookieSet = async (req, res, next) => {
	const reCookie = await req.cookies.token;
	// console.log(reCookie);

	if (!reCookie) {
		// 	const secret = process.env.SECRET;
		const token = { id: null, role: "guest" };
		// const token = jwt.sign({ id: null, role: "guest" }, secret);
		res.cookie("token", token, {
			maxAge: 60 * 30, // expires in 30 min
		});
		// res.cookie("token", token, {
		// 	httpOnly: true,
		// 	secure: process.env.NODE_ENV !== "development",
		// 	sameSite: "strict",
		// 	role: "guest",
		// 	maxAge: 60 * 30,
		// });
		// await console.log("stat");
		// console.log(reCookie);
		next();
	} else {
		const token = { id: null, role: "guest" };
		// // const token = jwt.sign({ id: null, role: "guest" }, secret);
		res.cookie("token", token, {
			maxAge: 60 * 30, // expires in 30 min
		});
		await console.log("stat");
		// console.log(reCookie);

		next();
	}
};

module.exports = { cookieSet };
