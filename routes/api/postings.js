var express = require('express');
var RegexEscape = require("regex-escape");
var multer = require('multer');
var path = require('path');
const { check, query, validationResult } = require('express-validator');

var Postings = require('../../model/postings');
var Images = require('../../model/images');

var router = express.Router();

//-------------------------------
//   Helper functions
//-------------------------------
const multer_image = multer({
    dest: './uploads',
    limits: {fileSize: 10*1024*1024},
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

async function processImage(file) {
    if (file) {
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        return await Images.saveImageFromFile(req.file.path, fileExt);
    } else {
        return "";
    }
}

/**
 * DELETE api/postings/:id - delete a posting
 * Can only delete if user created the posting or if user is an admin
 */
router.delete('/:id', async function(req, res) {
    try {
        var post = await Postings.getPostingById(req.params.id);
    } catch (e) {
        return res.status(404).send(`Post with id ${req.params.id} not found`);
    }

    if (!hasEditPermissions(req.user, post)) {
        return res.status(403);
    }

    var result = await Postings.deleteById(req.params.id);
    if (result.ok == 1) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
});

/**
 * PUT api/postings/:id - replace attributes in a posting
 * Will only modify posting values that are specified in the request body
 * Can only update if user created the posting or if user is an admin
 * 
 * Parameters: 
 *      most attributes in the Postings model, except:
 *          _id
 *      can also upload an image, which will change the image ID
 */
router.put('/:id', multer_image.single('image'), async function(req, res) {
    try {
        var post = await Postings.getPostingById(req.params.id);
    } catch (e) {
        // don't allow PUTting postings to a specific ID
        return res.status(404).send(`Post with id ${req.params.id} not found`);
    }

    if (!hasEditPermissions(req.user, post)) {
        return res.status(403);
    }

    if (req.file) {
        req.body.imageID = await processImage(req.file);
    }

    var result;
    try {
        result = await Postings.findOneAndUpdate({_id: req.params.id}, req.body, {runValidators: true}).exec();
    } catch (err) {
        return res.status(400).json(err.message);
    }
    return res.status(200);
});

/**
 * GET api/postings/:id - get a certain posting
 */
router.get('/:id', async function(req, res) {
    var postid = req.params.id;
    try {
        var posting = await Postings.getPostingById(postid);
    } catch (e) {
        return res.status(404).send(`Post with id ${req.params.id} not found`);
    }
    res.json(posting);
});

/**
 * POST api/postings - upload posting to the server
 * returns the :id of the uploaded posting
 * 
 * Parameters:
 *      title -
 *      status -
 *      item - 
 *      date - 
 *      time - 
 *      campus -
 *      location - 
 *      detail - 
 *      a single file [an image] can also be uploaded (max 10 MB)
 */
router.post('/', multer_image.single('image'), [
    check('title').isLength({min:1, max:256}),
    check('status').isIn(['lost', 'found', 'stolen', 'returned']),
    check('item').isLength({min:1, max:256}),
    check('date').custom(beforeNow),
    check('campus').isIn(['burnaby', 'surrey', 'vancouver']),
    check('location').isLength({max: 256}),
    check('detail').isLength({max: 2500}),
], async function(req, res) {
    // turn separate date and time values into a combined datetime
    req.body.date = new Date(`${req.body.date} ${req.body.time}`);
    delete req.body.time;

    // validate the form inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    if (req.user == undefined) {
        return res.status(400).send("login info is undefined -- are you logged in?");
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
        imageID: "",                // to be filled in
        coordinates: {              // until the map is finished, default values
            type: "Point",
            coordinates: [49.277012, -122.918049],    // should be in the middle of burnaby campus
        },
    };
    new_post.imageID = await processImage(req.file);

    var id = await Postings.addPosting(new_post);
    return res.json(id);
});

/**
 * GET /?(params) - get postings, under search conditions
 * Returns JSON -- {token: string, data: [list of Postings]}
 * Postings are paginated -- request only returns a few postings (default 10).
 * To continue a search, pass in the returned token as a param along with the same search parameters.
 * 
 * Parameters:
 *      [if any are not specified, then assume 'all']
        keywords        - text search through the posting
        status          - exact match
        category        - exact match
        campus          - exact match
        building        - substring search
        room            - substring search
        lostDateStart   - date range, must be parseable by Date()
        lostDateEnd     - date range, must be parseable by Date()
        numPostings: num postings to return. Defaults to 20
        [token]
 */

router.get('/', [
    query('keywords').optional().isLength({min:0, max:256}),
    query('status').optional().isLength({min:0, max:256}),
    query('category').optional().isLength({min:0, max:256}),
    query('campus').optional().isLength({min:0, max:256}),
    query('building').optional().isLength({min:0, max:256}),
    query('room').optional().isLength({min:0, max:256}),
    query('lostDateStart').optional().custom(isDate),
    query('lostDateEnd').optional().custom(isDate),
    query('numPostings').optional().isInt({min:0, max:50}).toInt(),      // possibly make the min/max check a sanitizer
    query('token').optional().custom(isDate),     // while the token is still a date
], async function (req, res, next) {
    if (req.query.numPostings === undefined) {
        req.query.numPostings = 10;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // maybe there's a pagination library that can do this smarter, but I can't find one
    // Rollin my own
    var query = Postings.find();

    if (req.query.keywords) {
        // todo, need a text index
    }

    if (req.query.status) {
        query = query.where('status').equals(req.query.status);
    }
    if (req.query.category) {
        query = query.where('category').equals(req.query.category);
    }
    if (req.query.campus) {
        query = query.where('campus').equals(req.query.campus);
    }
    if (req.query.building) {
        // the regex is for substring searching
        var escapedBuilding = RegexEscape(req.query.building);
        query = query.where('building').regex(escapedBuilding);
    }
    if (req.query.room) {
        // the regex is for substring searching
        var escapedRoom = RegexEscape(req.query.room);
        query = query.where('room').regex(escapedRoom);
    }
    
    if (req.query.lostDateStart) {
        var lostDateStart = new Date(req.query.lostDateStart);
        query = query.where('lostDate').gte(lostDateStart);
    }
    if (req.query.lostDateEnd) {
        var lostDateEnd = new Date(req.query.lostDateEnd);
        query = query.where('lostDate').lte(lostDateEnd);
    }
    if (req.query.token) {
        var tokenDate = new Date(req.query.token);
        query = query.where('lostDate').lt(tokenDate);      // should be fine to have overlapping conditions right?
    }
    
    var results = await query
        .sort({lostDate: -1})
        .limit(req.query.numPostings)
        .exec();
    
    if (results.length == 0) {
        //          |    |         |            |
        //  lostStart   token      lostEnd      now
        // pick the earliest time
        function minDate(arr) {
            return arr.filter(x => typeof x != "undefined").reduce((x,y) => ((x>y) ? y : x));
        }
        var token = minDate([lostDateStart, lostDateEnd, tokenDate, new Date()]);
    } else {
        var token = results[results.length-1].lostDate;
    }
    res.json({
        token: token,
        data: results
    });
});

module.exports = router;
