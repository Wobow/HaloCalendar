var mongoose = require('mongoose');

var InviteSchema = new mongoose.Schema({
    invitationDate: {type: Date, default: Date.now},
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type: {type: String, enum: ['Group', 'Calendar']},
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: undefined},
    calendar: {type: mongoose.Schema.Types.ObjectId, ref: 'Calendar', default: undefined},
    role: String,
    message: {type: String, default: "You were invited"}
});

mongoose.model('Invite', InviteSchema);
