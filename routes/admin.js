var express = require('express');
var User = require('../model/user');

var router = express.Router();
router.get('/', async function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            return next(err);
        }
        return res.render('admin', { users: users });
    });
    
});

router.post('/makeadmin', async function (req, res, next) {
    user = req.user;
    user.admin = true;
    user.save(function (err) {
        if (err) {
            console.log(err);
            next(err);
        }
        res.render('account', { user: user });
    });
    
});

module.exports = router;
