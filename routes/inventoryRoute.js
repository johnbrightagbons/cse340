const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');

// Ensure the route callback functions are correctly defined and imported
router.get('/type/:classificationId', invController.buildByClassificationId);
router.get('/detail/:inv_id', invController.showVehicleDetail);

// Handle favicon.ico requests
router.get('/favicon.ico', invController.handleFavicon);

module.exports = router;