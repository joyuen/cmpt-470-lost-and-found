var express = require('express');
var mongo_sanitize = require("mongo-sanitize");
const { check, query, validationResult } = require('express-validator');

var Notifs = require('../../model/notifications');

var router = express.Router();

// https://stackoverflow.com/a/51391081
const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

router.get('/read', asyncHandler(async function(req, res) {
    res.json(await Notifs.read(req.user.id));
}));

router.post('/removeAll', asyncHandler(async function(req, res) {
    await Notifs.removeAll(req.user.id);
    res.status(204);
}));

router.post('/remove', asyncHandler(async function(req, res) {
    req.body = mongo_sanitize(req.body);
    await Notifs.removeMany(req.user.id, req.body.notifids);
    res.status(204);
}));

module.exports = router;