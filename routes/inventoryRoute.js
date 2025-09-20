// routes/inventoryRoute.js
// add the logic and structure to deliver
// inventory items, based on their classification,
//  to the browser when a navigation link is clicked

// Declaration of needed resources
const express = require("express"); // use express
const router = new express.Router(); // uses Express to create a new Router object
const invController = require("../controllers/invController"); // brings the inventory controller into this router document's scope to be used
const utilities = require("../utilities");

// Route to build the inventory by classification view

/*
  - "get":
      This tells Express to listen for HTTP GET requests.
      (GET requests typically happen when a user clicks a link or
      enters a URL in the browser.)

  - "/type/:classificationId":
      This is the URL pattern Express will watch for.
      The ":classificationId" part is a route parameter (dynamic value),
      meaning whatever value is provided after "/type/" in the URL
      will be captured and made available in req.params.classificationId.
      (Note: the "inv" segment of the route is not written here,
      but it is added later when this route is attached using
      app.use("/inv", invRoute). So the final path is "/inv/type/:classificationId".)

  - "invController.buildByClassification":
      This specifies which controller function should run when the route is matched.
      In this case, the buildByClassification function from invController
      will handle the request, typically by querying the database for all
      inventory items matching the classificationId and rendering a view.
*/
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route for Inventory Item Details
router.get("/detail/:inv_id", invController.buildById);

module.exports = router;
