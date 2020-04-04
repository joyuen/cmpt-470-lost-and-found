var express = require('express');
var RegexEscape = require("regex-escape");
var multer = require('multer');
var path = require('path');
var mongo_sanitize = require("mongo-sanitize");
const { check, query, validationResult } = require('express-validator');
const config = require('../../config.js');

var Postings = require('../../model/postings');
var Images = require('../../model/images');

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
// router.delete('/:id', async function(req, res) {
router.post('/:id', async function(req, res) {
    req.params.id = req.params.id.slice(1,);
    // req.params.id = req.params.id.toString();

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
        return res.redirect("/map")
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
    // req.params.id = req.params.id.toString();
    req.params.id= req.params.id.slice(1,);

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
    req.params.id= req.params.id.slice(1,);
    // req.params.id = req.params.id.toString();
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
router.post('/', mongoSanitizeBody, multer_image.single('image'), [
    check('title').isString().isLength({min:1, max:256}),
    check('status').isString().isIn(['lost', 'found', 'stolen', 'returned']),
    check('item').isString().isLength({min:1, max:256}),
    check('date').custom(isDate).custom(beforeNow),
    check('campus').isString().isIn(['burnaby', 'surrey', 'vancouver']),
    check('location').isString().isLength({max: 256}),
    check('detail').isString().isLength({max: 2500}),
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
 * Returns JSON {token: string, data: (array of Postings), [numTotal: ...]}
 * If no token is specified in the search params, a "numTotal" attribute is added
 *      with the total number of postings matched by the search.
 * Postings are paginated -- request only returns a few postings (default 10).
 * To continue a search, pass in the returned token as a param along with the same search parameters.
 *
 * Only certain attributes are returned in the Postings:
 *      id, status, campus, lostDate, title, campusFull, statusFull
 * for more, run queries to the individual posts /api/posting/:id
 * or change this function to return more attributes
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

router.get('/', mongoSanitizeQuery, [
    query('keywords').optional().isString().isLength({min:0, max:256}),
    query('status').optional().isString().isLength({min:0, max:256}),
    query('category').optional().isString().isLength({min:0, max:256}),
    query('campus').optional().isString().isLength({min:0, max:256}),
    query('building').optional().isString().isLength({min:0, max:256}),
    query('room').optional().isString().isLength({min:0, max:256}),
    query('lostDateStart').optional().isString().custom(isDate),
    query('lostDateEnd').optional().isString().custom(isDate),
    query('numPostings').optional().isInt({min:0, max:50}).toInt(),      // possibly make the min/max check a sanitizer
    query('token').optional().isString().custom(isDate),     // while the token is still a date
], async function (req, res, next) {
    if (req.query.numPostings === undefined) {
        req.query.numPostings = 10;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    function createQuery(query) {
        var query = Postings.find();

        if (req.query.keywords) {
            query = query.find({$text: {$search: req.query.keywords}});
            // add textscore as attribute in documents, if we want to sort or filter by it later
            // query = query.select({score: {$meta: "textScore"}});
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
            // the (?i) makes it case insensitive
            var escapedBuilding = "(?i)" + RegexEscape(req.query.building);
            query = query.where('building').regex(escapedBuilding);
        }
        if (req.query.room) {
            // the regex is for substring searching
            // the (?i) makes it case insensitive
            var escapedRoom = "(?i)" + RegexEscape(req.query.room);
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
        query = query.where('lostDate').lte(new Date());
        return query;
    }

    function projectPosting(p) {
        var x = p.toObject();
        // put in some virtuals
        x.id = p.id;
        x.campusFull = p.campusFull;
        x.statusFull = p.statusFull;
        delete x._id;
        return x;
    }

    var results = await createQuery()
        .select('_id status title campus lostDate')
        .sort({lostDate: -1})
        .limit(req.query.numPostings)
        .exec();

    results = results.map(projectPosting);

    if (results.length == 0) {
        //          |    |         |            |
        //  lostStart   token      lostEnd      now
        // pick the earliest time
        function minDate(arr) {
            return arr.filter(x => typeof x != "undefined").reduce((x,y) => ((x>y) ? y : x));
        }
        var token = minDate([
            new Date(req.query.lostDateStart),
            new Date(req.query.lostDateEnd),
            new Date(req.query.token),
            new Date()]);
    } else {
        var token = results[results.length-1].lostDate;
    }

    // return the number of total documents, on the first search
    var numTotal;
    if (!req.query.token) {
        numTotal = await createQuery().count().exec();
    }

    res.json({
        token: token,
        data: results,
        numTotal: numTotal,
    });
});

module.exports = router;
