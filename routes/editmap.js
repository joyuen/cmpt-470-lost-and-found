var express = require('express');
var RegexEscape = require("regex-escape");
var multer = require('multer');
var path = require('path');
var mongo_sanitize = require("mongo-sanitize");
const { check, query, validationResult } = require('express-validator');
const config = require('../config.js');

var Postings = require('../model/postings');
var Images = require('../model/images');

var router = express.Router();

//-------------------------------
//   Helper functions
//-------------------------------
function mongoSanitizeQuery(req, res, next) {
    req.query = mongo_sanitize(req.query);
    next();
}

function mongoSanitizeBody(req, res, next) {
    req.body = mongo_sanitize(req.body);
    next();
}

const multer_image = multer({
    dest: './uploads',
    limits: {fileSize: config.MAX_IMAGE_SIZE},
    fileFilter: function(req, file, cb) {
        cb(null, file.mimetype == 'image/jpeg' || file.mimetype == 'image/png');
    }
});

function beforeNow(v) {
    return (new Date(v)) <= (new Date());
}

function isDate(v) {
    return !isNaN(new Date(v).getTime());
}

function hasEditPermissions(user, posting) {
    if (user.admin) {
        return true;
    }
    if (posting.postedBy == user.id) {
        return true;
    }
    return false;
}

// ---------------------------------
//  GET request
// ---------------------------------
router.get('/:id', async function(req, res) {
    var id = req.params.id.slice(1,);
    if (id != "ap" && id != "bout" && id != "ontact" && id != "ccount") {
        var post = await Postings.getPostingById(id);
        res.render('editmap', { post });
    }
    else {
        var domain = req.params.id
        if (domain == "map") {
            res.redirect('/map');
        }
        else if (domain == "about") {
            res.redirect('/about');
        }
        else if (domain == "contact") {
            res.redirect('/contact');
        }
        else if (domain == "account") {
            res.redirect('/account');
        }
        else{
            res.redirect('/');
        }
    };
});

const upload = multer({
    dest: './uploads',
    limits: {fileSize: 10*1024*1024},
    fileFilter: function(req, file, cb) {
        cb(null, file.mimetype == 'image/jpeg' || file.mimetype == 'image/png');
    }
});

// router.post('/:id', upload.single('image'), async function(req, res) {

    // var update_post = {
        // title: req.body.title,
        // category: req.body.item,
        // description: req.body.detail,
        // status: req.body.status,
        // campus: req.body.campus,
        // building: "",
        // room: "",
        // location: req.body.location,
        // creationDate: new Date(),
        // lostDate: req.body.date,
        // postedBy: req.user.id,
        // imageID: "",           // to be filled in
        // coordinates: {              // until the map is finished, default values
            // type: "Point",
            // coordinates: [49.277012, -122.918049],    // should be in the middle of burnaby campus
        // },
    // };

    // if (req.file) {
        // const fileExt = path.extname(req.file.originalname).toLowerCase();
        // update_post.imageID = await images.saveImageFromFile(req.file.path, fileExt);
    // } else {
        // update_post.imageID = "";
    // }

    // posting_id = req.params.id.slice(1,)
    // try {
        // var temp = await postings.updatePosting(update_post, posting_id);
    // } catch (err) {
        // return console.log(err.message);
    // }
    // return res.redirect('/postings');
// });




module.exports = router;
