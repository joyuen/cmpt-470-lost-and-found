const express = require('express');

var router = express.Router();
router.use('/postings', require('./postings'));
router.use('/region', require('./region'));

module.exports = router;