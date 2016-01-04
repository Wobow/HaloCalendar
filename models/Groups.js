var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
    name: String,
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'Member'}],
    invited: [{type: mongoose.Schema.Types.ObjectId, ref: 'Invite'}],
    creationDate: {type: Date, default: Date.now},
    tags: String,
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    description: String,
    status: {type: String,
	    default: 'Public',
	     enum: ['Private', 'Public', 'Closed']},
    calendars: [{type: mongoose.Schema.Types.ObjectId, ref: 'Calendar'}]
});

mongoose.model('Group', GroupSchema);
