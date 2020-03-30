var mongoose = require('mongoose');

//---------------------------------------
//  Posting Model
//---------------------------------------
// custom mongoose types
function string_not_empty(length) {       // String that must contain content in it
    return {
        type: String,
        required: true,
        minlength: 1,
        maxlength: length,
    };
}

function string_optional(length) {       // String that can be left blank
    return {
        type: String,
        maxlength: length,
        default: '',
    };
}

const point_schema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  });  

const posting_schema = new mongoose.Schema({
    title: string_not_empty(256),
    category: string_not_empty(256),
    description: string_optional(2000),
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
    building: string_optional(256),       // todo: add verification on this
    room: string_optional(256),
    location: string_optional(256),
    coordinates: {
        type: point_schema,
        required: true,  
    },

    creationDate: {type: Date, required: true}, 
    lostDate: {type: Date, required: true}, 
    returnDate: {type: Date}, // this will be set later when the item is returned

    imageID: string_optional(256),
    postedBy: string_not_empty(256),
});

// Custom validators
posting_schema.path('lostDate').validate(function (v) {
    return (this.lostDate <= this.creationDate);
});

posting_schema.path('returnDate').validate(function (v) {
    return (this.lostDate <= this.returnDate);
});

posting_schema.path('returnDate').validate(function (v) {
    return (this.status == "returned");
});

// Helper functions
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
     *  @param {object} posting - attributes to construct the posting document with (see schema)
     *  @returns id of the posting just created
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