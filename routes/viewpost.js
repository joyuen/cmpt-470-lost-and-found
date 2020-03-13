var express = require('express');
var postings = require('../model/postings');
var images = require('../model/images');
var moment = require('moment');

var router = express.Router();
router.get('/', async function(req, res) {
    var posting_id = parseInt(req.query.id)-1;
    var posting = (await postings.getPostingById(posting_id))[0];
    console.log(posting);

    posting.image_url = (posting.image_id) ? images.getImageUrl(posting.image_id) : "";

    res.render('viewpost', posting);
});

module.exports = router;