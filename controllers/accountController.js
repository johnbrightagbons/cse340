const utilities = require("../utilities/"); // path to utilities
const accountModel = require("../models/account-model")

/* *****************************
Delivering Login View
***************************** */
//  Login view Function
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav(); 
    res.render("account/login", {
        title: "Login", 
        nav,
        message: req.flash("message"), 
    });
}

/* *****************************
Delivering Registration View
***************************** */
// Registration Function
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        message: req.flash("message"), 
        errors: null,
    }
    )    
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    
    console.log("Registration Data:", {
        account_firstname,
        account_lastname,
        account_email,
        account_password,
      }) // Debug Line

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

// Export
module.exports = { buildLogin, buildRegister, registerAccount };