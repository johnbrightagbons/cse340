/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const path = require("path");
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const session = require("express-session");
const pool = require("./database");
const bodyParser = require("body-parser");
const accountRouter = require("./routes/accountRoute");
const invController = require("./controllers/invController");
const cookieParser = require("cookie-parser");

const app = express();
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // for parsing cookies
// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

app.use(utilities.checkJWTToken); // Middleware to check JWT token validity

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static);

/* ***********************
 * Index Route
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

/* ***********************
 * Account Routes
 *************************/
app.use("/account/", require("./routes/accountRoute"));
//app.post("/account/login", (req, res) => {
//const errors = req.flash("error"); // Example: Fetch errors from flash messages
// res.render("account/login", { errors });
//});
/* ***********************
 * Vehicle Management Routes
 *************************/
app.use("/inv", inventoryRoute);

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
