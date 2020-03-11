var express = require('express');
var postings = require('../model/postings');

var router = express.Router();
router.post('/', async function(req, res) {
    // TODO: validate req.body
    await postings.addPosting(req.body);
    return res.redirect('postings');
});

module.exports = router;