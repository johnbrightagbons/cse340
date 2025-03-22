const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');

// Define your routes here
router.get('/type/:classificationId', invController.buildByClassificationId);

module.exports = router;