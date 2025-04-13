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
  // Set initial flash message if none exists
  if (!req.flash("message").length) {
    req.flash("message", "Please log in");
  }
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

    // Generate a JWT token for the user
    const accessToken = jwt.sign(
      { account_id: account.account_id, account_email: account.account_email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token as a cookie
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000,
      });
    }

    // If login is successful redirect to management view
    req.flash("message", "Login successful");
    res.redirect("/account/management");
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
  try {
    let nav = await utilities.getNav();
    const { buildClassificationList } = require("./invController");

    // Get user data from JWT token
    const token = req.cookies.jwt;
    let user = null;
    if (token) {
      user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }

    // Get classification list with error handling
    let classificationList;
    try {
      classificationList = await buildClassificationList();
    } catch (err) {
      console.error("Error getting classifications:", err);
      classificationList =
        "<select><option>Error loading classifications</option></select>";
    }

    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      message: req.flash("message") || "You're logged in!",
      classificationList,
      user, // Pass user data to view
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildAccountManagement:", error);
    req.flash("message", "Error loading account management");
    res.redirect("/account/management");
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
      // Auto-login after registration
      const accountData = await accountModel.getAccountByEmail(account_email);
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

      req.flash("message", "Registration successful!");
      return res.redirect("/account/management");
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
  buildAccountManagement,
  registerAccount,
};
