var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id: String,
});

userSchema.methods.findOrCreate = function ({id: String}){

};
var User = mongoose.model('User', userSchema);
module.exports = User;