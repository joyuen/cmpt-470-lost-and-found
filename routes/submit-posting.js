var express = require('express');
var postings = require('../model/postings');
var images = require('../model/images');
var multer = require('multer');
var path = require('path');

var upload = multer({
    dest: './uploads',
    limits: {fileSize: 10*1024*1024},
    fileFilter: function(req, file, cb) {
        cb(null, file.mimetype == 'image/jpeg' || file.mimetype == 'image/png');
    }
});

var router = express.Router();
router.post('/', upload.single('image'), async function(req, res) {
    var error = function(res) {
        return res.redirect('/');
    };

    if (req.file) {
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        req.body.image_id = await images.saveImageFromFile(req.file.path, fileExt);
    } else {
        req.body.image_id = "";
    }
    
    // TODO: validate req.body
    // console.log(req.file);
    // console.log(req.body);
    // console.log(req.files);
    // var buffer = fs.readFileSync(req.file.path);
    // if (req.file) {
    //     req.body.image_id = images.saveImageFromFile(req.file.path);
    //     req.file.encoding
    // } else {
    //     req.body.image_id = "";
    // }

    req.body.posted_by = req.user.id;
    req.body.creation_date = new Date();

    await postings.addPosting(req.body);
    return res.redirect('postings');
});

module.exports = router;