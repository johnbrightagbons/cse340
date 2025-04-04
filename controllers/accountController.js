const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs"); // Use bcrypt for password hashing and comparison

/* *****************************
Delivering Login View
***************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    message: req.flash("message"),
  });
}

/* *****************************
Handle Login Form Submission
***************************** */
async function handleLogin(req, res, next) {
  const { account_email, account_password } = req.body;

  // Check if both email and password are provided
  if (!account_email || !account_password) {
    req.flash("message", "Please provide both email and password.");
    return res.redirect("/account/login");
  }

  try {
    // Check if the email exists in the database
    const account = await accountModel.getAccountByEmail(account_email);
    if (!account) {
      req.flash("message", "No account found with the provided email.");
      return res.redirect("/account/login");
    }

    // Validate the password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      account_password,
      account.account_password
    );
    if (!isPasswordValid) {
      req.flash("message", "Invalid password.");
      return res.redirect("/account/login");
    }

    // If login is successful
    req.flash("message", "Login successful!");
    res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("message", "An error occurred. Please try again.");
    res.redirect("/account/login");
  }
}

/* *****************************
Delivering Registration View
***************************** */
// Registration Function
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    message: req.flash("message"),
    errors: null,
  });
}

// Export
module.exports = { buildLogin, handleLogin, buildRegister };
