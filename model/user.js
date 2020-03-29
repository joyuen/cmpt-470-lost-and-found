var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id: String,
    name: String,
    phone: String,
});

userSchema.virtual('email').get(function () {
    return this.id + '@sfu.ca';
});

var User = mongoose.model('User', userSchema);

module.exports = User;
