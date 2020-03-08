var express = require('express')
var router = express.Router()

function isNumeric(num){
    return !isNaN(num);
}

router.get('/', function(req, res) {
    var ret = req.query;
    for (let key in ret) {
        if (isNumeric(ret[key])) {
            var num = parseInt(ret[key]);
            ret[key] = num*2;
        }
    }
    res.send(ret);
});

module.exports = router