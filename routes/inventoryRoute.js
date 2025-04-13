const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Ensure the route callback functions are correctly defined and imported
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.showVehicleDetail);

// Get a list of items in inventory based on the classification_id
router.get("/getInventory/:classification_id", invController.getInventoryJSON);

// Handle favicon.ico requests
router.get("/favicon.ico", invController.handleFavicon);

// Inventory management route
router.get("/management", invController.buildInventoryManagement);
router.get("/", (req, res) => {
  res.redirect("/inv/management");
});
//
module.exports = router;
