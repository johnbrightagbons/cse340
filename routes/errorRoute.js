const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

// Internal error route
router.get("/error-page", errorController.triggerError);

module.exports = router;
