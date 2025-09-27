const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "Please Log in to Continue");
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver Registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "error", "Please Register");
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // -------------------------
  // Server-side validation
  // -------------------------
  const errors = [];

  if (!account_firstname || !account_firstname.trim())
    errors.push("First name is required.");
  if (!account_lastname || !account_lastname.trim())
    errors.push("Last name is required.");
  if (!account_email || !account_email.trim() || !account_email.includes("@"))
    errors.push("Valid email is required.");
  if (!account_password || account_password.length < 6)
    errors.push("Password must be at least 6 characters.");

  // -------------------------
  // If validation fails
  // -------------------------
  if (errors.length > 0) {
    res.status(400).render("account/register", {
      title: "Registration",
      nav,
      errors,
      locals: req.body, // pre-fill form fields
    });
    return; // Stop further execution
  }

  // -------------------------
  // If validation passes, save account
  // -------------------------
  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", `Sorry, the registration failed.`);
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: ["Registration failed. Please try again."],
        locals: req.body,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: ["Server error. Please try again later."],
      locals: req.body,
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount };
