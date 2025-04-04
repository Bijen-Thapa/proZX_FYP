const app = require("./app"); // Import the Express app
const http = require("http");

const dotenv = require("dotenv");

dotenv.config();

const checkAdmin = require("./config/queries.json").CHECK_ADMIN;
const bcrypt = require("bcryptjs");
// connect to database and check if admin exist or not, if not then create onr
const { client, pool } = require("./config/dbConfig");
const { json } = require("express");
const fs = require("fs");

//Read file and parse it to string
const sqlQuery = fs.readFileSync("./utils/database.sql", 'utf-8');


async function initializeAdmin() {
	try {
		console.log("connected to DB for admin - at startup");
		const qur = await pool.query(checkAdmin);

		if (!qur.rows.length) {
			console.log("admin does not exist, creating one");
			const createAdmin = require("./config/queries.json").CREATE_ADMIN;
			const adminCredential = JSON.parse(process.env.ADMIN_CREDENTIALS);

			const salt = await bcrypt.genSalt(10);
			let encPassword = await bcrypt.hash(adminCredential.password, salt);
			const admin = [
				adminCredential.adminName,
				adminCredential.email,
				adminCredential.phoneNo,
				encPassword,
			];

			await pool.query(createAdmin, admin);
			console.log("admin created successfully");
		} else {
			console.log("admin exists");
		}
	} catch (error) {
		console.error("Error during admin initialization:", error.message);
	}
}

// Initialize the database connection and admin check
pool
	.connect()
	.then(() => {
		initializeAdmin();
	
	})
	.catch((err) => console.error("Database connection error:", err.message));

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
