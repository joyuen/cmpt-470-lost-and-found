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

/* Toggles admin privilege for current user.
 For demonstration purposes.
*/
router.put('/sudo', async function (req, res, next) {
    user = req.user;
    if (user.admin === true) {
        user.admin = false;
    } else {
        user.admin = true;
    }

    user.save(function (err) {
        if (err) {
            console.log(err);
            next(err);
        }
        res.render('account', { user: user });
    });

});

router.put('/user', function (req, res, next) {
    user = req.user;
    if (user.admin != true) {
        console.log(req);
        return res.status(401).send();
    }
    // user.admin = true;
    // user.save(function (err) {
    //     if (err) {
    //         console.log(err);
    //         next(err);
    //     }
    //     res.render('account', { user: user });
    // });
});

module.exports = router;
