var express = require('express')

function isEmptyObject(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
}

module.exports = function (db) {
    var router = express.Router();
    router.get('/', async function(req, res) {
        var collection = db.collection('data');
        if (!isEmptyObject(req.query)) {
            collection.insertOne(req.query);
        }
        
        var cursor = collection.find();
        var docs = await cursor.toArray();
        res.send(docs);
    });

    return router;
};