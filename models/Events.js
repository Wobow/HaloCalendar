var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    name: String,
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    startDate: Date,
    endDate: Date,
    description: String,
    type: {type: String,
	   default: 'Custom',
	   enum: ['Fun', 'Custom', 'Training', 'Warzone', 'Matchmaking', 'Tournament', 'Other']},
    calendar: {type: mongoose.Schema.Types.ObjectId, ref: 'Calendar'},
    subs: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

mongoose.model('Event', EventSchema);
