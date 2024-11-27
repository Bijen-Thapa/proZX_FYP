const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");
// const { MongoClient } = require("mongo");
const bcrypt = require("bcryptjs");
// INSERT INTO testUser1 (username, email, phoneno, address)
// VALUES ('asd', 'email', '123', 'address');

const pg = require("pg");
const { log } = require("async");
const { Client } = pg;

const { connectDB } = require("../config/dbConfig");
const send = require("send");
const { json } = require("body-parser");

router.post("/register", async (req, res) => {
  const { userName, email, phone, address, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  let encPassword = await bcrypt.hash(password, salt);
  connectDB.connect();

  const insert =
    "INSERT INTO testUser1 (username, email, phoneno, address, password) VALUES (";
  let query =
    insert +
    "'" +
    userName +
    "','" +
    email +
    "','" +
    phone +
    "','" +
    address +
    "','" +
    encPassword +
    "');";
  // console.log(typeof query);
  // res.send(query);
  let result = await connectDB
    .query(query)
    .then(res.send("Account Created Successfully!"));
  // res.redirect("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  connectDB.connect();

  let validPass = await connectDB.query(
    "SELECT password FROM testUser1 where email = '" + email + "';"
  );

  console.log(validPass.rows[0]);

  // return res.json(validPass.rows);
  const correctPass = await bcrypt.compare(
    password,
    validPass.rows[0].password
  );

  console.log(correctPass);

  if (correctPass) {
    const infor = await connectDB.query(
      "SELECT * FROM testuser1 WHERE email = '" + email + "';"
    );
    // connectDB.end();
    const info = infor.rows[0];

    res.render("profile", { info });
  } else {
    // connectDB.end();
    res.send("invalid email or password");
  }
});

router.post("/update", async (req, res) => {
  const { id, action } = req.body;
  const { userName, email, phoneNo, address } = req.body;
  if (action == "update") {
    connectDB.connect().then(() => {
      connectDB
        .query(
          "UPDATE testUser1 SET email = '" +
            email +
            "', username = '" +
            userName +
            "', phoneno = '" +
            phoneNo +
            "', address = '" +
            address +
            "' WHERE userid = " +
            id +
            ";"
        )
        .then(res.send("Account detail updated successfully!"));
    });
  } else {
    connectDB.connect().then(() => {
      connectDB
        .query("DELETE FROM testUser1 WHERE userid = " + id + ";")
        .then(res.send("Account deleted successfully!"));
    });
  }
});

module.exports = router;
