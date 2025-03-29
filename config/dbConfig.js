const pg = require("pg");
const { Client, Pool } = require("pg");
// const { Client } = pg;
const mongoose = require("mongoose");

require("dotenv").config();

const client = new Client({
	user: "postgres",
	password: "02474250",
	host: "localhost",
	port: 5432,
	database: "postgres",
});
const pool = new Pool({
	user: "postgres",
	password: "02474250",
	host: "localhost",
	port: 5432,
	database: "postgres",
});

// const client = new Client({
//   user: "postgres",
//   password: "02474250",
//   host: "localhost",
//   port: 5432,
//   database: "postgres",
// });

// client.connect().then(console.log("DBconnected"));
// const connectDB = client;
// const connectDB = new pool();

const connectMongoDB = async (callback) => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_DB).then(async() => {
			console.log("mongo DB connected");
			await callback();
		});
	} catch (error) {
		console.error(`Error: ${error.message}`); // Log the error message
		// process.exit(1); // Exit process with failure code (1)
	} finally {
		console.log("mongo DB closed");
		await mongoose.disconnect();
	}
};

module.exports = { client, pool, connectMongoDB };
