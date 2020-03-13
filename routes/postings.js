var express = require('express');
var postings = require('../model/postings');

var router = express.Router();
router.get('/', async function(req, res) {
    var all_postings = await postings.getAllPostings();
    res.render('postings', {"page": 'postings', "postings": all_postings});
});

module.exports = router;