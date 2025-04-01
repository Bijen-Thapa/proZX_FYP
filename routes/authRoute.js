const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");
// const { MongoClient } = require("mongo");
const bcrypt = require("bcryptjs");
// INSERT INTO testUser1 (username, email, phoneno, address)
// VALUES ('asd', 'email', '123', 'address');

const crypto = require("crypto");

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
// router.post("/register", async (req, res, next) => {
// 	try {
// 		const { userName, email, phone, address, password } = req.body;
// 		const salt = await bcrypt.genSalt(10);
// 		let encPassword = await bcrypt.hash(password, salt);
// 		let result = null;
// 		pool.connect().then(async () => {
// 			const insert = table.INSERT_NEW_USER;
// 			let values = [userName, email, phone, address, encPassword];

// 			result = await pool.query(insert, values, (err, result) => {
// 				if (err) {
// 					console.log("Adding new user failed");
// 					res.json({ status: 400, message: err.detail });
// 				} else {
// 					console.log("new user added successfully");
// 					const token = jwt.sign({ email }, process.env.JWT_SECRET, {
// 						expiresIn: "1h",
// 					});
// 					res.json({ message: "success", token: token, status: 200 });
// 				}
// 			});
// 		});

// 		// const insert = table.INSERT_NEW_USER;
// 		// let values = [userName, email, phone, address, encPassword];
// 		// // console.log(typeof query);
// 		// // res.send(query);

// 		// let result = await pool.query(insert, values, (err, result) => {
// 		// 	if (err) {
// 		// 		// console.error('Error inserting data', err);
// 		// 		console.log(err);
// 		// 		res.send(err);
// 		// 	} else {
// 		// 		console.log("Account Created Successfully!");
// 		// 		const token = jwt.sign({ email }, process.env.JWT_SECRET, {
// 		// 			expiresIn: "1h",
// 		// 		});
// 		// 		res.send(token);
// 		// 		// res.json({
// 		// 		// 	status: 200,
// 		// 		// 	message: "success",
// 		// 		// });

// 		// 		// res.redirect("login");
// 		// 		// next();
// 		// 	}
// 		// });
// 	} catch (err) {
// 		res.json({
// 			status: 400,
// 			message: err.message,
// 		});
// 	}
// });

// router.post("/login", validateLogin, async (req, res) => {
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const result = await pool.query(table.SELECT_USER, [email]);

		if (!result.rows || result.rows.length === 0) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const user = result.rows[0];

		// Check if user is verified
		if (!user.is_verified) {
			// Generate new verification credentials
			const token = crypto.randomBytes(32).toString("hex");
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

			await pool.query(
				"UPDATE users SET verification_token = $1, verification_otp = $2, verification_expires = $3 WHERE email = $4",
				[token, otp, expires, email]
			);

			return res.status(403).json({
				status: 403,
				message: "Email not verified. New verification email sent.",
				email: email,
			});
		}

		const correctPass = await bcrypt.compare(password, user.password);

		if (correctPass) {
			const token = jwt.sign(
				{ id: user.userid, email },
				process.env.JWT_SECRET,
				{
					expiresIn: "1h",
				}
			);

			res.cookie("token", token, {
				httpOnly: true,
				maxAge: 1000 * 60 * 60,
			});

			return res.json({
				status: 200,
				token,
				user: {
					id: user.userid,
					username: user.username,
					email: user.email,
				},
			});
		} else {
			return res.status(401).json({ message: "Invalid email or password" });
		}
	} catch (err) {
		res.status(500).json({
			status: 500,
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

// Add verification routes
router.get("/verify/:token", async (req, res) => {
	try {
		const { token } = req.params;
		const result = await pool.query(
			"UPDATE users SET is_verified = TRUE WHERE verification_token = $1 AND verification_expires > NOW() RETURNING email",
			[token]
		);

		if (result.rows.length === 0) {
			return res.status(400).json({
				status: 400,
				message: "Invalid or expired verification link",
			});
		}

		res.json({
			status: 200,
			message: "Email verified successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});

router.post("/verify-otp", async (req, res) => {
	try {
		const { email, otp } = req.body;
		const result = await pool.query(
			"UPDATE users SET is_verified = TRUE WHERE email = $1 AND verification_otp = $2 AND verification_expires > NOW() RETURNING userid",
			[email, otp]
		);

		if (result.rows.length === 0) {
			return res.status(400).json({
				status: 400,
				message: "Invalid or expired OTP",
			});
		}

		res.json({
			status: 200,
			message: "Email verified successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});

router.post("/resend-verification", async (req, res) => {
	try {
		const { email } = req.body;
		const token = crypto.randomBytes(32).toString("hex");
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		await pool.query(
			"UPDATE users SET verification_token = $1, verification_otp = $2, verification_expires = $3 WHERE email = $4",
			[token, otp, expires, email]
		);

		// Send verification email
		const verificationLink = `http://localhost:5173/verify-email/${token}`;
		const emailText = `
            Welcome to Geet Sansar!
            
            Your verification OTP is: ${otp}
            
            Or click this link to verify your email:
            ${verificationLink}
            
            This verification will expire in 24 hours.
        `;

		await sendMail(email, "Verify Your Email", emailText);

		res.json({
			status: 200,
			message: "Verification email sent successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});

// Modify the existing register route
router.post("/register", async (req, res) => {
	try {
		const { userName, email, phone, address, password } = req.body;
		const salt = await bcrypt.genSalt(10);
		const encPassword = await bcrypt.hash(password, salt);

		// Generate verification token and OTP
		const token = crypto.randomBytes(32).toString("hex");
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		const values = [
			userName,
			email,
			phone,
			address,
			encPassword,
			token,
			otp,
			expires,
		];

		const result = await pool.query(
			"INSERT INTO users (username, email, phoneno, address, password, verification_token, verification_otp, verification_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING userid",
			values
		);

		// Send verification email
		const verificationLink = `http://localhost:5173/verify-email/${token}`;
		const emailText = `
            Welcome to Geet Sansar!
            
            Your verification OTP is: ${otp}
            
            Or click this link to verify your email:
            ${verificationLink}
            
            This verification will expire in 24 hours.
        `;

		await sendMail(email, "Verify Your Email", emailText);

		res.json({
			status: 200,
			message:
				"Registration successful. Please check your email for verification.",
			email: email,
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});
