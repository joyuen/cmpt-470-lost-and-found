var express = require('express');
var postings = require('../model/postings');
var moment = require('moment');

var router = express.Router();
router.get('/', async function(req, res) {
    res.render('postings', {"page": 'postings'});
});

module.exports = router;