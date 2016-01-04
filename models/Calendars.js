var mongoose = require('mongoose');

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

mongoose.model('Calendar', CalendarSchema);
