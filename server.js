// Imports
var express = require('express');
var path = require('path');
var hbs = require('hbs');

// Constants
const port = process.env.PORT || 8000;

// Setup express server
var app = express();
app.use(express.json());
app.use(express.urlencoded( { extended:true} ));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Configure Handlebars
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
require('./views/helpers/helpers');

// Public stuff
app.use(express.static(path.join(__dirname, 'public')));

// Normal endpoints
app.get('/about', (req, res) => res.render('about', {'page': 'about'}));
app.get('/contact', (req, res) => res.render('contact', {'page': 'contact'}));
app.get('/makepost', (req, res) => res.render('makepost', {'page': 'makepost'}));

// Posting endpoints
app.use('/postings', require('./routes/postings'));
app.use('/submit-posting', require('./routes/submit-posting'));
app.use('/viewpost', require('./routes/viewpost'));

// Default page behaviour -- root is landing page
// Any unrecognized endpoints get redirected to landing page
app.get('/', (req, res) => res.render('index', {'page': 'index'}));
app.get('*', (req, res) => {
    res.redirect('/');
});
app.listen(port, () => console.log(`Listening on port ${port}!`));

// var cors = require('cors');
// app.use(cors());