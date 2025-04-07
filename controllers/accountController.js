const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs"); // Use bcrypt for password hashing and comparison
const jwt = require("jsonwebtoken"); // Use jsonwebtoken for token generation
require("dotenv").config(); // Load environment variables from .env file

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

/* *****************************
 * Deliver Account Management View
 ***************************** */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    message: req.flash("You're logged in"),
    errors: null,
  });
}

/* *****************************
Process Login request 
* **************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body; // Get email and password from request body
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* *****************************
Register Account
***************************** */
const registerAccount = async (req, res, next) => {
  try {
    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body;

    // Validate input
    if (
      !account_firstname ||
      !account_lastname ||
      !account_email ||
      !account_password
    ) {
      req.flash("message", "All fields are required.");
      return res.redirect("/account/register");
    }

    // Check if email already exists
    const existingEmail = await accountModel.checkExistingEmail(account_email);
    if (existingEmail > 0) {
      req.flash("message", "Email is already registered. Please log in.");
      return res.redirect("/account/register");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Register the account
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult.rowCount > 0) {
      req.flash("message", "Registration successful! Please log in.");
      return res.redirect("/account/login");
    } else {
      throw new Error("Registration failed");
    }
  } catch (err) {
    console.error("Error in registerAccount:", err);
    req.flash("message", "Registration failed. Please try again.");
    res.redirect("/account/register");
  }
};

// Export
module.exports = {
  buildLogin,
  handleLogin,
  buildRegister,
  accountLogin,
  buildAccountManagement,
  registerAccount,
};
