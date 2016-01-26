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
    var query = Calendar.findById(id).populate('members invites groups events admin');
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

router.param('invite', function(req, res, next, id) {
    Invite.findById(id).populate('from to').exec(function (err, invite) {
	if (err)
	    return next(err);
	if (!invite)
	    return res.status(404).json({Message: 'Invite not found'});
	req.calendar.populate('invites members', function(err) {
	    if (err)
		return next(err);
	    if (_.find(req.calendar.invites, function(inv) {return inv._id.equals(id)}) != undefined)
	    {
		req.invite = invite;
		return next();
	    }
	    return res.status(404).json({Message: 'No such invite for this calendar'});
	});
    });
});

router.get('/', function(req, res, next) {
    Calendar.find({}, function(err, cals) {
	res.json({ResultCount: cals.length,
		  Results: cals});
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
    res.json(req.calendar);
});

router.delete('/:calendar', auth, function(req, res, next) {
    if (req.payload._id == req.calendar.admin._id)
	{
	    Calendar.remove({_id: req.calendar._id}, function(err, results) {
		if (err)
		    return next(err);
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

router.get('/:calendar/invites', function(req, res, next) {
    req.calendar.populate('invites', function(err) {
	if (err)
	    return next(err);
	res.json(req.calendar.invites);
    });
});

router.get('/:calendar/invites/:invite', function(req, res, next) {
    res.json(req.invite);
});

router.delete('/:calendar/invites/:invite', auth, function(req, res, next) {
    if (req.payload._id == req.invite.from._id || _find(req.calendar.member, function(mbr)
						       {
							   return (req.payload._id == mbr.user &&
								   req.calendar.hasRank('Moderator Admin'));
						       }))
    {
	Invite.remove({_id: req.invite._id}, function(err, results) {
	    if (err)
		return next(err);
	    if (results.result.n == 1)
		return res.status(204).send();
	    return res.status(500).json({Message: 'Something went wrong'});
	});
    }
    else
	return res.status(403).json({Message: 'You can\'t cancel this invitation'});
});

router.put('/:calendar/invites/:invite', auth, function(req, res, next) {
    if (!req.body.role)
	return res.status(400).json({Message: "Bad request"});
    if (req.payload._id == req.invite.from._id || _find(req.calendar.member, function(mbr)
							{
							   return (req.payload._id == mbr.user &&
								   req.calendar.hasRank('Moderator Admin'));
						       }))
    {
	Invite.update({_id: req.invite._id},
		      {role: req.body.role},
		      function(err, result) {
			  if (err)
			      return next(err);
			  req.invite.role = req.body.role;
			  if (result.n == 1)
			      return res.json(req.invite);
			  return res.status(500).json({Message: 'Database error'});
		      });
    }
});

router.get('/:calendar/members/:member', function(req, res, next) {
    res.json(req.member);
});

router.get('/:calendar/members/:member/profile', function(req, res, next) {
    res.redirect('/users/' + req.member.user);
});

router.post('/:calendar/invites', auth, function(req, res, next) {
    if (!req.body.id || !req.body.role)
	return res.status(400).json({Message: 'Bad request'});
    if (req.calendar.status == 'Closed' && !_.find(req.calendar.members, function(mbr) 
						   {
						       return (req.payload._id == mbr.user &&
							       req.calendar.hasRank('Admin Moderator'));
						   }))
	return res.status(403).json({Message: 'This calendar is closed : contact an admin or a moderator to make an invite'});
    else if (req.calendar.status == 'Private' && !_.find(req.calendar.members, function(mbr)
							 {
							     return (req.payload._id == mbr.user &&
								     req.calendar.hasRank('Admin Moderator Member'));
							 }))
	return res.status(403).json({Message: 'This calendar is private : you have to be a member to invite someone'});
    var invite = new Invite();
    invite.from = req.payload;
    User.findById(req.body.id, function(err, user) {
	if (_.find(req.calendar.members, function(member) {return member.user.equals(req.body.id);}) != undefined)
	    return res.status(409).json({Message: 'This user is already a member'});
	if (_.find(req.calendar.invites, function(inv) {return inv.to.equals(req.body.id);}) != undefined)
	    return res.status(409).json({Message: 'This user has already been invited'});
	invite.to = user;
	invite.type = 'Calendar';
	invite.calendar = req.calendar;
	invite.role = req.body.role;
	if (req.body.message)
	    invite.message = req.body.message;
	invite.save(function(err) {
	    if (err)
		return next(err);
	    Calendar.update(
		{_id: req.calendar._id},
		{$addToSet: {invites: invite}},
		function(err) {
		    if (err)
			return next(err);
		    var notif = new Notification();
		    notif.link = '/calendars/' + req.calendar._id + '/invites/' + invite._id + '/responses';
		    notif.message = 'You have been invited to the calendar ' + req.calendar.name + ' by ' + req.payload.username;
		    notif.save(function(err) {
			if (err)
			    return next(err);
			User.update({_id: req.body.id},
				    {$addToSet: {notifications: notif}},
				    function(err, result) {
					if (err)
					    return next(err);
					return res.json(invite);
				    });
		    });
		});
	});
    });
});

router.get('/:calendar/invites/:invite', function(req, res, next) {
    res.json(req.invite);
});

router.post('/:calendar/invites/:invite/responses', auth, function(req, res, err) {
    if (!req.body.response || !(req.body.response === 'Accept' || req.body.response === 'Decline'))
	return res.status(400).json({Message: 'You must specify a response (Accept or Decline)'});
    console.log(req.payload._id +' == ' + req.invite.to._id);
    if ((req.invite.to._id.equals(req.payload._id)))
	return res.status(403).json({Message: 'This invite is not adressed to you'});
    if (req.body.response === 'Accept')
    {
	var newMbr = new Member();
	newMbr.user = req.invite.to;
	newMbr.role = req.invite.role;
	newMbr.calendar = req.calendar;
	newMbr.save(function(err) {
	    if (err)
		return next(err);
	});
	User.update({_id: req.payload._id},
		    {$addToSet: {calendars: req.calendar}},
		    function(err) {
			if (err)
			    return next(err);
		    });
    }
    Invite.remove({_id: req.invite._id}).exec(function(err) {
	if (err)
	    return next(err);
	return (req.body.response === 'Accept' ? 
		res.json({Message: 'Invitation accepted'}) : 
		res.json({Message: 'Invitation declined'}));
    });
});


module.exports = router;
