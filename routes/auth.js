var passport = require('passport');
var CasStrategy = require('passport-cas2').Strategy;
var User = require('../model/user.js');
passport.use(new CasStrategy({
    casURL: 'https://cas.sfu.ca/cas'
},
    // This is the `verify` callback
    function (username, profile, done) {
        console.log(username);
        console.log(profile);
        User.findOne({ id: username }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                user = new User({
                    id: username,
                });
                user.save(function (err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                //found user. Return
                return done(err, user);
            }
            done(err, user);
        });
    }));


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne({ id: id }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            user = new User({
                id: id,
            });
            user.save(function (err) {
                if (err) console.log(err);
                return done(err, user);
            });
        } else {
            //found user. Return
            return done(err, user);
        }
        done(err, user);
    });
});

module.exports = function (app) {
    app.get('/auth/cas',
        passport.authenticate('cas', { failureRedirect: '/auth/cas' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    app.get('/logout', function (req, res) {
        var returnURL = 'http://example.com/';
        cas.logout(req, res, returnURL);
    });
};
