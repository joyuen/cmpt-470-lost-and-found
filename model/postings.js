var mongoose = require('mongoose');

// Constants
const DB_URL = 'mongodb://127.0.0.1:27017';
const posting_schema = new mongoose.Schema({
    title: String,
    status: String,
    item: String,
    date: Date,
    campus: String,
    location: String,
    detail: String,
    image: Buffer,
    posted_by: String,
    creation_date: Date,
});

// database connection
mongoose.connect(DB_URL, {useNewUrlParser: true});

var Postings = mongoose.model('posting', posting_schema);

var PostingModel = {
    addPosting : function(posting) {
        return Postings.create(posting);
    },

    getAllPostings : function() {
        var query = Postings.find();
        return query.exec();
    },

    getPostingById : function(id) {
        var query = Postings.find()
            .skip(id)
            .limit(1);
        return query.exec();
    },
};

module.exports = PostingModel;