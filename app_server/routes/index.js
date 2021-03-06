var express = require('express');
var router = express.Router();
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require ('../controllers/others');

/* Locations pages */
router.get('/', ctrlOthers.angularApp);
// router.get('/location/:locationId', ctrlLocations.locationInfo);
// router.get('/location/:locationId/reviews/new', ctrlLocations.addReview);
// router.post('/location/:locationId/reviews/new', ctrlLocations.doAddReview);

/* Other pages. */
router.get('/about', ctrlOthers.about);

module.exports = router;