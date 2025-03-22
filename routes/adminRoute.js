const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const pg = require("pg");
const { log } = require("async");

const { client, pool } = require("../config/dbConfig");
const send = require("send");
const { json } = require("body-parser");
const table = require("../config/queries.json");

const { JWTverification } = require("../middlewares/verifyJWT");

const { sendMail } = require("../middlewares/sendMail");
const status = require("statuses");

// router.post("/login", async (req, res) => {
// 	try {
// 		const { email, password } = req.body;
// 		console.log("admin ma");

// 		const insert = table.SELECT_ADMIN_Pass;
// 		let validPass = null;
// 		let values = [email];
// 		pool.connect().then(async () => {
// 			validPass = await pool.query(insert, values, (err, result) => {
// 				if (err) {
// 					console.log("admin failed");
// 					res.send("invalid email or password", err);
// 				} else {
// 					console.log("admin login Successful");
// 					const token = jwt.sign({ email }, process.env.JWT_SECRET, {
// 						expiresIn: "1h",
// 					});
// 					res.cookie("token", token, {
// 						httpOnly: true,
// 						maxAge: 1000 * 60 * 60,
// 					});
// 					// res.send(token);
// 					res.json({ token: token });
// 				}
// 			});
// 		});

// 		const correctPass = await bcrypt.compare(
// 			password,
// 			validPass.rows[0].password
// 		);

// 		if (correctPass) {
// 			const infos = await pool.query(insert, values);
// 			const info = infos.rows[0];
// 			const token = jwt.sign({ email }, process.env.JWT_SECRET, {
// 				expiresIn: "1h",
// 			});
// 			res.cookie("token", token, {
// 				httpOnly: true,
// 				maxAge: 1000 * 60 * 60,
// 			});
// 			res.token = token;
// 			console.log("eeee", res.token);
// 			res.json({ aa: "aaa", token: token });
// 		} else {
// 			// connectDB.end();
// 			res.send("invalid email or password");
// 		}
// 	} catch (error) {
// 		res.json({
// 			status: 400,
// 			message: error.message,
// 		});
// 	}
// });

// router.post("/login", validateLogin, async (req, res) => {
router.post("/login", async (req, res) => {
	try {
		console.log("admin ma");

		const { email, password } = req.body;
		const insert = table.SELECT_ADMIN_Pass;
		let values = [email];

		// Connect to pool and execute query
		const result = await pool.query(insert, values);


		if (!result.rows || result.rows.length === 0) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const user = result.rows[0];
		const correctPass = await bcrypt.compare(password, user.password);

		console.log("cp", correctPass);
		
		if (correctPass) {
			const token = jwt.sign({ email }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});

			res.cookie("token", token, {
				httpOnly: true,
				maxAge: 1000 * 60 * 60,
			});

			return res.json({ token });
		} else {
			return res.status(401).json({ message: "Invalid email or password" });
		}
	} catch (err) {
		res.status(400).json({
			status: 400,
			message: err.message,
		});
	}
});

module.exports = router;
