var mongoose = require('mongoose');

// mark all as read (Delete All)
// mark as read (Delete)

var UserId = String;
var notifSchema = new mongoose.Schema({
    message : String,       // HTML string
    sent : Date,
    recipients : [UserId],
});

notifSchema.statics.send = function(message, users) {
    return this.insertMany({        // there is no insertOne
        message: message,
        sent: new Date(),
        recipients: users,
    });
};

notifSchema.statics.read = function(userid) {
    return this
        .find({recipients: userid}, {_id: 1, message: 1, sent: 1})
        .sort({sent: -1});
};

notifSchema.statics.remove = function(userid, notifid) {
    return this.updateOne(
        {_id: notifid},
        { $pull: {recipients: userid}}
    );
};

notifSchema.statics.removeMultiple = function(userid, notifids) {
    return this.updateMany(
        {_id: {$in: notifids}},
        { $pull: {recipients: userid}}
    );
};

notifSchema.statics.removeAll = function(userid) {
    return this.updateMany(
        {},
        { $pull: {recipients: userid}}
    );
};

notifSchema.statics.clean = function(userid) {
    return this.deleteMany(
        {recipients: {$size: 0}}
    );
};

var NotifModel = mongoose.model('Notification', notifSchema);
module.exports = NotifModel;


// recipients : [{
//     user: UserId,
//     deleted: Boolean,
// }],    
    // return this.find({
    //     recipients: {$elemMatch: {user: userid, deleted: false}}
    // });
// this is to remove any users
    // return this.update(
    //     {_id: notifid},
    //     { $pull: { recipients: {$elemMatch: {user: userid}}}},
    // })
    // notifSchema.statics.send = function(message, users) {
    //     var recipients = users.map(u => ({user: u, deleted: false}));
    //     return this.insertMany({
    //         message: message,
    //         sent: new Date(),
    //         recipients: recipients,
    //     });
    // };