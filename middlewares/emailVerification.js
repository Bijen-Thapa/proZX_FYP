const mailer = require("nodemailer");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const verifyMail = async (req, res, next) => {
	console.log("eeee", process.env.EMAIL, process.env.EMAIL_PASS);

	const transporter = mailer.createTransport({
		service: "gmail",
		// host: "smtp.gmail.com",
		// port: 587,
		// secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASS,
		},
	});

	const token = jwt.sign(
		{
			data: "Token Data",
		},
		process.env.SECRET,
		{
			expiresIn: "15m",
		}
	);

	const otp = "aa";

	const mailConfigurations = {
		from: process.env.EMAIL,

		to: req.email,

		// Subject of Email
		subject: "Email Verification",

		// This would be the text of email body
		text: `Hi! There, You have recently visited 
           our website and entered your email.

		   Here's the OTP for verification: ${otp}
           Please follow the given link to verify your email
           http://localhost:3000/verify/${token} 
           Thanks`,
	};

	transporter.verify((error, success) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Server is ready to take messages");
		}
	});

	// transporter.sendMail(mailConfigurations, (error, info) => {
	// 	// if (error) throw Error(error);
	// 	if (error) {
	// 		console.log(error);
	// 	} else {
	// 		console.log("Email Sent Successfully");
	// 		console.log(info);
	// 	}
	// });

	next();
};

module.exports = { verifyMail };
