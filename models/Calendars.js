var mongoose = require('mongoose');
var _= require('underscore');

var CalendarSchema = new mongoose.Schema({
    name: String,
    creationDate: {type: Date, default: Date.now},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'Member'}],
    invites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Invite'}],
    events: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
    status: {type: String, 
	     default: 'Public',
	     enum: ['Public', 'Private', 'Closed']},
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
    description: String
});

CalendarSchema.methods.hasRank = function(ranksRaw)
{
    var ranks = ranksRaw.split(' ');
    for (var i = 0; i < ranks.length; i++)
    {
	if (_.find(this.members, function(mbr) {
	    return mbr.role === ranks[i];
	}))
	    return (true);
    }
    return (false);
};

mongoose.model('Calendar', CalendarSchema);
