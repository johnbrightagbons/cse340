// Declaration of needed resources
const express = require("express"); // use express
const router = new express.Router(); // uses Express to create a new Router object
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

/* ****************************************
 *  A get request for the account route
 * *************************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* ****************************************
 *  Route to build register view
 * *************************************** */
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

/* ****************************************
 *  Route to build registration process
 * *************************************** */
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

/* ****************************************
 *  Route to process login
 * *************************************** */
router.post(
  "/login",
  regValidate.loginRules(), // validate login inputs (e.g., email + password)
  regValidate.checkLoginData, // check for validation errors
  utilities.handleErrors(accountController.accountLogin) // send data to controller
);

/* ****************************************
 *  Route to process management view
 * *************************************** */
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

/* ****************************************
 *  Account Management view
 * *************************************** */
router.get(
  "/management",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

module.exports = router;
