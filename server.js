// Imports
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const Handlebars = require("handlebars");
var path = require('path');
const fs = require( 'fs' );

// Constants
const port = process.env.PORT || 8000;
const DB_URL = 'mongodb://localhost:27017';
// const TEMPLATE_FOLDER = "./views";
// const PARTIAL_TEMPLATE_FOLDER = "./views/partials";

// Start connection to the MongoDB server
var getClient = new Promise((resolve, reject) => {
    const client = new MongoClient(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
    client.connect(function(err) {
        if (err) return reject(err);
        resolve(client);
    });
});

// Compile templates
// console.log("Compiling Handlebar.js templates...");
// var templates = function() {
//     // add partials
//     for (const file of fs.readdirSync(PARTIAL_TEMPLATE_FOLDER)) {
//         const filepath = path.join(PARTIAL_TEMPLATE_FOLDER, file);
//         const name = path.parse(file).name; 
//         console.log(`Partial: ${file} -> ${name}`);
//         var buffer = fs.readFileSync(filepath);
//         Handlebars.registerPartial(name, buffer.toString());
//     }
//     // compile templates
//     var obj = {};
//     for (const file of fs.readdirSync(TEMPLATE_FOLDER)) {
//         const filepath = path.join(TEMPLATE_FOLDER, file);
//         if (fs.statSync(filepath).isFile()) {
//             const name = path.parse(file).name; 
//             console.log(`Template: ${file} -> ${name}`);
//             var buffer = fs.readFileSync(filepath);
//             obj[name] = Handlebars.compile(buffer.toString());
//         } else {
//             console.log(`Template: ${file} (skipping, not a file)`);
//         }
//     }
//     return obj;
// }();

// Setup express server
var app = express();
app.use(express.json());
app.use(express.urlencoded( { extended:true} ));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var hbs = require('hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper("navActivate", function(a, b) { return a == b; });


getClient.catch((error) => {
    console.error(`Error connecting to MongoDB at ${DB_URL}: ${error}`);
    console.error('Please make sure an instance of MongoDB is running and is listening at that location');
    process.exit(-1);
}).then((client) => {
    // Public (for css, js, etc.)
    app.use(express.static(path.join(__dirname, 'public')));

    // Normal endpoints
    app.get('/about', (req, res) => res.render('about', {'page': 'about'}));
    app.get('/contact', (req, res) => res.render('contact', {'page': 'contact'}));
    app.get('/post', (req, res) => res.render('post', {'page': 'post'}));
    
    // Posting endpoints
    const DB_NAME = "test";
    const db = client.db(DB_NAME);
    app.use('/postings', require('./routes/postings')(db));
    app.use('/submit-posting', require('./routes/submit-posting')(db));

    // Default page behaviour -- root is landing page
    // Any unrecognized endpoints get redirected to landing page
    app.get('/', (req, res) => res.render('index', {'page': 'index'}));
    app.get('*', (req, res) => {
        res.redirect('/');
    });
    app.listen(port, () => console.log(`Listening on port ${port}!`));
});

// var cors = require('cors');
// app.use(cors());