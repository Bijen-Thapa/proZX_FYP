const pg = require("pg");
// const { Client } = pg;
const { Pool } = pg;

const client = new Pool({
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
const connectDB = client;
// const connectDB = new pool();

module.exports = { connectDB };
