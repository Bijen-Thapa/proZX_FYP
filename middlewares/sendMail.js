const nodeMailer = require("nodemailer");

require("dotenv").config();

const transporter = nodeMailer.createTransport({
	secure: true,
	host: "smtp.gmail.com",
	port: 465,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASS,
	},
});

// Configure the mailoptions object
// const mailOptions = {
// 	to: "bishal984060@gmail.com",
// 	subject: "Sending Email using Node.js",
// 	text: "That wassssssssssssssssss easy!",
// };

// Send the email
// transporter.sendMail(mailOptions, function (error, info) {
// 	if (error) {
// 		console.log(error);
// 	} else {
// 		console.log("Email sent: " + info.response);
// 	}
// });

const sendMail = (to, subj, msg) => {
	transporter.sendMail(
		{
			to: to,
			subject: subj,
			text: msg,
		},
		function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
			}
		}
	);
};

module.exports = { sendMail };
