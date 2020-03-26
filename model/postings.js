var mongoose = require('mongoose');

//---------------------------------------
//  Posting Model
//---------------------------------------
// custom mongoose types
function StringNotEmpty(length) {       // String that must contain content in it
    return {
        type: String,
        required: true,
        minlength: 1,
        maxlength: length,
    };
}

function StringOptional(length) {       // String that can be left blank
    return {
        type: String,
        maxlength: length,
        default: '',
    };
}

const posting_schema = new mongoose.Schema({
    title: StringNotEmpty(256),
    category: StringNotEmpty(256),
    description: StringOptional(2000),
    status: {
        type: String,
        required: true, 
        enum: ["lost", "found", "stolen", "returned"],
    },
    
    campus: {
        type: String,
        required: true, 
        enum: ["surrey", "burnaby", "vancouver"],
    },
    building: StringOptional(256),       // todo: add verification on this
    room: StringOptional(256),
    location: StringOptional(256),

    creation_date: {type: Date, required: true}, 
    lost_date: {type: Date, required: true}, 
    return_date: {type: Date}, // this will be set later when the item is returned

    image_id: StringOptional(256),
    posted_by: StringNotEmpty(256),
});

// Custom validators
posting_schema.path('lost_date').validate(function (v) {
    return (this.lost_date <= this.creation_date);
});

posting_schema.path('return_date').validate(function (v) {
    return (this.lost_date <= this.return_date);
});

posting_schema.path('return_date').validate(function (v) {
    return (this.status == "returned");
});

// Helper functions
posting_schema.virtual('campusFull').get(function() {
    switch (this.campus) {
        case "surrey": return "Surrey Campus";
        case "burnaby": return "Burnaby Mountain Campus";
        case "vancouver": return "Vancouver Campus";
    }
});

posting_schema.virtual('statusFull').get(function() {
    // just capitalize the first letter, nothing special yet
    return this.status[0].toUpperCase() + this.campus.slice(1);
});

posting_schema.virtual('id').get(function() {
    return this._id;        // maybe do something fancy with it later
})

var Postings = mongoose.model('posting', posting_schema);
//---------------------------------------
//  Controller
//---------------------------------------
var PostingController = {
    /**
     *  Add a posting to the database
     *  @param {object} posting - attributes to construct the posting document with
     *  @returns {Promise<String>} id of the posting just created
     *  @throws validation error if posting is invalid
     */ 
    addPosting : async function(posting) {
        return Postings.create(posting).then(doc => {
            return doc.id;
        });
    },

    /**
     *  @returns cursor to iterate through all postings
     */
    getAllPostings : async function() {
        var query = Postings.find();
        return query.exec();
    },

    /**
     * @param {string} id - the posting id
     * @returns posting corresponding to the id
     */
    getPostingById : async function(posting_id) {
        // turn posting id -> _id attribute in database
        // but they're the same right now, so nothing fancy
        var database_id = posting_id;
        var query = Postings.find({_id: database_id}).limit(1);
        return query.exec().then(docs => {
            return docs[0];
        });
    },
};

module.exports = PostingController;