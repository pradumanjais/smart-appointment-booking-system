const express = require('express');
const router = express.Router();
const { getHospitals, getUnifiedLocations } = require('../controllers/hospitalController');

router.get('/', getHospitals);
router.get('/locations', getUnifiedLocations);

module.exports = router;
