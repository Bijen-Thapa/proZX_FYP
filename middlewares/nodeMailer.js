// Import the Nodemailer library
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const express = require("express");
const app = express();
const axios = require("axios");

require("dotenv").config();

const mailerSend = new MailerSend({
	apiKey: process.env.API_KEY,
});
console.log("API Key:", process.env.API_KEY);

const sentFrom = new Sender("bezentester@gmail.com", "Bob");

const recipients = [new Recipient("bishal984060@gmail.com", "Pam")];

const htmlContent = `
  <p>Hey there!</p>
  <p>Welcome to Your Business, we're happy to have you here!</p>
  <p>You'll be happy to know that your free trial awaits, all you need to do is head to your account, log in and start playing.</p>
  <p>Remember to check out our guides and contact support if you need anything.</p>
  <br>
  <p>Regards,</p>
  <p>The Your Business Team</p>
`;

const emailParams = new EmailParams()
	.setFrom(sentFrom)
	.setTo(recipients)
	.setReplyTo(sentFrom)
	.setSubject("Welcome! Your free trial is ready.")
	.setHtml(htmlContent)
	.setText(
		"Hey there! Welcome to Your Business, we're happy to have you here! You'll be happy to know that your free trial awaits, all you need to do is head to your account, log in and start playing. Remember to check out our guides and contact support if you need anything. Regards, The Your Business Team"
	);

const send = () => {
	mailerSend.email
		.send(emailParams)
		.then((response) => {
			console.log("Email sent successfully:", response);
			return response;
		})
		.catch((error) => {
			console.error("Error sending email:", error);
		});
};

axios.post("https://api.mailersend.com/v1/email", emailParams, {
	headers: {
		// "Content-Type": "application/json",
		"api-key": process.env.API_KEY,
	},
});

// // Create a transporter object
// const transporter = nodemailer.createTransport({
// 	service: "gmail", // Use your email provider
// 	// port: 587,
// 	// secure: false, // use SSL
// 	auth: {
// 		user: "bezenthapa@gmail.com",
// 		pass: "BishalBijen@982412",
// 	},
// });

// // Configure the mailoptions object
// const mailOptions = {
// 	from: "bezenthapa@gmail.com",
// 	to: "bishal984060@gmail.com",
// 	subject: "Sending Email using Node.js",
// 	text: "That was easy!",
// };

// // Send the email
// transporter.sendMail(mailOptions, function (error, info) {
// 	if (error) {
// 		console.log("Error:", error);
// 	} else {
// 		console.log("Email sent:", info.response);
// 	}
// });

module.exports = { send };
