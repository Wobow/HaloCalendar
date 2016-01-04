var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use(function(req, res, next) {
    console.log(req.body);
    next();
});

router.post('/login', function(req, res, next) {
    if (!req.body.username || !req.body.password)
	return res.status(400).json({message: 'Please fill out all fields'});
    passport.authenticate('local', function(err, user, info) {
	if (err)
	    return next(err);
	if (user)
	    return res.json({token: user.generateJWT()});
	else
	    return res.status(401).json(info);
    })(req, res, next);
});

router.post('/register', function(req, res, next) {
    if (!req.body.name || !req.body.password)
	return res.status(400).json({message: 'Missing mandatory fields'});
    var user = new User();
    user.displayName = req.body.name;
    user.login = req.body.name.toLowerCase();
    user.setPassword(req.body.password);
    user.gamerTag = req.body.gamertag;
    user.save(function(err) {
	if (err)
	    return res.status(409).json({message: 'Login already used'});
	return res.json({access_token: user.generateJWT()});
    });
});

module.exports = router;
