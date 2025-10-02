// utilities/index.js  hold functions that are "utility" in nature, meaning that
// it will be reuse over and over,
// but they don't directly belong to the M-V-C structure
const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model"); // requires the inventory-model file, so it can be used to get data from the database
const Util = {}; // creates an empty Util object

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
// Creates an asynchronous function, that accepts request, response
// and next as methods as parameters and stores the function in getNav
// variable of  a Util object
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications(); // calls the getClassifications() function from the inventory-model file and stores the returned resultset into the data variable
  let list = "<ul>"; // creates a JavaScript variable named list and assigns a string to it
  list += '<li><a href="/" title="Home page">Home</a><li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the Vehicle Details view HTML
 * ************************************ */
Util.formatVehicleHtml = function (vehicle) {
  if (
    !vehicle.inv_make ||
    !vehicle.inv_model ||
    !vehicle.inv_image ||
    !vehicle.inv_year ||
    !vehicle.inv_price ||
    !vehicle.inv_miles ||
    !vehicle.inv_description
  ) {
    throw new Error("Vehicle data is incomplete");
  }

  return `
      <div class="vehicle-detail">
          <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
          <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${
    vehicle.inv_model
  }">
          <p><strong>Year:</strong> ${vehicle.inv_year}</p>
          <p><strong>Price:</strong> $${parseInt(
            vehicle.inv_price
          ).toLocaleString()}</p>
          <p><strong>Mileage:</strong> ${parseInt(
            vehicle.inv_miles
          ).toLocaleString()} miles</p>
          <p>${vehicle.inv_description}</p>
      </div>
  `;
};

/* **************************************
 * Build the classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let list =
    '<select name="classification_id" id="classificationList" required>';
  list += '<option value="">Choose a Classification</option>';
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}"`;
    // pre-select if classification_id is passed
    if (classification_id == row.classification_id) {
      list += " selected";
    }
    list += `>${row.classification_name}</option>`;
  });
  list += "</select>";
  return list;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
