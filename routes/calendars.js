var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Calendar = mongoose.model('Calendar');
var Group = mongoose.model('Group');
var Notification = mongoose.model('Notification');
var Event = mongoose.model('Event');
var Invite = mongoose.model('Invite');
var Member = mongoose.model('Member');

var jwt = require('express-jwt');
var auth = jwt({secret: process.env.HALOCOMPSECRET, userProperty: 'payload'});
var _ = require('underscore');

router.param('calendar', function(req, res, next, id) {
    var query = Calendar.findById(id);
    query.exec(function(err, cal) {
	if (err)
	    return next(err);
	if (!cal)
	    return res.status(404).json({Message: 'Calendar not found'});
	req.calendar = cal;
	return next();
    });
});

router.param('member', function(req, res, next, id) {
    Member.findById(id).exec(function (err, member) {
	if (err)
	    return next(err);
	if (!member)
	    return res.status(404).json({Message: 'Member not found'});
	if (member.calendar.equals(req.calendar._id))
	{
	    req.member = member;
	    return next();
	}
	return res.status(404).json({Message: 'No such member in calendar'});
    });
});

router.get('/', function(req, res, next) {
    Calendar.find({}, function(err, cals) {
	res.json(cals);
    });
});

router.post('/', auth, function(req, res, next) {
    if (!(req.body.name && req.body.description))
	return res.status(400).json({Message: 'Bad request'});
    var cal = new Calendar();
    cal.name = req.body.name;
    cal.description = req.body.description;
    if (req.body.status && req.body.status != '' && 
	(req.body.status == "Public" ||
	 req.body.status == "Private" ||
	 req.body.status == "Closed"))
	cal.status = req.body.status;
    cal.admin = req.payload;
    var me = new Member();
    me.user = req.payload;
    me.calendar = cal;
    me.role = 'Admin';
    me.save(function(err) {
	if (err)
	    return next(err);
	cal.members.push(me);
	cal.save(function(err) {
	    if (err)
		return next(err);
	    return res.json(cal);
	});
    });
});

router.get('/:calendar', function(req, res, next) {
    req.calendar.populate('groups members invites events', function(err, cal) {
	if (err)
	    return next(err);
	res.json(cal);
    });
});

router.delete('/:calendar', auth, function(req, res, next) {
    console.log(req.payload._id + '|' + req.calendar.admin);
    if (req.payload._id == req.calendar.admin)
	{
	    Calendar.remove({_id: req.calendar._id}, function(err, results) {
		if (results.result.n == 1)
		    return res.status(204).send();
		return res.status(500).json({'Message': 'Calendar could not be deleted'});
	    });
	}
    else
	return res.status(403).json({Message: 'You are not admin of the calendar'});
});

router.get('/:calendar/members', function(req, res, next) {
    res.json(req.calendar.members);
});

router.get('/:calendar/members/:member', function(req, res, next) {
    res.json(req.member);
});

router.get('/:calendar/members/:member/profile', function(req, res, next) {
    res.redirect('/users/' + req.member.user);
});

router.post('/:calendar/members/invites', auth, function(req, res, next) {
    if (!req.body.id || !req.body.role)
	return res.status(400).json({Message: 'Bad request'});
    var invite = new Invite();
    
});

module.exports = router;
