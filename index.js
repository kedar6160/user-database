// Import necessary modules
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");

// Create express app
const app = express();

// Create a MySQL database connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "world",
});

// Set up middleware for the app
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Route for fetching data from a remote API and inserting it into the database
app.get("/fetch", (req, res) => {
  axios
    .get("https://randomuser.me/api/?results=50")
    .then((response) => {
      // Extract the user data from the API response
      const users = response.data.results;
      // Map the user data to an array of arrays to match the MySQL table structure
      const values = users.map((user) => {
        return [user.name.first, user.name.last, user.email];
      });
      // SQL statement for inserting the user data into the MySQL table
      const sql =
        "INSERT INTO usersdata (`firstName`, `lastName`, `email`) VALUES ?";
      // Execute the SQL statement with the user data as the parameter
      db.query(sql, [values], (err, results) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else {
          console.log(`${results.affectedRows} records inserted`);
          res.send(results);
        }
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

//  Route for deleting all data from the usersdata table
app.delete("/delete", (req, res) => {
  const sqlDelete = "TRUNCATE TABLE usersdata";
  db.query(sqlDelete, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      console.log(`${results.affectedRows} records deleted`);
      res.send(results);
    }
  });
});

// Route for the table page
app.get("/table.html", (req, res) => {
  res.sendFile(__dirname + "/table.html");
});

// Route for retrieving data from the usersdata table
app.get("/users", (req, res) => {
  const sql = "SELECT `firstName`, `lastName`,`email` FROM usersdata";
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      console.log(`${results.length} records retrieved`);
      res.send(results);
    }
  });
});

// Start the server and listen for incoming requests
app.listen(5000, () => {
  console.log("server is running on port 5000");
});

// Export the app for use in other modules
module.exports = app;
