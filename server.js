/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts"); // Layout support
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs"); // Set the view engine to EJS
app.use(expressLayouts); // Use express-ejs-layouts
app.set("layout", "./layouts/layout"); // Set the default layout

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index Route
app.get("/", function (req, res) {
  res.render("index", { title: "Home" }); // Render the index.ejs file
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
