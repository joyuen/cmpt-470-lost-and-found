var express = require('express');
var postings = require('../model/postings');
var images = require('../model/images');
var multer = require('multer');
var path = require('path');
const { check, validationResult } = require('express-validator');

const upload = multer({
    dest: './uploads',
    limits: {fileSize: 10*1024*1024},
    fileFilter: function(req, file, cb) {
        cb(null, file.mimetype == 'image/jpeg' || file.mimetype == 'image/png');
    }
});

const formChecks = [
    check('title').isLength({min:1, max:256}),
    check('status').isIn(['lost', 'found', 'stolen']),
    check('item').isLength({min:1, max:256}),     // also add verification for specific values when form is finalized
    check('date').custom(value => {
        return (new Date(value)) <= (new Date());
    }),
    check('campus').isIn(['burnaby', 'surrey', 'vancouver']),
    check('location').isLength({max: 256}),
    check('detail').isLength({max: 2500}),
];

var router = express.Router();
router.post('/', upload.single('image'), formChecks, async function(req, res) {
    const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
        return `${location}[${param}]: ${msg}`;
    };
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    if (req.file) {
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        req.body.image_id = await images.saveImageFromFile(req.file.path, fileExt);
    } else {
        req.body.image_id = "";
    }

    if (req.user == undefined) {
        return res.send("login info found to be undefined -- are you logged in?");
    }
    req.body.posted_by = req.user.id;
    req.body.creation_date = new Date();

    await postings.addPosting(req.body);
    return res.redirect('postings');
});

module.exports = router;