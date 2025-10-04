// routes/inventoryRoute.js
// add the logic and structure to deliver
// inventory items, based on their classification,
// to the browser when a navigation link is clicked

// Declaration of needed resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");

/* *******************************
 * Inventory Management Route
 * /inv/
 * *******************************/
router.get("/", utilities.handleErrors(invController.buildManagement));

/* *******************************
 * Add Classification View
 * /inv/add-classification
 * *******************************/
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

/* *******************************
 * Add Vehicle View
 * /inv/add-vehicle
 * *******************************/
router.get(
  "/add-vehicle",
  utilities.handleErrors(invController.buildAddVehicle)
);

/* *******************************
 * Route to build the inventory by classification view
 * /inv/type/:classificationId
 * *******************************/
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

/* *******************************
 * Route for Inventory Item Details
 * /inv/detail/:inv_id
 * *******************************/
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildById));

// Add Classification View
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Handle Add Classification Post
router.post(
  "/add-classification",
  utilities.handleErrors(invController.addClassification)
);

// routes/inventoryRoute.js — add (with other routes)
router.get(
  "/add-vehicle",
  utilities.handleErrors(invController.buildAddVehicle)
);

router.post("/add-vehicle", utilities.handleErrors(invController.addVehicle));

/* ******************************
 * Get Inventory AJAX Route
 ***************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);
module.exports = router;
