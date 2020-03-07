var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
// var cors = require('cors');

// Connection URL
const url = 'mongodb://localhost:27017';
var port = process.env.PORT || 8000;
var dbName = "test";

var db;

// Creating Express App
console.log("Creating Express App");
var app = express();
app.use(express.json());
app.use(express.urlencoded( { extended:true} ));

// app.use(cors());        // TODO: change this to be more restrictive

function isNumeric(num){
    return !isNaN(num);
}

function isEmptyObject(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
}

// /double (query string) -> returns JSON, the query string but every number provided in the query string is doubled
// pointless function to test express
app.get('/double', function(req, res) {
    var ret = req.query;
    for (let key in ret) {
        if (isNumeric(ret[key])) {
            var num = parseInt(ret[key]);
            ret[key] = num*2;
        }
    }
    res.send(ret);
});

// /mongo -> returns contents of the collection test.data
// /mongo (query string) ->
//      insert (query string) into database
//      then returns database contents
app.get('/mongo', async function(req, res) {
    var collection = db.collection('data');
    if (!isEmptyObject(req.query)) {
        collection.insertOne(req.query);
    }
    
    var cursor = collection.find();
    var docs = await cursor.toArray();
    res.send(docs);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'server/index.html'));
});

console.log("Creating MongoDB connection");
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect(function(err) {
    if (err) throw err;
    db = client.db(dbName);
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
});
