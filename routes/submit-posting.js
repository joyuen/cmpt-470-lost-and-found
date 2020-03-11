var express = require('express')

module.exports = function (db) {
    var router = express.Router();
    router.post('/', async function(req, res) {
        // TODO: validate req.body

        var collection = db.collection('data');
        collection.insertOne(req.body);
        console.log(req.body);
        return res.redirect('postings');
    });
    return router;
};