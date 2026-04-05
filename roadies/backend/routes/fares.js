const express = require('express');
const router = express.Router();
const faresController = require('../controllers/faresController');

router.get('/calculate', faresController.calculateFare);
router.get('/surge/:hour', faresController.getSurgeMultiplier);

module.exports = router;