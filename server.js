var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
// var cors = require('cors');

// Connection URL
var port = process.env.PORT || 8000;

// Connect to the MongoDB server
const url = 'mongodb://localhost:27017';
var dbName = "test";

var fetchDB = new Promise((resolve) => {
    const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
    client.connect(function(err) {
        if (err) return reject(err);
        db = client.db(dbName);
        resolve(db);
    });
});

console.log("Creating Express App");
var app = express();
app.use(express.json());
app.use(express.urlencoded( { extended:true} ));
// app.use(cors());        // TODO: change this to be more restrictive

// Make normal endpoints
var double = require('./server/double');
app.use('/double', double);

// Make DB endpoints
// is this how you do it??
fetchDB.then((db) => {
    app.use('/mongo', require('./server/mongo')(db));   // handle data connection failure?
}).then(() => {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'server/index.html'));
    });
    
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});