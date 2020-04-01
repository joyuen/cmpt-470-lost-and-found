var mongoose = require('mongoose');

// Create an object type UserException
function DatabaseException(message) {
    this.message = message;
    this.name = 'DatabaseException';
}

// Make the exception convert to a pretty string when used as a string 
// (e.g., by the error console)
DatabaseException.prototype.toString = function() {
    return `${this.name}: "${this.message}"`;
}

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

// maybe in the future we want posting ids to be different from database ids
// these two functions convert between the two
posting_schema.statics.to_dbid = function(pid) {
    return pid;
}
posting_schema.statics.from_dbid = function(dbid) {
    return dbid;
}
posting_schema.virtual('id').get(function() {
    return this.from_dbid(this._id);
})

// Helper queries
posting_schema.statics.deleteById = function(posting_id) {
    return this.deleteOne({_id: this.to_dbid(posting_id)});
};

/**
 *  Add a posting to the database
 *  @param {object} posting - attributes to construct the posting document with (see schema)
 *  @returns id of the posting just created
 *  @throws validation error if posting is invalid
 */ 
posting_schema.statics.addPosting = async function(posting) {
    return this.create(posting).then(doc => {
        return doc.id;
    });
};

/**
 *  @returns cursor to iterate through all postings
 */
posting_schema.statics.getAllPostings = async function() {
    var query = Postings.find();
    return query.exec();
};

/**
 * @param {string} id - the posting id
 * @returns posting corresponding to the id
 */
posting_schema.statics.getPostingById = async function(posting_id) {
    var query = Postings.find({_id: this.to_dbid(posting_id)}).limit(1);
    return query.exec().then(docs => {
        if (docs.length == 0) {
            throw DatabaseException(`no posting with id ${posting_id} found`);
        }
        return docs[0];
    });
};

var Postings = mongoose.model('posting', posting_schema);
module.exports = Postings;