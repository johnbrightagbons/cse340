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
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const token = req.cookies.jwt;
    let user = res.locals.accountData || null;

    if (token) {
      user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      let classificationList = null;
      if (
        user &&
        (user.account_type === "Employee" || user.account_type === "Admin")
      ) {
        classificationList = await utilities.buildClassificationList();
      }
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
    req.flash("notice", "Error loading account management");
    res.redirect("/account/login");
  }
}

// Deliver update view
async function buildUpdateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id || req.body.account_id);
    const account = await accountModel.getAccountById(account_id); // we will create this model fn
    if (!account) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/management");
    }
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      account,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
}

// Process account info update
async function updateAccount(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } =
      req.body;
    // Check if email is in use by another account
    const existing = await accountModel.getAccountByEmail(account_email);
    if (existing && existing.account_id != account_id) {
      req.flash("notice", "That email is already in use.");
      const nav = await utilities.getNav();
      return res.status(400).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: ["That email is already in use."],
        locals: req.body,
      });
    }

    const result = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
    const nav = await utilities.getNav();
    if (result) {
      req.flash("notice", "Account updated successfully.");
    } else {
      req.flash("notice", "Account update failed.");
    }
    // fetch fresh account and go back to management
    const account = await accountModel.getAccountById(account_id);
    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      user: account,
      message: req.flash("notice"),
      errors: null,
    });
  } catch (err) {
    next(err);
  }
}

// Process password change
async function changePassword(req, res, next) {
  try {
    const { account_id, account_password } = req.body;
    const hashed = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(account_id, hashed);
    const nav = await utilities.getNav();
    if (result) {
      req.flash("notice", "Password updated successfully.");
    } else {
      req.flash("notice", "Password update failed.");
    }
    const account = await accountModel.getAccountById(account_id);
    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      user: account,
      message: req.flash("notice"),
      errors: null,
    });
  } catch (err) {
    next(err);
  }
}

// logout handler
async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt");
    req.flash("notice", "You have been logged out.");
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  changePassword,
  updateAccount,
  accountLogout,
};
