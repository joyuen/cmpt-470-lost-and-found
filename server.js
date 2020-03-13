// Imports
require = require("esm")(module /*, options*/);
const config = require('./config.js');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('hbs');
const session = require("express-session");
const passport = require('passport');
const errorHandler = require('errorhandler');

// Constants
const isProduction = config.isProduction;
const port = config.port;
const DB_URL = config.DB_URL;

const app = express();

if (!isProduction) {
    app.use(errorHandler());
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
    });
    mongoose.set('debug', true);
} else {
    // Put production options here if we have any
}

// Setup Mongoose
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () { require('./model')(db); });

// Setup express server
app.use(session({ secret: "cmpt470bobbychanxd", saveUninitialized: false, resave: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Configure Handlebars
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper("navActivate", function (a, b) { return a == b; });

// Auth
require('./routes/auth.js')(app);
// ALL ROUTES MUST GO AFTER AUTH!

// Public stuff
app.use(express.static(path.join(__dirname, 'public')));

// Normal endpoints
app.get('/about', (req, res) => res.render('about', { 'page': 'about' }));
app.get('/contact', (req, res) => res.render('contact', { 'page': 'contact' }));
app.get('/post', (req, res) => res.render('post', { 'page': 'post' }));
app.get('/map', (req, res) => res.render('map', { 'page': 'map' }));

// Posting endpoints
app.use('/postings', require('./routes/postings'));
app.use('/submit-posting', require('./routes/submit-posting'));

// Default page behaviour -- root is landing page
// Any unrecognized endpoints get redirected to landing page
app.get('/', (req, res) => res.render('index', { 'page': 'index' }));
app.get('*', (req, res) => {
    res.redirect('/');
});
app.listen(port, () => console.log(`Listening on port ${port}!`));

// var cors = require('cors');
// app.use(cors());
