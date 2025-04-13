/* *****************************
ACCOUNT ROUTES
***************************** */
const regValidate = require("../utilities/account-validation");
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");

// Apply JWT verification to all account routes
router.use(utilities.checkJWTToken);

/* *****************************
Public Routes
***************************** */
// ✅ Public routes
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post(
  "/login",
  regValidate.logInRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.handleLogin)
);
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// ✅ Protected routes
router.get(
  "/management",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

module.exports = router;
