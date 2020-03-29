var express = require('express');
var User = require('../model/user');

var router = express.Router();
router.get('/', async function (req, res) {
    User.findOne({ id: req.user.id }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/auth/cas');
        }
        res.render('account', { user: user });
    });
});

router.post('/', async function (req, res, next) {
    User.findOne({ id: req.user.id }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/auth/cas');
        }
        console.log(req.body);
        
        if ((req.body.name == null || 0 === req.body.name.length)) {
            user.name = user.id;
        } else {
            user.name = req.body.name;
        }
        user.phone = req.body.phone;

        user.save(function (err) {
            if (err){
                console.log(err);
                next(err);
            }
        });
        res.render('account', { user: user });
    });
});

module.exports = router;
