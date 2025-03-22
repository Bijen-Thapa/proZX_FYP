const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");
// const { MongoClient } = require("mongo");
const bcrypt = require("bcryptjs");
// INSERT INTO testUser1 (username, email, phoneno, address)
// VALUES ('asd', 'email', '123', 'address');

const jwt = require("jsonwebtoken");

const pg = require("pg");
const { log, nextTick } = require("async");
const { Client } = pg;

const { client, pool } = require("../config/dbConfig");
const send = require("send");
const { json } = require("body-parser");
const table = require("../config/queries.json");

const { JWTverification } = require("../middlewares/verifyJWT");

// const { verifyMail } = require("../middlewares/emailVerification");
const { sendMail } = require("../middlewares/sendMail");
const status = require("statuses");

const {
	validateRegistration,
	validateLogin,
} = require("../middlewares/validator");
// router.post("/register", validateRegistration, async (req, res, next) => {
router.post("/register", async (req, res, next) => {
	try {
		const { userName, email, phone, address, password } = req.body;
		const salt = await bcrypt.genSalt(10);
		let encPassword = await bcrypt.hash(password, salt);
		let result = null;
		pool.connect().then(async () => {
			const insert = table.INSERT_NEW_USER;
			let values = [userName, email, phone, address, encPassword];

			result = await pool.query(insert, values, (err, result) => {
				if (err) {
					console.log("Adding new user failed");
					res.json({ status: 400, message: err.detail });
				} else {
					console.log("new user added successfully");
					const token = jwt.sign({ email }, process.env.JWT_SECRET, {
						expiresIn: "1h",
					});
					res.json({ message: "success", token: token, status: 200 });
				}
			});
		});

		// const insert = table.INSERT_NEW_USER;
		// let values = [userName, email, phone, address, encPassword];
		// // console.log(typeof query);
		// // res.send(query);

		// let result = await pool.query(insert, values, (err, result) => {
		// 	if (err) {
		// 		// console.error('Error inserting data', err);
		// 		console.log(err);
		// 		res.send(err);
		// 	} else {
		// 		console.log("Account Created Successfully!");
		// 		const token = jwt.sign({ email }, process.env.JWT_SECRET, {
		// 			expiresIn: "1h",
		// 		});
		// 		res.send(token);
		// 		// res.json({
		// 		// 	status: 200,
		// 		// 	message: "success",
		// 		// });

		// 		// res.redirect("login");
		// 		// next();
		// 	}
		// });
	} catch (err) {
		res.json({
			status: 400,
			message: err.message,
		});
	}
});

// router.post("/login", validateLogin, async (req, res) => {
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const insert = table.SELECT_USER;
		let values = [email];

		// Connect to pool and execute query
		const result = await pool.query(insert, values);

		if (!result.rows || result.rows.length === 0) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const user = result.rows[0];
		const correctPass = await bcrypt.compare(password, user.password);

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

// router.post("/profile/update", JWTverification, async (req, res) => {
router.put("/profile/update", async (req, res) => {
	console.log("profile update endpoint");

	const { id, action } = req.body;
	const { userName, email, phoneNo, address } = req.body;
	if (action == "update") {
		pool.connect().then(() => {
			pool
				.query(table.UPDATE_USER, [userName, phoneNo, address, email])
				.then(res.send("Account detail updated successfully!"));
		});
	} else {
		const del = table.DELETE_USER;
		const values = [id];
		pool.connect().then(() => {
			pool
				// .query("DELETE FROM testUser1 WHERE userid = " + id + ";")
				.query(del, values)
				.then(res.send("Account deleted successfully!"));
		});
	}
});

router.delete("/profile/delete", async (req, res) => {
	const { id } = req.body;
	const del = table.DELETE_USER;
	const values = [id];
	pool.connect().then(() => {
		pool.query(del, values).then(res.send("Account deleted successfully!"));
	});
});

router.post("/forgot", JWTverification, async (req, res) => {
	const { email } = req.body;
	const token = jwt.sign({ email }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});
	const mailOptions = {
		to: email,
		subject: "Reset Password",
		text: `Please click on the link to reset your password: http://localhost:3000/reset/${token}`,
	};
	sendMail(email, "Reset Password", mailOptions.text);
	res.send("Email sent successfully");

	// res.send("aaa");
});

router.post("/logout", async (req, res) => {
	try {
		res.clearCookie("token");
		return res.status(200).json({
			status: 200,
			message: "Logged out successfully",
		});
	} catch (err) {
		return res.status(500).json({
			status: 500,
			message: "Error during logout",
		});
	}
});

module.exports = router;

// const insert =
// 			'INSERT INTO employees(column1, column2) VALUES (value1, value2)';
// 		const values = ['value1', 'value2'];

// client.query(insert, values, (err, result) => {
// 	if (err) {

// 		console.error('Error inserting data', err);
// 	} else {
// 		console.log('Data inserted successfully');
// 	}
