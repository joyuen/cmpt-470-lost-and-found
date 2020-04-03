const express = require('express');

var router = express.Router();
router.use('/postings', require('./postings'));

module.exports = router;