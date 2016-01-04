var mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now},
    message: String,
    read: Boolean
});

mongoose.model('Notification', NotificationSchema);
