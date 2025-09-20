//  baseController.js file contains the logic of the application

const utilities = require("../utilities/"); // imports an index.js file from a utilities folder
const baseController = {}; // creates an empty object named baseController

/********************************
 * creates an anonymous, asynchronous function and assigns the function to buildHome which
 * acts as a method of the baseController object
 *************************** */
baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav(); //  calls a getNav() function that will be found in the utilities > index.js file
  res.render("index", { title: "Home", nav });
};

module.exports = baseController;
