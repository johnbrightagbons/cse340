const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash("notice"),
  });
}

/* ****************************************
 *  Deliver Registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message: req.flash("notice"),
  });
}

/* ****************************************
 *  Register new account
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  try {
    // hash password before saving
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      return res
        .status(201)
        .render("account/login", { title: "Login", nav, errors: null });
    } else {
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: ["Registration failed. Please try again."],
        locals: req.body,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: ["Server error. Please try again later."],
      locals: req.body,
    });
  }
}

/* ****************************************
 *  Process login
 * *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash("notice", "Invalid credentials.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    const validPassword = await bcrypt.compare(
      account_password,
      accountData.account_password
    );
    if (!validPassword) {
      req.flash("notice", "Invalid credentials.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    // remove password before sending to JWT
    delete accountData.account_password;

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600 * 1000,
    });

    return res.redirect("/account/management");
  } catch (err) {
    console.error("Login error:", err);
    req.flash("notice", "Login failed.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}

/* ****************************************
 *  Deliver Account Management view
 * *************************************** */
async function buildAccountManagement(req, res) {
  try {
    let nav = await utilities.getNav();
    const token = req.cookies.jwt;
    let user = null;

    if (token) {
      user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }

    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      message: req.flash("message") || "You're logged in!",
      user,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildAccountManagement:", error);
    req.flash("message", "Error loading account management");
    res.redirect("/account/login");
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
};
