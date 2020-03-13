var mongoose = require('mongoose');

// Constants
const posting_schema = new mongoose.Schema({
    status: String,
    item: String,
    date: String,
    time: String,
    location: String,
    detail: String
});

var Postings = mongoose.model('posting', posting_schema);

var PostingModel = {
    addPosting : function(posting) {
        return Postings.create(posting);
    },

    getAllPostings : function() {
        var query = Postings.find();
        return query.exec();
    },
};

module.exports = PostingModel;
