/**
 * Created by amcomaschi on 15/06/16.
 */
var mongoose = require('mongoose');

var openingTimeSchema = new mongoose.Schema({
	days: { type: String, required: true },
	opening: { type: String },
	closing: { type: String },
	closed: { type: Boolean, required: true }
});

var reviewSchema = new mongoose.Schema({
	author: { type: String, required: true },
	rating: { type: String, required: true, min: 0, max: 5 },
	reviewText: { type: String, required:true },
	createdOn: { type: Date, "default": Date.now()}
});

var locationSchema = new mongoose.Schema({
	name: { type: String, required: true },
	address: { type: String },
	rating: { type: Number, "default": 0, min: 0, max: 5 },
	facilities: { type: [String]},
	coords: { type: [Number], index: '2dsphere'},
	openingTimes: { type: [openingTimeSchema]},
	reviews: { type: [reviewSchema]}
});

mongoose.model('Location', locationSchema);