var mongoose = require('mongoose');

var MemberSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    role: {type: String, enum: ['Follower', 'Viewer', 'Member', 'Moderator', 'Admin']},
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: undefined},
    calendar: {type: mongoose.Schema.Types.ObjectId, ref: 'Calendar', default: undefined},
    joinDate: {type: Date, default: Date.now}
});

mongoose.model('Member', MemberSchema);
