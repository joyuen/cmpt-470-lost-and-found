// Imports
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var hbs = require('hbs');

// Constants
const port = process.env.PORT || 8000;
const DB_URL = 'mongodb://localhost:27017';

// Setup Mongoose
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){require('./model')(mongoose);});

// Setup express server
var app = express();
var session = require("express-session");
var passport = require('passport');

app.use(session({ secret: "cmpt470bobbychanxd" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded( { extended:true} ));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Configure Handlebars
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper("navActivate", function(a, b) { return a == b; });

// Public stuff
app.use(express.static(path.join(__dirname, 'public')));

// Auth
require('./routes/auth.js')(app);

// Normal endpoints
app.get('/about', (req, res) => res.render('about', {'page': 'about'}));
app.get('/contact', (req, res) => res.render('contact', {'page': 'contact'}));
app.get('/post', (req, res) => res.render('post', {'page': 'post'}));

// Posting endpoints
app.use('/postings', require('./routes/postings'));
app.use('/submit-posting', require('./routes/submit-posting'));

// Default page behaviour -- root is landing page
// Any unrecognized endpoints get redirected to landing page
app.get('/', (req, res) => res.render('index', {'page': 'index'}));
app.get('*', (req, res) => {
    res.redirect('/');
});
app.listen(port, () => console.log(`Listening on port ${port}!`));

// var cors = require('cors');
// app.use(cors());
