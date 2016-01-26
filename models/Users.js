var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    login: {type: String, lowercase: true, unique: true},
    displayName: String,
    gamerTag: String,
    hash: String,
    salt: String,
    registeredDate: {type: Date, default: Date.now},
    calendars: [{type: mongoose.Schema.Types.ObjectId, ref: 'Calendar'}],
    groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
    invites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Invite'}],
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}],
    isSuperUser: {type: Boolean, default: false},
    lastActivity: {type: Date, default: Date.now}
});

UserSchema.methods.setPassword = function(password)
{
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password)
{
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return (this.hash === hash);
};

UserSchema.methods.generateJWT = function()
{
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return (jwt.sign({
	_id: this._id,
	username: this.displayName,
	exp: parseInt(exp.getTime() / 1000)
    }, process.env.HALOCOMPSECRET));
};

mongoose.model('User', UserSchema);
