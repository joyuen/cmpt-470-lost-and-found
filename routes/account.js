var express = require('express');
var User = require('../model/user');

var router = express.Router();
router.get('/', async function (req, res) {
    return res.render('account', { user: req.user });
});

router.post('/', async function (req, res, next) {
    user = req.user;

    if ((req.body.name == null || 0 === req.body.name.length)) {
        user.name = user.id;
    } else {
        user.name = req.body.name;
    }

    user.phone = req.body.phone;
    
    user.save(function (err) {
        if (err) {
            console.log(err);
            next(err);
        }
        res.render('account', { user: user });
    });
});

module.exports = router;
