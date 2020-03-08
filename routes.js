const DB_NAME = "test";

module.exports = function(app, client, templates) {
    const db = client.db(DB_NAME);

    // temporary endpoints
    app.use('/double', require('./server/double'));
    app.use('/mongo', require('./server/mongo')(db));
    
    app.use('/postings', require('./server/postings')(db, templates));
    app.use('/submit-posting', require('./server/submit-posting')(db));
};