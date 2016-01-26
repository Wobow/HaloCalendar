var mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now},
    link: String,
    message: String,
    read: {type: Boolean, default: false}
});

mongoose.model('Notification', NotificationSchema);
