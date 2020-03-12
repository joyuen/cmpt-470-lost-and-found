var express = require('express');
var postings = require('../model/postings');
var multer = require('multer');
var fs = require('fs');

var upload = multer({
    dest: './uploads',
    storage: multer.memoryStorage(),
    limits: {fileSize: 10*1024*1024},
});

var router = express.Router();
router.post('/', upload.single('image'), async function(req, res) {
    // TODO: validate req.body
    // console.log(req.file);
    // console.log(req.body);
    // console.log(req.files);
    // var buffer = fs.readFileSync(req.file.path);
    if (req.file) {
        req.body.image = req.file.buffer;
    } else {
        req.body.image = "";
    }

    await postings.addPosting(req.body);
    return res.redirect('postings');
});

module.exports = router;