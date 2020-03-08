var express = require('express')

module.exports = function (db, templates) {
    var router = express.Router();
    router.get('/', async function(req, res) {
        var collection = db.collection('data');

        var cursor = collection.find();
        var all_postings = await cursor.toArray();
        console.log(all_postings);

        res.send(templates['allpostings']({"postings": all_postings}));
    });

    return router;
};