const DB_NAME = "test";

module.exports = function(app, client, templates) {
    const db = client.db(DB_NAME);    
    app.use('/postings', require('./server/postings')(db, templates));
    app.use('/submit-posting', require('./server/submit-posting')(db));
};