var express = require('express');
var Images = require('../../model/images');

var router = express.Router();
router.get('/:id', async function(req, res) {
    var id = req.params.id.toString();
    try {
        var image = await Images.getImageB64(id);
    } catch (e) {
        return res.status(404).send(`Image not found`);
    }

    const img = Buffer.from(image, 'base64');

    res.writeHead(200, {
       'Content-Type': 'image/jpg',
       'Content-Length': img.length
    });

    res.end(img);
});

module.exports = router;