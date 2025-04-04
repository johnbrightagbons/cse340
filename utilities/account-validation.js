// Account validation middleware for Express.js
// This module exports a set of validation rules
// // for user account creation and login.
// It uses the express-validator library to validate and sanitize input data.
// The validation rules include checks for required fields, valid email format, and password length.
// The module also exports a function to handle validation errors and return them in a structured format.
// The module is designed to be used in conjunction with an Express.js application to validate user input during account registration and login.
// It helps ensure that the data submitted by users meets the specified criteria before processing it further.
const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // Valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email already exists.");
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);

  console.log("Validation Errors:", errors.array()); // Log validation errors

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.logInRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (!emailExists) {
          throw new Error("Email does not exist.");
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/*  **********************************
 * Check Login Data
 * ********************************* */
validate.checkLoginData = async (req, res, next) => {
  const { account_email, account_password } = req.body;
  const errors = validationResult(req);

  console.log("Form Data:", req.body); // Debugging
  console.log("Login Errors:", errors.array());

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email,
      account_password,
    });
  }

  next();
};

module.exports = validate;
