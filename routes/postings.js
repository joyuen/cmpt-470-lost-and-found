var express = require('express');
var postings = require('../model/postings');
var moment = require('moment');

var router = express.Router();
router.get('/', async function(req, res) {
    var all_postings = await postings.getAllPostings();
    var now = new Date();
    var id = 1;
    for (let posting of all_postings) {     // TODO: paginate this
        posting.date_humanized = moment.duration(posting.date - now, 'milliseconds').humanize(true);
        posting.url = `/viewpost?id=${id}`;
        id++;
    }
    res.render('postings', {"page": 'postings', "postings": all_postings});
});

module.exports = router;