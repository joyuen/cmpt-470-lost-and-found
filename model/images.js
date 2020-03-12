var fs = require('fs');
var path = require('path');
const uuidv4 = require('uuid').v4;

var IMAGE_DIRECTORY = path.join(__dirname, '../uploads/images');       // todo: move to a better location 

var imageModel = {
    saveImageFromFile : async function(filepath, ext) {
        var new_id = uuidv4();
        var new_filename = new_id + ext;
        console.log(filepath, new_filename, path.join(IMAGE_DIRECTORY, new_filename));
        fs.renameSync(filepath, path.join(IMAGE_DIRECTORY, new_filename));
        return new_filename;
    },
    
    getImageUrl : function(id) {
        return `/images/${id}`;
    }
};

module.exports = imageModel;
