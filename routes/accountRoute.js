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

module.exports = router;
