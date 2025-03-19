/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)

/* ***********************
 * Index Route
 *************************/
app.get("/", (req, res) => {
  const nav = '<ul><li><a href="/" title="Home page">Home</a></li><li><a href="/inv/type/1" title="See our inventory of Custom vehicles">Custom</a></li><li><a href="/inv/type/5" title="See our inventory of Sedan vehicles">Sedan</a></li><li><a href="/inv/type/2" title="See our inventory of Sport vehicles">Sport</a></li><li><a href="/inv/type/3" title="See our inventory of SUV vehicles">SUV</a></li><li><a href="/inv/type/4" title="See our inventory of Truck vehicles">Truck</a></li></ul>'
  baseController.buildHome(req, res)
  res.render("index", { title: "Home", nav: nav })
})

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
