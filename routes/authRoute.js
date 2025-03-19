const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");
// const { MongoClient } = require("mongo");
const bcrypt = require("bcryptjs");
// INSERT INTO testUser1 (username, email, phoneno, address)
// VALUES ('asd', 'email', '123', 'address');

const jwt = require("jsonwebtoken");

const pg = require("pg");
const { log } = require("async");
const { Client } = pg;

const { connectDB } = require("../config/dbConfig");
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
router.post("/register", validateRegistration, async (req, res, next) => {
	try {
		const { userName, email, phone, address, password } = req.body;
		const salt = await bcrypt.genSalt(10);
		let encPassword = await bcrypt.hash(password, salt);
		connectDB.connect();

		const insert = table.INSERT_NEW_USER;
		let values = [userName, email, phone, address, encPassword];
		// console.log(typeof query);
		// res.send(query);

		let result = await connectDB.query(insert, values, (err, result) => {
			if (err) {
				// console.error('Error inserting data', err);
				console.log(err);
				res.send(err);
			} else {
				console.log("Account Created Successfully!");
				const token = jwt.sign({ email }, process.env.JWT_SECRET, {
					expiresIn: "1h",
				});
				res.send(token);
				// res.json({
				// 	status: 200,
				// 	message: "success",
				// });

				// res.redirect("login");
				// next();
			}
		});
	} catch (err) {
		res.json({
			status: 400,
			message: err.message,
		});
	}
});

router.post("/login", validateLogin, async (req, res) => {
	try {
		const { email, password } = req.body;

		const insert = table.SELECT_USER;
		connectDB.connect();
		const values = [email];
		console.log("xx", values);

		let validPass = await connectDB.query(insert, values);
		console.log(validPass.rows);

		if (validPass.rows.length == 0) {
			// connectDB.end();
			return res.send("invalid email or password");
		}

		// return res.json(validPass.rows);
		const correctPass = await bcrypt.compare(
			password,
			validPass.rows[0].password
		);

		if (correctPass) {
			const infor = await connectDB.query(table.SELECT_USER, [email]);
			// connectDB.end();
			const info = infor.rows[0];
			const token = jwt.sign({ email }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});

			res.cookie("token", token, {
				httpOnly: true,
				maxAge: 1000 * 60 * 60,
			});
			res.token = token;
			console.log("eeee", res.token);
			res.json({ aa: "aaa", token: token });
			// res.send("Login Successful");
			// res.render("profile", { info });
		} else {
			// connectDB.end();
			res.send("invalid email or password");
		}
	} catch (err) {
		res.json({
			status: 400,
			message: err.message,
		});
	}
});

router.post("/update", JWTverification, async (req, res) => {
	const { id, action } = req.body;
	const { userName, email, phoneNo, address } = req.body;
	if (action == "update") {
		connectDB.connect().then(() => {
			connectDB
				.query(table.UPDATE_USER, [userName, phoneNo, address, email])
				.then(res.send("Account detail updated successfully!"));
		});
	} else {
		const del = table.DELETE_USER;
		const values = [id];
		connectDB.connect().then(() => {
			connectDB
				// .query("DELETE FROM testUser1 WHERE userid = " + id + ";")
				.query(del, values)
				.then(res.send("Account deleted successfully!"));
		});
	}
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
