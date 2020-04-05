var express = require('express');
var Postings = require('../model/postings');
var Images = require('../model/images');
var User = require('../model/user');

function hasEditPermissions(user, posting) {
    if (user.admin) {
        return true;
    }
    if (posting.postedBy == user.id) {
        return true;
    }
    return false;
}

var router = express.Router();
router.get('/', async function(req, res) {
    var posting_id = req.query.id;
    var posting = await Postings.getPostingById(posting_id);
    var username = posting.postedBy;
    var user = await User.findOne({ id: username }).exec();

    posting.image_url = (posting.imageID) ? Images.getImageUrl(posting.imageID) : "";

    res.render('viewpost', {
        "post": posting,
        "user": user,
        "caneditpermissions": hasEditPermissions(user, posting)
    });
});

module.exports = router;