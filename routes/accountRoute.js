/* *****************************
ACCOUNT ROUTES
***************************** */
// Needed Resources
const regValidate = require("../utilities/account-validation");
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");

/* *****************************
Delivering Login View
***************************** */
// Route to deliver the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to handle login form submission
router.post("/login", utilities.handleErrors(accountController.handleLogin));

/* *****************************
Delivering Registration View
***************************** */
// Route to deliver the registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

//  Router  to registration form
router.post(
  "/register",
  regValidate.registationRules(), // Apply validation rules
  regValidate.checkRegData, // Check for validation errors
  utilities.handleErrors(accountController.registerAccount) // Handle registration logic
);

/* *****************************
Process the login attempt
***************************** */
// Route to process login attempt
router.post(
  "/login",
  regValidate.logInRules(), // Apply login validation rules
  regValidate.checkLoginData, // Check for validation errors
  utilities.handleErrors(accountController.processLogin) // Handle login logic
);
// Export router
module.exports = router;
