var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Calendar = mongoose.model('Calendar');
var Group = mongoose.model('Group');
var Notification = mongoose.model('Notification');
var Event = mongoose.model('Event');
var Invite = mongoose.model('Invite');

var jwt = require('express-jwt');
var auth = jwt({secret: process.env.HALOCOMPSECRET, userProperty: 'payload'});
var _ = require('underscore');

router.param('user', function(req, res, next, id) {
    var query = User.findById(id);

    query.exec(function (err, user) {
	if (err)
	    return next(err);
	if (!user)
	    return res.status(404).json({message: 'User not found'});
	req.user = user;
	return next();
    });
});

router.param('group', function(req, res, next, id) {
    var query = User.findById(id);

    query.exec(function (err, user) {
	if (err)
	    return next(err);
	if (!user)
	    return res.status(404).json({message: 'User not found'});
	req.user = user;
	return next();
    });
});

router.param('calendar', function(req, res, next, id) {
    var query = User.findOne(
	{_id: req.user._id},
	{'calendars._id': id}
    );

    query.exec(function (err, user) {
	if (err)
	    return next(err);
	if (!user)
	    return res.status(404).json({Message: 'Calendar not found in list, or no such user'});
	if (!user.calendars || !user.calendars.length)
	    return res.status(404).json({Message: 'Calendar not found in list'});
	req.calendar = _.where(user.calendars, {_id: id})[0];
	console.log(req.calendar);
	return next();
    });
});

router.get('/', function(req, res, next) {
    User.find({}, function (err, users) {
	if (err)
	    return next(err);
	res.json({'UserCount': users.length, 'Results' : users});
    });
});

router.get('/:user/', function(req, res, next) {
    req.user
	.populate('calendars groups', function(err, user) {
	    if (err)
		next(err);
	    res.json(user);
	});
});

router.get('/:user/calendars', function(req, res, next) {
    req.user.populate('calendars', function (err, user) {
	if (err)
	    next(err);
	res.json({'CalendarCount': user.calendars.length, 'Results' : user.calendars});
    });
});

module.exports = router;
