/**
 * Created by ariel on 16/06/16.
 */
var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var theEarth = ( function(){

    var earthRadius = 6371; // km, miles is 3959
    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        getDistanceFromRads : getDistanceFromRads,
        getRadsFromDistance : getRadsFromDistance
    };
})();

var processLocations = function (res, results) {
    var locations = [];
    results.forEach(function(doc){
        locations.push({
            distance: theEarth.getDistanceFromRads(doc.dis),
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id
        });
    });
    sendJsonResponse(res, 200, locations);
}

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.locationsCreate = function (req, res) {
    console.log("Creating location")
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1
        },{
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
        }]
    }, function (err, location) {
        if(err){
            sendJsonResponse(res, 400, err);
        }else{
            sendJsonResponse(res, 200, location);
        }
    })
};

module.exports.locationsListByDistance = function (req, res) {

    console.log("Lng: " + req.query.lng + "\nLat: " + req.query.lat + "\nDistance: " +req.query.maxDistance);

    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(req.query.maxDistance),
        num: 10
    };
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };

    if((!lng && lng !==0) || (!lat && lat!==0)){
        sendJsonResponse(res, 404, {
            "meesage": "lng and lat parameters are required"
        });
        return;
    }

    Loc.geoNear(point, geoOptions, function (err, results, stats) {

        if(err){
            sendJsonResponse(res, 404, err);
        }else {
            processLocations(res, results);
        }
    });
};

module.exports.locationsReadOne = function (req, res) {

    if(req.params && req.params.locationId) {
        Loc
            .findById(req.params.locationId)
            .exec(function (err, location) {

                if(!location){
                    sendJsonResponse(res, 404, {
                        "message": "locationId not found"
                    });
                    return;
                } else if (err){
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 200, location);
            });
    } else{
      sendJsonResponse(res, 404, {
          "message": "No locationId in request"
      });
    }
};

module.exports.locationsUpdateOne = function (req, res) {
    if(!req.params.locationId) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationId is required"
        });
        return;
    }

    Loc
        .findById(req.params.locationId)
        .select('-reviews -rating')
        .exec(
            function (err, location) {
                if(!location){
                    sendJsonResponse(res, 404, {
                        "message": "locationId not found"
                    });
                }else if(err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }

                location.name = req.params.name;
                location.address = req.params.address;
                location.facilities = req.body.facilities.split(",");
                location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
                location.openingTimes = [{
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1
                }, {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2
                }];

                location.save(function (err, location) {
                    if(err){
                        sendJsonResponse(res, 400, err);
                    }else {
                        sendJsonResponse(res, 200, location);
                    }
                });
            }
        );
};

module.exports.locationsDeleteOne = function (req, res) {
    var locationId = req.params.locationId;

    if(locationId){
        Loc
            .findByIdAndRemove(locationId)
            .exec(function (err, location) {
                if(err){
                    sendJsonResponse(res, 400, err);
                    return;
                }
                sendJsonResponse(res, 200, null);
            });
    }else{
        sendJsonResponse(res, 404, {
            "message": "No locationId"
        });
    }
};
