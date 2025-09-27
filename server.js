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
const baseController = require("./controllers/baseController"); // require statement to bring the base controller into scope
const inventoryRoute = require("./routes/inventoryRoute"); // require inventory routes
const utilities = require("./utilities");
const errorRoutes = require("./routes/errorRoute");
const session = require("express-session");
const pool = require("./database/");
const accountController = require("./controllers/accountController");
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser");

/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* ***********************
 * Flash Message Middleware
 * ************************/
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

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

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome)); // Render the index.ejs file

// Inventory Routes
app.use("/inv", inventoryRoute);

// Account Login Routes
app.use("/account", accountRoute);

// Error Route
app.use("/", errorRoutes);

/* ***********************
 * File not Found Route
 *************************/
app.use(async (req, res, next) => {
  next({
    status: 404,
    message:
      "Oops!, You weren’t supposed to see this... Now we have to erase your memory 🕶️👽",
  });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
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
