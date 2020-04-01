var express = require('express');
var Postings = require('../../model/postings').model;
var RegexEscape = require("regex-escape");
const { check, query, validationResult } = require('express-validator');

var router = express.Router();

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

function validator_isDate(v) {
    return !isNaN(new Date(v).getTime());
}

// const formChecks = [
//     check('title').isLength({min:1, max:256}),
//     check('status').isIn(['lost', 'found', 'stolen', 'returned']),
//     check('item').isLength({min:1, max:256}),
//     check('date').custom(value => {
//         return (new Date(value)) <= (new Date());
//     }),
//     check('campus').isIn(['burnaby', 'surrey', 'vancouver']),
//     check('location').isLength({max: 256}),
//     check('detail').isLength({max: 2500}),
// ];

router.get('/', [
    query('keywords').optional().isLength({min:0, max:256}),
    query('status').optional().isLength({min:0, max:256}),
    query('category').optional().isLength({min:0, max:256}),
    query('campus').optional().isLength({min:0, max:256}),
    query('building').optional().isLength({min:0, max:256}),
    query('room').optional().isLength({min:0, max:256}),
    query('lostDateStart').optional().custom(validator_isDate),
    query('lostDateEnd').optional().custom(validator_isDate),
    query('numPostings').optional().isInt({min:0, max:50}).toInt(),      // possibly make the min/max check a sanitizer
    query('token').optional().custom(validator_isDate),     // while the token is still a date
], async function (req, res, next) {
    if (req.query.numPostings === undefined) {
        req.query.numPostings = 10;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
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
