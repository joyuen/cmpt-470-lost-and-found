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
router.get('/', async function(req, res) {
    res.render('makepost', {'page': 'makepost'});
});

// ---------------------------------
//  POST request
// ---------------------------------
/**
 *  Supported POST values
 *      title -
 *      status -
 *      item -
 *      date -
 *      time -
 *      campus -
 *      location -
 *      detail -
 *      a single file [an image] can also be uploaded
 */

const upload = multer({
    dest: './uploads',
    limits: {fileSize: 10*1024*1024},
    fileFilter: function(req, file, cb) {
        cb(null, file.mimetype == 'image/jpeg' || file.mimetype == 'image/png');
    }
});

// maybe remove these now that it's being tested in the postings model?
const formChecks = [
    check('title').isLength({min:1, max:256}),
    check('status').isIn(['lost', 'found', 'stolen', 'returned']),
    check('item').isLength({min:1, max:256}),
    check('date').custom(value => {
        return (new Date(value)) <= (new Date());
    }),
    check('campus').isIn(['burnaby', 'surrey', 'vancouver']),
    check('location').isLength({max: 256}),
    check('detail').isLength({max: 2500}),
];

const validation_error = function(res, message) {
    res.status(422).send(`
        Error sending posting to server! Reason:
        <pre>${message}</pre>
    `);
}

router.post('/', upload.single('image'), formChecks, async function(req, res) {
    // turn separate date and time values into a combined datetime
    req.body.date = new Date(`${req.body.date} ${req.body.time}`);
    delete req.body.time;

    // validate the form inputs
    const errors = validationResult(req).formatWith(
        ({ location, msg, param, value, nestedErrors }) => {
            return `${location}[${param}]: ${msg}`;
        }
    );
    if (!errors.isEmpty()) {
        return validation_error(res, errors.array()); // res.status(422).json({ errors: errors.array() })
    }

    if (req.user == undefined) {
        return validation_error(res, "login info found to be undefined -- are you logged in?");
    }
    var new_post = {
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
            coordinates: [req.body.lng, req.body.lat],
        },
    };

    if (req.file) {
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        new_post.imageID = await images.saveImageFromFile(req.file.path, fileExt);
    } else {
        new_post.imageID = "";
    }

    try {
        var id = await postings.addPosting(new_post);
    } catch (err) {
        return validation_error(res, err.message);
    }
    return res.redirect(`viewpost?id=${id}`);
});

module.exports = router;
