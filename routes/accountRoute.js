/* *****************************
ACCOUNT ROUTES
***************************** */
// Needed Resources
const express = require ("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")


/* *****************************
Delivering Login View
***************************** */
// Route to deliver the login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))


// Route to handle login form submission
router.post("/login", (req, res) => {
    res.send("Login form submitted (authentication logic to be implemented).")
})

/* *****************************
Delivering Registration View
***************************** */
// Route to deliver the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
 
//  Router  to registration form
router.post('/register', utilities.handleErrors(accountController.registerAccount))


// Export router
module.exports = router