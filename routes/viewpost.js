var express = require('express');
var postings = require('../model/postings');
var images = require('../model/images');

var router = express.Router();
router.get('/', async function(req, res) {
    var posting_id = req.query.id;
    var posting = await postings.getPostingById(posting_id);

    posting.image_url = (posting.image_id) ? images.getImageUrl(posting.image_id) : "";

    res.render('viewpost', posting);
});

module.exports = router;