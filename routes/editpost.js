var express = require('express');
var postings = require('../model/postings');
var images = require('../model/images');
var multer = require('multer');
var path = require('path');
const { check, validationResult } = require('express-validator');

var router = express.Router();

// ---------------------------------
//  GET request
// ---------------------------------
router.get('/:id', async function(req, res) {
    var id = req.params.id.slice(1,)
    if (id != "akepost" && id != "ostings" && id != "ap" && id != "bout" && id != "ontact" && id != "ccount") {
        var posting = await postings.getPostingById(id);
        res.render('editpost', { posting });
    }
    else {
        var domain = req.params.id
        if (domain == "makepost"){
            res.redirect('/makepost');
        }
        else if (domain == "postings") {
            res.redirect('/postings');
        }
        else if (domain == "map") {
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

router.post('/:id', upload.single('image'), async function(req, res) {

    var update_post = {
        title: req.body.title,
        category: req.body.item,
        description: req.body.detail,
        status: req.body.status,
        campus: req.body.campus,
        building: "",
        room: "",
        location: req.body.location,
        creationDate: new Date(),
        lostDate: req.body.date,
        postedBy: req.user.id,
        imageID: "",           // to be filled in
        coordinates: {              // until the map is finished, default values
            type: "Point",
            coordinates: [49.277012, -122.918049],    // should be in the middle of burnaby campus
        },
    };

    if (req.file) {
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        update_post.imageID = await images.saveImageFromFile(req.file.path, fileExt);
    } else {
        update_post.imageID = "";
    }

    posting_id = req.params.id.slice(1,)
    try {
        var temp = await postings.updatePosting(update_post, posting_id);
    } catch (err) {
        return console.log(err.message);
    }
    return res.redirect('/postings');
});


module.exports = router;
